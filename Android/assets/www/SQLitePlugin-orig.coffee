do ->
  root = @

  SQLitePlugin = (openargs, openSuccess, openError) ->
    console.log "SQLitePlugin"

    if !(openargs and openargs['name'])
      throw new Error("Cannot create a SQLitePlugin instance without a db name")

    dbname = openargs.name

    @openargs = openargs
    @dbname = dbname

    @openSuccess = openSuccess
    @openError = openError

    @openSuccess or
      @openSuccess = ->
        console.log "DB opened: " + dbname

    @openError or
      @openError = (e) ->
        console.log e.message

    @open @openSuccess, @openError
    return

  SQLitePlugin::databaseFeatures = isSQLitePluginDatabase: true
  SQLitePlugin::openDBs = {}

  # TBD old mechanism (going away):
  SQLitePlugin::batchTransaction = (fn, error, success) ->
    t = new SQLiteBatchTransaction(@dbname)
    fn t
    t.complete success, error
    return

  # TBD old mechanism (going away):
  SQLitePlugin::transaction = SQLitePlugin::batchTransaction

  SQLitePlugin::open = (success, error) ->
    console.log "SQLitePlugin.prototype.open"

    unless @dbname of @openDBs
      @openDBs[@dbname] = true
      cordova.exec success, error, "SQLitePlugin", "open", [ @openargs ]

    return

  # FUTURE (??):
  #SQLitePlugin::close = (success, error) ->
  #  console.log "SQLitePlugin.prototype.close"
  #  ..
  #  return

  # TBD (TODO) add implementation:
  #SQLitePlugin::executeSql = (statement, params, success, error) ->
  #  ..
  #  return

  get_unique_id = ->
    id = new Date().getTime()
    id2 = new Date().getTime()
    id2 = new Date().getTime()  while id is id2
    id2 + "000"

  queryQ = []
  queryCBQ = {}

  # TBD old mechanism (going away):
  SQLiteBatchTransaction = (dbname) ->
    @dbname = dbname
    @executes = []
    @trans_id = get_unique_id()
    @__completed = false
    @__submitted = false
    # TBD obsolete and going away:
    # this.optimization_no_nested_callbacks: default is true.
    # if set to true large batches of queries within a transaction will be much faster but 
    # you will lose the ability to do multi level nesting of executeSQL callbacks
    @optimization_no_nested_callbacks = true
    console.log "SQLiteBatchTransaction - this.trans_id:" + @trans_id
    queryQ[@trans_id] = []
    queryCBQ[@trans_id] = new Object()
    return

  SQLiteQueryCB = {}

  SQLiteQueryCB.queryCompleteCallback = (transId, queryId, result) ->
    console.log "SQLiteBatchTransaction.queryCompleteCallback"
    query = null
    for x of queryQ[transId]
      if queryQ[transId][x]["qid"] is queryId
        query = queryQ[transId][x]
        if queryQ[transId].length is 1
          queryQ[transId] = []
        else
          queryQ[transId].splice x, 1
        break
    query["callback"] result  if query and query["callback"]
    return

  SQLiteQueryCB.queryErrorCallback = (transId, queryId, result) ->
    query = null
    for x of queryQ[transId]
      if queryQ[transId][x]["qid"] is queryId
        query = queryQ[transId][x]
        if queryQ[transId].length is 1
          queryQ[transId] = []
        else
          queryQ[transId].splice x, 1
        break
    query["err_callback"] result  if query and query["err_callback"]
    return

  SQLiteQueryCB.txCompleteCallback = (transId) ->
    if typeof transId isnt "undefined"
      queryCBQ[transId]["success"]()  if transId and queryCBQ[transId] and queryCBQ[transId]["success"]
    else
      console.log "SQLiteBatchTransaction.txCompleteCallback---transId = NULL"
    return

  SQLiteQueryCB.txErrorCallback = (transId, error) ->
    if typeof transId isnt "undefined"
      console.log "SQLiteBatchTransaction.txErrorCallback---transId:" + transId
      queryCBQ[transId]["error"] error  if transId and queryCBQ[transId]["error"]
      delete queryQ[transId]

      delete queryCBQ[transId]
    else
      console.log "SQLiteBatchTransaction.txErrorCallback---transId = NULL"
    return

  SQLiteBatchTransaction::add_to_transaction = (trans_id, query, params, callback, err_callback) ->
    new_query = new Object()
    new_query["trans_id"] = trans_id

    if callback or not @optimization_no_nested_callbacks
      new_query["qid"] = get_unique_id()
    else
      if @optimization_no_nested_callbacks
        new_query["qid"] = ""

    new_query["sql"] = query

    if params
      new_query["params"] = params
    else
      new_query["params"] = []

    new_query["callback"] = callback
    new_query["err_callback"] = err_callback

    queryQ[trans_id] = []  unless queryQ[trans_id]
    queryQ[trans_id].push new_query
    return

  SQLiteBatchTransaction::executeSql = (sql, values, success, error) ->
    console.log "SQLiteBatchTransaction.prototype.executeSql"
    errorcb = undefined
    successcb = undefined
    txself = undefined
    txself = this
    successcb = null
    if success
      console.log "success not null:" + sql
      successcb = (execres) ->
        console.log "executeSql callback:" + JSON.stringify(execres)
        res = undefined
        #saveres = undefined
        saveres = execres
        #saveres = execres.rows
        res1 =
          rows:
            item: (i) ->
              saveres[i]

            length: saveres.length

        res =
          rowsAffected: saveres.rowsAffected
          insertId: saveres.insertId or null

        if !!execres.rows
          res["rows"] =
            item: (i) ->
              saveres.rows[i]

            length: saveres.rows.length

        success txself, res
    else
      console.log "success NULL:" + sql
    errorcb = null
    if error
      errorcb = (res) ->
        error txself, res

    console.log "executeSql - add_to_transaction" + sql
    @add_to_transaction @trans_id, sql, values, successcb, errorcb

    return

  SQLiteBatchTransaction::complete = (success, error) ->
    console.log "SQLiteBatchTransaction.prototype.complete"

    throw new Error("Transaction already run")  if @__completed
    throw new Error("Transaction already submitted")  if @__submitted

    @__submitted = true
    txself = this

    successcb = ->
      if queryQ[txself.trans_id].length > 0 and not txself.optimization_no_nested_callbacks
        txself.__submitted = false
        txself.complete success, error
      else
        @__completed = true
        success txself  if success

    errorcb = (res) -> null

    if error
      errorcb = (res) ->
        error txself, res

    queryCBQ[@trans_id]["success"] = successcb
    queryCBQ[@trans_id]["error"] = errorcb

    cordova.exec null, null, "SQLitePlugin", "executeBatchTransaction", [ {dbargs: {dbname: @dbname}, executes: queryQ[@trans_id]} ]
    return

  SQLiteFactory =
    # NOTE: this function should NOT be translated from Javascript
    # back to CoffeeScript by js2coffee.
    # If this function is edited in Javascript then someone will
    # have to translate it back to CoffeeScript by hand.
    opendb: ->
      if arguments.length < 1 then return null

      first = arguments[0]
      openargs = null
      okcb = null
      errorcb = null

      if first.constructor == String
        openargs = {name: first}

        if arguments.length >= 5
          okcb = arguments[4]
          if arguments.length > 5 then errorcb = arguments[5]

      else
        openargs = first

        if arguments.length >= 2
          okcb = arguments[1]
          if arguments.length > 2 then errorcb = arguments[2]

      new SQLitePlugin openargs, okcb, errorcb

  # required for callbacks:
  root.SQLiteQueryCB = SQLiteQueryCB

  root.sqlitePlugin =
    sqliteFeatures:
      isSQLitePlugin: true

    openDatabase: SQLiteFactory.opendb

