(function() {
  var SQLiteBatchTransaction, SQLiteBatchTransactionCB, SQLiteFactory, SQLitePlugin, SQLitePluginTransaction, SQLiteQueryCB, SQLiteTransactionCB, get_uniqid, get_unique_id, queryCBQ, queryQ, root, trcbq, uid;
  root = this;
  SQLitePlugin = function(openargs, openSuccess, openError) {
    var dbname;
    console.log("SQLitePlugin");
    if (!(openargs && openargs['name'])) {
      throw new Error("Cannot create a SQLitePlugin instance without a db name");
    }
    dbname = openargs.name;
    this.openargs = openargs;
    this.dbname = dbname;
    this.openSuccess = openSuccess;
    this.openError = openError;
    this.openSuccess || (this.openSuccess = function() {
      return console.log("DB opened: " + dbname);
    });
    this.openError || (this.openError = function(e) {
      return console.log(e.message);
    });
    this.open(this.openSuccess, this.openError);
  };
  SQLitePlugin.prototype.databaseFeatures = {
    isSQLitePluginDatabase: true
  };
  SQLitePlugin.prototype.openDBs = {};
  SQLitePlugin.prototype.txQ = [];
  SQLitePlugin.prototype.transaction = function(fn, error, success) {
    var t;
    t = new SQLitePluginTransaction(this, fn, error, success);
    this.txQ.push(t);
    if (this.txQ.length === 1) {
      t.start();
    }
  };
  SQLitePlugin.prototype.startNextTransaction = function() {
    this.txQ.shift();
    if (this.txQ[0]) {
      this.txQ[0].start();
    }
  };
  SQLitePlugin.prototype.batchTransaction = function(fn, error, success) {
    var t;
    t = new SQLiteBatchTransaction(this.dbname);
    fn(t);
    t.complete(success, error);
  };
  SQLitePlugin.prototype.open = function(success, error) {
    console.log("SQLitePlugin.prototype.open");
    if (!(this.dbname in this.openDBs)) {
      this.openDBs[this.dbname] = true;
      cordova.exec(success, error, "SQLitePlugin", "open", [this.openargs]);
    }
  };
  get_uniqid = function() {
    var id, id2;
    id = new Date().getTime();
    id2 = new Date().getTime();
    while (id === id2) {
      id2 = new Date().getTime();
    }
    return id2 + "000";
  };
  queryQ = [];
  queryCBQ = {};
  SQLiteBatchTransaction = function(dbname) {
    this.dbname = dbname;
    this.executes = [];
    this.trans_id = get_uniqid();
    this.__completed = false;
    this.__submitted = false;
    this.optimization_no_nested_callbacks = true;
    console.log("SQLiteBatchTransaction - this.trans_id:" + this.trans_id);
    queryQ[this.trans_id] = [];
    queryCBQ[this.trans_id] = new Object();
  };
  SQLiteQueryCB = {};
  SQLiteQueryCB.queryCompleteCallback = function(transId, queryId, result) {
    var query, x;
    console.log("SQLiteBatchTransaction.queryCompleteCallback");
    query = null;
    for (x in queryQ[transId]) {
      if (queryQ[transId][x]["qid"] === queryId) {
        query = queryQ[transId][x];
        if (queryQ[transId].length === 1) {
          queryQ[transId] = [];
        } else {
          queryQ[transId].splice(x, 1);
        }
        break;
      }
    }
    if (query && query["callback"]) {
      query["callback"](result);
    }
  };
  SQLiteQueryCB.queryErrorCallback = function(transId, queryId, result) {
    var query, x;
    query = null;
    for (x in queryQ[transId]) {
      if (queryQ[transId][x]["qid"] === queryId) {
        query = queryQ[transId][x];
        if (queryQ[transId].length === 1) {
          queryQ[transId] = [];
        } else {
          queryQ[transId].splice(x, 1);
        }
        break;
      }
    }
    if (query && query["err_callback"]) {
      query["err_callback"](result);
    }
  };
  SQLiteQueryCB.txCompleteCallback = function(transId) {
    if (typeof transId !== "undefined") {
      if (transId && queryCBQ[transId] && queryCBQ[transId]["success"]) {
        queryCBQ[transId]["success"]();
      }
    } else {
      console.log("SQLiteBatchTransaction.txCompleteCallback---transId = NULL");
    }
  };
  SQLiteQueryCB.txErrorCallback = function(transId, error) {
    if (typeof transId !== "undefined") {
      console.log("SQLiteBatchTransaction.txErrorCallback---transId:" + transId);
      if (transId && queryCBQ[transId]["error"]) {
        queryCBQ[transId]["error"](error);
      }
      delete queryQ[transId];
      delete queryCBQ[transId];
    } else {
      console.log("SQLiteBatchTransaction.txErrorCallback---transId = NULL");
    }
  };
  SQLiteBatchTransactionCB = {};
  SQLiteBatchTransactionCB.batchCompleteCallback = function(cbr) {
    var qresult, transId, _i, _len, _ref, _results;
    transId = cbr.trid;
    _ref = cbr.result;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      qresult = _ref[_i];
      if (qresult.type === "success") {
        _results.push(SQLiteQueryCB.queryCompleteCallback(transId, qresult.qid, qresult.result));
      } else {
        _results.push(SQLiteQueryCB.queryErrorCallback(transId, qresult.qid, qresult.result));
      }
    }
    return _results;
  };
  SQLiteBatchTransaction.prototype.add_to_transaction = function(trans_id, query, params, callback, err_callback) {
    var new_query;
    new_query = new Object();
    new_query["trans_id"] = trans_id;
    if (callback || !this.optimization_no_nested_callbacks) {
      new_query["qid"] = get_uniqid();
    } else {
      if (this.optimization_no_nested_callbacks) {
        new_query["qid"] = "";
      }
    }
    new_query["sql"] = query;
    if (params) {
      new_query["params"] = params;
    } else {
      new_query["params"] = [];
    }
    new_query["callback"] = callback;
    new_query["err_callback"] = err_callback;
    if (!queryQ[trans_id]) {
      queryQ[trans_id] = [];
    }
    queryQ[trans_id].push(new_query);
  };
  SQLiteBatchTransaction.prototype.executeSql = function(sql, values, success, error) {
    var errorcb, successcb, txself;
    console.log("SQLiteBatchTransaction.prototype.executeSql");
    errorcb = void 0;
    successcb = void 0;
    txself = void 0;
    txself = this;
    successcb = null;
    if (success) {
      console.log("success not null:" + sql);
      successcb = function(execres) {
        var res, res1, saveres;
        console.log("executeSql callback:" + JSON.stringify(execres));
        res = void 0;
        saveres = execres;
        res1 = {
          rows: {
            item: function(i) {
              return saveres[i];
            },
            length: saveres.length
          }
        };
        res = {
          rowsAffected: saveres.rowsAffected,
          insertId: saveres.insertId || null
        };
        if (!!execres.rows) {
          res["rows"] = {
            item: function(i) {
              return saveres.rows[i];
            },
            length: saveres.rows.length
          };
        }
        return success(txself, res);
      };
    } else {
      console.log("success NULL:" + sql);
    }
    errorcb = null;
    if (error) {
      errorcb = function(res) {
        return error(txself, res);
      };
    }
    console.log("executeSql - add_to_transaction" + sql);
    this.add_to_transaction(this.trans_id, sql, values, successcb, errorcb);
  };
  SQLiteBatchTransaction.prototype.complete = function(success, error) {
    var errorcb, successcb, txself;
    console.log("SQLiteBatchTransaction.prototype.complete");
    if (this.__completed) {
      throw new Error("Transaction already run");
    }
    if (this.__submitted) {
      throw new Error("Transaction already submitted");
    }
    this.__submitted = true;
    txself = this;
    successcb = function() {
      if (queryQ[txself.trans_id].length > 0 && !txself.optimization_no_nested_callbacks) {
        txself.__submitted = false;
        return txself.complete(success, error);
      } else {
        this.__completed = true;
        if (success) {
          return success(txself);
        }
      }
    };
    errorcb = function(res) {
      return null;
    };
    if (error) {
      errorcb = function(res) {
        return error(txself, res);
      };
    }
    queryCBQ[this.trans_id]["success"] = successcb;
    queryCBQ[this.trans_id]["error"] = errorcb;
    cordova.exec(null, null, "SQLitePlugin", "executeBatchTransaction", [
      {
        dbargs: {
          dbname: this.dbname
        },
        executes: queryQ[this.trans_id]
      }
    ]);
  };
  uid = 1000;
  get_unique_id = function() {
    return ++uid;
  };
  trcbq = {};
  SQLitePluginTransaction = function(db, fn, error, success) {
    this.trid = get_unique_id();
    trcbq[this.trid] = {};
    if (typeof fn !== "function") {
      throw new Error("transaction expected a function");
    }
    this.db = db;
    this.fn = fn;
    this.error = error;
    this.success = success;
    this.executes = [];
    this.executeSql("BEGIN", [], null, function(tx, err) {
      throw new Error("unable to begin transaction: " + err.message);
    });
  };
  SQLiteTransactionCB = {
    batchCompleteCallback: function(cbResult) {
      var q, qid, r, res, result, t, trid, type, _i, _len;
      console.log("SQLiteTransactionCB.batchCompleteCallback cbResult " + (JSON.stringify(cbResult)));
      trid = cbResult.trid;
      result = cbResult.result;
      for (_i = 0, _len = result.length; _i < _len; _i++) {
        r = result[_i];
        type = r.type;
        qid = r.qid;
        res = r.result;
        t = trcbq[trid];
        if (t) {
          q = t[qid];
          if (q) {
            if (q[type]) {
              q[type](res);
            }
            delete trcbq[trid][qid];
          }
        }
      }
    }
  };
  SQLitePluginTransaction.prototype.start = function() {
    var err;
    try {
      if (!this.fn) {
        return;
      }
      this.fn(this);
      this.fn = null;
      this.run();
    } catch (_error) {
      err = _error;
      this.db.startNextTransaction();
      if (this.error) {
        this.error(err);
      }
    }
  };
  SQLitePluginTransaction.prototype.executeSql = function(sql, values, success, error) {
    var qid;
    qid = get_unique_id();
    this.executes.push({
      success: success,
      error: error,
      qid: qid,
      sql: sql,
      params: values
    });
  };
  SQLitePluginTransaction.prototype.handleStatementSuccess = function(handler, response) {
    var payload, rows;
    if (!handler) {
      return;
    }
    rows = response.rows || [];
    payload = {
      rows: {
        item: function(i) {
          return rows[i];
        },
        length: rows.length
      },
      rowsAffected: response.rowsAffected || 0,
      insertId: response.insertId || void 0
    };
    handler(this, payload);
  };
  SQLitePluginTransaction.prototype.handleStatementFailure = function(handler, response) {
    if (!handler) {
      throw new Error("a statement with no error handler failed: " + response.message);
    }
    if (handler(this, response)) {
      throw new Error("a statement error callback did not return false");
    }
  };
  SQLitePluginTransaction.prototype.run = function() {
    var batchExecutes, handlerFor, i, qid, request, tropts, tx, txFailure, waiting;
    txFailure = null;
    tropts = [];
    batchExecutes = this.executes;
    waiting = batchExecutes.length;
    this.executes = [];
    tx = this;
    handlerFor = function(index, didSucceed) {
      return function(response) {
        var err;
        try {
          if (didSucceed) {
            tx.handleStatementSuccess(batchExecutes[index].success, response);
          } else {
            tx.handleStatementFailure(batchExecutes[index].error, response);
          }
        } catch (_error) {
          err = _error;
          if (!txFailure) {
            txFailure = err;
          }
        }
        if (--waiting === 0) {
          if (txFailure) {
            return tx.rollBack(txFailure);
          } else if (tx.executes.length > 0) {
            return tx.run();
          } else {
            return tx.commit();
          }
        }
      };
    };
    i = 0;
    while (i < batchExecutes.length) {
      request = batchExecutes[i];
      qid = request.qid;
      trcbq[this.trid][qid] = {
        success: handlerFor(i, true),
        error: handlerFor(i, false)
      };
      tropts.push({
        qid: qid,
        query: [request.sql].concat(request.params),
        trans_id: this.trid,
        sql: request.sql,
        params: request.params || []
      });
      i++;
    }
    cordova.exec(null, null, "SQLitePlugin", "executeBatchTransaction", [
      {
        dbargs: {
          dbname: this.db.dbname
        },
        executes: tropts
      }
    ]);
  };
  SQLitePluginTransaction.prototype.rollBack = function(txFailure) {
    var failed, succeeded, tx;
    if (this.finalized) {
      return;
    }
    tx = this;
    succeeded = function() {
      delete trcbq[this.trid];
      tx.db.startNextTransaction();
      if (tx.error) {
        return tx.error(txFailure);
      }
    };
    failed = function(tx, err) {
      delete trcbq[this.trid];
      tx.db.startNextTransaction();
      if (tx.error) {
        return tx.error(new Error("error while trying to roll back: " + err.message));
      }
    };
    this.finalized = true;
    this.executeSql("ROLLBACK", [], succeeded, failed);
    this.run();
  };
  SQLitePluginTransaction.prototype.commit = function() {
    var failed, succeeded, tx;
    if (this.finalized) {
      return;
    }
    tx = this;
    succeeded = function() {
      delete trcbq[this.trid];
      tx.db.startNextTransaction();
      if (tx.success) {
        return tx.success();
      }
    };
    failed = function(tx, err) {
      delete trcbq[this.trid];
      tx.db.startNextTransaction();
      if (tx.error) {
        return tx.error(new Error("error while trying to commit: " + err.message));
      }
    };
    this.finalized = true;
    this.executeSql("COMMIT", [], succeeded, failed);
    this.run();
  };
  SQLiteFactory = {
    opendb: function() {
      var errorcb, first, okcb, openargs;
      if (arguments.length < 1) {
        return null;
      }
      first = arguments[0];
      openargs = null;
      okcb = null;
      errorcb = null;
      if (first.constructor === String) {
        openargs = {
          name: first
        };
        if (arguments.length >= 5) {
          okcb = arguments[4];
          if (arguments.length > 5) {
            errorcb = arguments[5];
          }
        }
      } else {
        openargs = first;
        if (arguments.length >= 2) {
          okcb = arguments[1];
          if (arguments.length > 2) {
            errorcb = arguments[2];
          }
        }
      }
      return new SQLitePlugin(openargs, okcb, errorcb);
    }
  };
  root.SQLiteTransactionCB = SQLiteTransactionCB;
  return root.sqlitePlugin = {
    sqliteFeatures: {
      isSQLitePlugin: true
    },
    openDatabase: SQLiteFactory.opendb
  };
})();
