/*
 * Copyright (c) 2012-2014, Chris Brody
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2010, IBM Corporation
 */

// XXX (TODO) move out of com.phonegap package:
package com.phonegap.plugin.sqlitePlugin;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.lang.Number;

import org.apache.cordova.api.CordovaPlugin;
import org.apache.cordova.api.CallbackContext;

import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.*;

import android.util.Log;

public class SQLitePlugin extends CordovaPlugin
{
	// XXX (TODO) support multiple databases:
	SQLiteDatabase myDb = null; // Database object

	/**
	 * NOTE: Using default constructor (no explicit constructor is required).
	 */

	/**
	 * Executes the request and returns PluginResult.
	 *
	 * @param action
	 *            The action to execute.
	 *
	 * @param args
	 *            JSONArry of arguments for the plugin.
	 *
	 * @param cbc
	 *            Callback context from Cordova API (not used [yet])
	 *
	 */
	@Override
	public boolean execute(String action, JSONArray args, CallbackContext cbc)
	{
		try {
			if (action.equals("open")) {
				this.openDatabase(args.getString(0), "1",
						"database", 5000000);
			} 
			else if (action.equals("executeSqlBatch")) 
			{
				String[] 	queries 	= null;
				String[] 	queryIDs 	= null;
				String 		trans_id 	= null;
				JSONObject 	a 			= null;
				JSONArray 	jsonArr 	= null;
				int 		paramLen	= 0;
				JSONArray[] 	jsonparams 	= null;
				
				if (args.isNull(0)) {
					queries = new String[0];
				} else {
					int len = args.length();
					queries = new String[len];
					queryIDs = new String[len];
					jsonparams = new JSONArray[len];

					for (int i = 0; i < len; i++)
					{
						a 			= args.getJSONObject(i);
						queries[i] 	= a.getString("query");
						queryIDs[i] = a.getString("query_id");
						trans_id 	= a.getString("trans_id");
						jsonArr 	= a.getJSONArray("params");
						paramLen	= jsonArr.length();
						jsonparams[i] 	= jsonArr;
					}
				}
				if(trans_id != null)
					this.executeSqlBatch(queries, jsonparams, queryIDs, trans_id);
				else
					Log.v("error", "null trans_id");
			}
			return true;
		} catch (JSONException e) {
			return false;
		}
	}

	/**
	 * Clean up and close database.
	 */
	@Override
	public void onDestroy() {
		// XXX (TODO) support multiple databases:
		if (this.myDb != null) {
			this.myDb.close();
			this.myDb = null;
		}
	}

	// --------------------------------------------------------------------------
	// LOCAL METHODS
	// --------------------------------------------------------------------------

	/**
	 * Open a database.
	 *
	 * @param db
	 *            The name of the database including its extension.
	 * @param version
	 *            The version
	 * @param display_name
	 *            The display name
	 * @param size
	 *            The size in bytes
	 */
	public void openDatabase(String db, String version, String display_name,
			long size) {

		// If database is open, then close it
		if (this.myDb != null) {
			this.myDb.close();
		}

		this.myDb = this.cordova.getActivity().getApplicationContext().openOrCreateDatabase(db + ".db", Context.MODE_PRIVATE, null);
	}

	public void executeSqlBatch(String[] queryarr, JSONArray[] jsonparams, String[] queryIDs, String tx_id) {
		try {
			this.myDb.beginTransaction();
			String query = "";
			String query_id = "";
			int len = queryarr.length;
			for (int i = 0; i < len; i++) {
				query = queryarr[i];
				query_id = queryIDs[i];
				if (query.toLowerCase().startsWith("insert") && jsonparams != null) {
					SQLiteStatement myStatement = this.myDb.compileStatement(query);
					for (int j = 0; j < jsonparams[i].length(); j++) {
						if (jsonparams[i].get(j) instanceof Float || jsonparams[i].get(j) instanceof Double ) {
							myStatement.bindDouble(j + 1, jsonparams[i].getDouble(j));
						} else if (jsonparams[i].get(j) instanceof Number) {
							myStatement.bindLong(j + 1, jsonparams[i].getLong(j));
						} else {
							myStatement.bindString(j + 1, jsonparams[i].getString(j));
						}
					}
					long insertId = myStatement.executeInsert();

					String result = "{'insertId':'" + insertId + "'}";
					this.webView.sendJavascript("SQLitePluginTransaction.queryCompleteCallback('" + tx_id + "','" + query_id + "', " + result + ");");
				} else {
					String[] params = null;

					if (jsonparams != null) {
						params = new String[jsonparams[i].length()];

						for (int j = 0; j < jsonparams[i].length(); j++) {
							params[j] = jsonparams[i].getString(j);
							if(params[j] == "null") // XXX (TODO) better check
								params[j] = "";
						}
					}

					Cursor myCursor = this.myDb.rawQuery(query, params);

					this.processResults(myCursor, query_id, tx_id);
					myCursor.close();
				}
			}
			this.myDb.setTransactionSuccessful();
		}
		catch (SQLiteException ex) {
			ex.printStackTrace();
			Log.v("executeSqlBatch", "SQLitePlugin.executeSql(): Error=" +  ex.getMessage());
			this.webView.sendJavascript("SQLitePluginTransaction.txErrorCallback('" + tx_id + "', '"+ex.getMessage()+"');");
		} catch (JSONException ex) {
			ex.printStackTrace();
			Log.v("executeSqlBatch", "SQLitePlugin.executeSql(): Error=" +  ex.getMessage());
			this.webView.sendJavascript("SQLitePluginTransaction.txErrorCallback('" + tx_id + "', '"+ex.getMessage()+"');");
		}
		finally {
			this.myDb.endTransaction();
			Log.v("executeSqlBatch", tx_id);
			this.webView.sendJavascript("SQLitePluginTransaction.txCompleteCallback('" + tx_id + "');");
		}
	}

	/**
	 * Process query results.
	 *
	 * @param cur
	 *            Cursor into query results
	 * @param tx_id
	 *            Transaction id
	 */
	public void processResults(Cursor cur, String query_id, String tx_id) {

		String result = "[]";
		// If query result has rows

		if (cur.moveToFirst()) {
			JSONArray fullresult = new JSONArray();
			String key = "";
			int colCount = cur.getColumnCount();

			// Build up JSON result object for each row
			do {
				JSONObject row = new JSONObject();
				try {
					for (int i = 0; i < colCount; ++i) {
						key = cur.getColumnName(i);
						// for old Android SDK remove lines from HERE:
						if(android.os.Build.VERSION.SDK_INT >= 11)
						{
							switch(cur.getType (i))
							{
								case Cursor.FIELD_TYPE_NULL:
									row.put(key, null);
									break;
								case Cursor.FIELD_TYPE_INTEGER:
									row.put(key, cur.getInt(i));
									break;
								case Cursor.FIELD_TYPE_FLOAT:
									row.put(key, cur.getFloat(i));
									break;
								case Cursor.FIELD_TYPE_STRING:
									row.put(key, cur.getString(i));
									break;
								case Cursor.FIELD_TYPE_BLOB:
									// XXX (TODO) Base64 encode blob fields:
									row.put(key, cur.getBlob(i));
									break;
							}
						}
						else // to HERE.
						{
							row.put(key, cur.getString(i));
						}
					}
					fullresult.put(row);

				} catch (JSONException e) {
					e.printStackTrace();
				}

			} while (cur.moveToNext());

			result = fullresult.toString();
		}
		if(query_id.length() > 0)
			this.webView.sendJavascript("SQLitePluginTransaction.queryCompleteCallback('" + tx_id + "','" + query_id + "', " + result + ");");

	}
}
