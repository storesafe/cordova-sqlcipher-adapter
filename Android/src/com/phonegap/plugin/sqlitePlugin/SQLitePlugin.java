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
import java.util.HashMap;

// XXX NOTE: this is changed in Cordova 3.x:
import org.apache.cordova.api.CordovaPlugin;
import org.apache.cordova.api.CallbackContext;

import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.*;

import android.util.Log;

public class SQLitePlugin extends CordovaPlugin
{
	/**
	 * Multiple database hash map.
	 */
	HashMap<String, SQLiteDatabase> dbmap = new HashMap<String, SQLiteDatabase>();

	/**
	 * NOTE: Using default constructor (no explicit constructor is required).
	 */

	/**
	 * Executes the request and returns boolean result.
	 *
	 * @param action
	 *            The action to execute.
	 *
	 * @param args
	 *            JSONArry of arguments for the plugin.
	 *
	 * @param cbc
	 *            Cordova callback context
	 *
	 */
	@Override
	public boolean execute(String action, JSONArray args, CallbackContext cbc)
	{
		try {
			if (action.equals("open")) {
				JSONObject o = args.getJSONObject(0);
				String dbname = o.getString("name");

				this.openDatabase(dbname);
			}
			else if (action.equals("executeSqlBatch")) // TBD (TODO) support background (properly)
			{
				String[] 	queries 	= null;
				String[] 	queryIDs 	= null;

				JSONArray 	jsonArr 	= null;
				int 		paramLen	= 0;
				JSONArray[] 	jsonparams 	= null;

				JSONObject allargs = args.getJSONObject(0);
				JSONObject dbargs = allargs.getJSONObject("dbargs");
				String dbName = dbargs.getString("dbname");
				JSONArray txargs = allargs.getJSONArray("executes");

				if (txargs.isNull(0)) {
					queries = new String[0];
				} else {
					int len = txargs.length();
					queries = new String[len];
					queryIDs = new String[len];
					jsonparams = new JSONArray[len];

					for (int i = 0; i < len; i++)
					{
						JSONObject a	= txargs.getJSONObject(i);
						queries[i] 	= a.getString("sql");
						queryIDs[i] = a.getString("qid");
						jsonArr 	= a.getJSONArray("params");
						paramLen	= jsonArr.length();
						jsonparams[i] 	= jsonArr;
					}
				}

				this.executeSqlBatch(dbName, queries, jsonparams, queryIDs, cbc);
			}
			// XXX TODO else signal unrecognized action

			return true;
		} catch (JSONException e) {
			// TODO: signal JSON problem to JS

			return false;
		}
	}

	/**
	 *
	 * Clean up and close all open databases.
	 *
	 */
	@Override
	public void onDestroy() {
		while (!dbmap.isEmpty()) {
			String dbname = dbmap.keySet().iterator().next();
			this.closeDatabase(dbname);
			dbmap.remove(dbname);
		}
	}

	// --------------------------------------------------------------------------
	// LOCAL METHODS
	// --------------------------------------------------------------------------

	/**
	 * Open a database.
	 *
	 * @param dbname
	 *            The name of the database file
	 *
	 */
	private void openDatabase(String dbname)
	{
		if (this.getDatabase(dbname) != null) this.closeDatabase(dbname);

		// FUTURE TBD SQLITE_OPEN_CREATE should be optional:
		SQLiteDatabase mydb = this.cordova.getActivity().getApplicationContext().openOrCreateDatabase(dbname, Context.MODE_PRIVATE, null);

		dbmap.put(dbname, mydb);
	}

	/**
	 * Close a database.
	 *
	 * @param dbName
	 *            The name of the database file
	 *
	 */
	private void closeDatabase(String dbName)
	{
		SQLiteDatabase mydb = this.getDatabase(dbName);

		if (mydb != null)
		{
			mydb.close();
			dbmap.remove(dbName);
		}
	}

	/**
	 * Get a database from the db map.
	 *
	 * @param dbname
	 *            The name of the database.
	 *
	 */
	private SQLiteDatabase getDatabase(String dbname)
	{
		return dbmap.get(dbname);
	}

	/**
	 * Executes a batch request and sends the results via the Cordova callback context.
	 *
	 * @param dbname
	 *            The name of the database.
	 *
	 * @param queryarr
	 *            Array of query strings
	 *
	 * @param jsonparams
	 *            Array of JSON query parameters
	 *
	 * @param queryIDs
	 *            Array of query ids
	 *
	 * @param cbc
	 *            Cordova callback context
	 *
	 */
	private void executeSqlBatch(String dbname, String[] queryarr, JSONArray[] jsonparams, String[] queryIDs, CallbackContext cbc)
	{
		SQLiteDatabase mydb = this.getDatabase(dbname);

		if (mydb == null) return;

		String query = "";
		String query_id = "";
		int len = queryarr.length;

		JSONArray batchResults = new JSONArray();

		for (int i = 0; i < len; i++) {
			query_id = queryIDs[i];

			JSONObject queryResult = null;
			String errorMessage = null;

			try {
				query = queryarr[i];

				if (query.toLowerCase().startsWith("insert") && jsonparams != null) {
					SQLiteStatement myStatement = mydb.compileStatement(query);

					for (int j = 0; j < jsonparams[i].length(); j++) {
						if (jsonparams[i].get(j) instanceof Float || jsonparams[i].get(j) instanceof Double ) {
							myStatement.bindDouble(j + 1, jsonparams[i].getDouble(j));
						} else if (jsonparams[i].get(j) instanceof Number) {
							myStatement.bindLong(j + 1, jsonparams[i].getLong(j));
						// XXX (TODO) handle jsonparams[i].isNull(j)
						} else {
							myStatement.bindString(j + 1, jsonparams[i].getString(j));
						}
					}
					long insertId = myStatement.executeInsert();

					queryResult = new JSONObject();
					queryResult.put("insertId", insertId);
					// TODO get & put correct rowsAffected [not always 1 !!]
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

					Cursor myCursor = mydb.rawQuery(query, params);

					if (query_id.length() > 0) {
						queryResult = this.getRowsResultFromQuery(myCursor);
					}

					myCursor.close();
				}
			} catch (Exception ex) {
				ex.printStackTrace();
				errorMessage = ex.getMessage();
				Log.v("executeSqlBatch", "SQLitePlugin.executeSql[Batch](): Error=" +  errorMessage);
			}

			try {
				if (queryResult != null) {
					JSONObject r = new JSONObject();
					r.put("qid", query_id);

					r.put("type", "success");
					r.put("result", queryResult);

					batchResults.put(r);
				} else if (errorMessage != null) {
					JSONObject r = new JSONObject();
					r.put("qid", query_id);

					r.put("type", "error");
					r.put("result", errorMessage);

					batchResults.put(r);
				}
			} catch (JSONException ex) {
				ex.printStackTrace();
				Log.v("executeSqlBatch", "SQLitePlugin.executeSql[Batch](): Error=" +  ex.getMessage());
				// TODO what to do?
			}
		}

		cbc.success(batchResults);
	}

	/**
	 * Get rows results from query cursor.
	 *
	 * @param cur
	 *            Cursor into query results
	 *
	 * @return row results (as JSON object)
	 *
	 */
	private JSONObject getRowsResultFromQuery(Cursor cur)
	{
		JSONObject rowsResult = new JSONObject();

		// If query result has rows:
		if (cur.moveToFirst()) {
			JSONArray rowsArrayResult = new JSONArray();
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
									// XXX (TODO) put JSON NULL:
									row.put(key, null);
									break;
								case Cursor.FIELD_TYPE_INTEGER:
									// XXX (TODO) fix for 64-bit:
									row.put(key, cur.getInt(i));
									break;
								case Cursor.FIELD_TYPE_FLOAT:
									// XXX (TODO) fix for 64-bit:
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

					rowsArrayResult.put(row);

				} catch (JSONException e) {
					e.printStackTrace();
				}

			} while (cur.moveToNext());

			try {
				rowsResult.put("rows", rowsArrayResult);
			} catch (JSONException e) {
				e.printStackTrace();
			}
		}

		return rowsResult;
	}
}
