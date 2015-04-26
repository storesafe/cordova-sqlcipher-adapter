/* 'use strict'; */

var MYTIMEOUT = 20000;

var DEFAULT_SIZE = 5000000; // max to avoid popup in safari/ios

// XXX TODO replace in test(s):
function ok(test, desc) { expect(test).toBe(true); }
function equal(a, b, desc) { expect(a).toEqual(b); } // '=='
function strictEqual(a, b, desc) { expect(a).toBe(b); } // '==='

// XXX TODO NEED TO BE FIXED:
var wait = 0;
var test_it_done = null;
function xtest_it(desc, fun) { xit(desc, fun); }
function test_it(desc, fun) {
  wait = 0;
  it(desc, function(done) {
    test_it_done = done;
    fun();
  }, MYTIMEOUT);
}
function stop(n) {
  if (!!n) wait += n
  else ++wait;
}
function start(n) {
  if (!!n) wait -= n;
  else --wait;
  if (wait == 0) test_it_done();
}

var isAndroid = /Android/.test(navigator.userAgent);
var isWindows = /Windows NT/.test(navigator.userAgent); // Windows [NT] (8.1)
var isWP8 = /IEMobile/.test(navigator.userAgent); // WP(8)
// FUTURE:
//var isWindowsPhone = /Windows Phone 8.1/.test(navigator.userAgent); // Windows [NT] (8.1)
var isIE = isWindows || isWP8;
var isWebKit = !isIE; // TBD [Android or iOS]

var scenarioList = [ 'Plugin', 'HTML5' ];

var scenarioCount = isWebKit ? 2 : 1;

describe('encryption test(s)', function() {
    var suiteName = "sqlcipher: ";

    // NOTE: MUST be defined within [describe]function scope, NOT outer scope:
    var openDatabase = function(first, second, third, fourth, fifth, sixth) {
      return window.sqlitePlugin.openDatabase(first, second, third, fourth, fifth, sixth);
    }

    test_it(suiteName + "nested transaction test with encryption", function() {

        var db = openDatabase("nested-transaction-test-with-encryption.db", "1.0", "Demo", DEFAULT_SIZE);

        expect(db).toBeDefined();

        stop();

        db.transaction(function(tx) {
            expect(tx).toBeDefined();

            tx.executeSql('DROP TABLE IF EXISTS test_table');
            tx.executeSql('CREATE TABLE IF NOT EXISTS test_table (id integer primary key, data text, data_num integer)');

            tx.executeSql("INSERT INTO test_table (data, data_num) VALUES (?,?)", ["test", 100], function(tx, res) {
              console.log("insertId: " + res.insertId + " -- probably 1");
              console.log("rowsAffected: " + res.rowsAffected + " -- should be 1");

              expect(res).toBeDefined();
              if (!isWindows) // XXX TODO
                expect(res.insertId).toBeDefined();
              if (!isWindows) // XXX TODO
                expect(res.rowsAffected).toEqual(1);

              tx.executeSql("select count(id) as cnt from test_table;", [], function(tx, res) {
                console.log("res.rows.length: " + res.rows.length + " -- should be 1");
                console.log("res.rows.item(0).cnt: " + res.rows.item(0).cnt + " -- should be 1");

                equal(res.rows.length, 1, "res rows length");
                equal(res.rows.item(0).cnt, 1, "select count");

                start();
              });

            });

        });

    });

    test_it(suiteName + ' Open & read encrypted DB with same password', function () {
        var dbName = "Open-read-encrypted-DB-with-same-password.db";
        var test_data = "Test string to be stored with encryption";

        // async test:
        stop(2);

        openDatabase({name: dbName, key: 'test-password'}, function (db) {
            db.transaction(function(tx) {
              tx.executeSql('DROP TABLE IF EXISTS tt');
              tx.executeSql('CREATE TABLE IF NOT EXISTS tt (test_data)');
              tx.executeSql('INSERT INTO tt (test_data) VALUES (?)', [test_data]);
            }, function(error) {
              console.log('ERROR: ' + error.message);
              ok(false, error.message);
            }, function() {
              ok(true, 'DB populated OK');
              db.close(function () {
                openDatabase({name: dbName, key: 'test-password'}, function (db) {
                  ok(!!db, 'reopen DB same test-password');
                  start(1);

                  db.executeSql('SELECT * FROM tt', null, function(result) {
                    ok(!!result, 'result from encrypted DB');
                    ok(!!result.rows.item(0).test_data, 'got the test data from encrypted DB');
                    strictEqual(result.rows.item(0).test_data, test_data, 'correct test data from encrypted DB');
                    start(1);
                  }, function (error) {
                    ok(false, error.message);
                    start(1);
                  });

                }, function (error) {
                  ok(false, error.message);
                  start(1);
                });
              }, function (error) {
                ok(false, error.message);
                start(1);
              });
            });
        }, function (error) {
            ok(false, error.message);
            start(2);
        });
    });

    test_it(suiteName + ' Open encrypted DB with another password - should fail', function () {
        var dbName = "Encrypted-DB-reopen-with-another-password.db";

        stop();

        openDatabase({name: dbName, key: 'test-password'}, function (db) {
            // CREATE TABLE to put some contents into the DB:
            // XXX cannot close within db.executeSql() callback due to BUG
            //db.executeSql("CREATE TABLE IF NOT EXISTS tt (test_data)", [], function() {
            db.transaction(function(tx) {
              tx.executeSql("DROP TABLE IF EXISTS tt");
              tx.executeSql("CREATE TABLE IF NOT EXISTS tt (test_data)");
            }, function(error) {
              console.log("ERROR: " + error.message);
              ok(false, error.message);
            }, function() {
              db.close(function () {
                openDatabase({name: dbName, key: "another-password"}, function (db) {
                  ok(false, 'Open DB with another-password should not have succeeded');
                  start();
                }, function (error) {
                  // Expected/desired result:
                  ok(true, 'DB was succesfully encrypted with test-password');
                  ok(!!error, 'valid error object');
                  // XXX BROKEN:
                  //ok(!!error.message, 'should report a valid error message');
                  start();
                });
              }, function (error) {
                ok(false, error.message);
                start();
              });
            });
            //});
        }, function (error) {
            ok(false, error.message);
            start();
        });
    });

      test_it(suiteName + 'Attempt to open and read unencrypted DB with password key', function () {

        var dbName = 'Open-and-read-unencrypted-DB-with-password.db';
        stop();

        openDatabase({name: dbName}, function (db) {
            ok(!!db, 'valid db handle object');
            db.transaction(function(tx) {
              ok(!!tx, 'valid tx object');
              tx.executeSql('DROP TABLE IF EXISTS tt');
              tx.executeSql('CREATE TABLE IF NOT EXISTS tt (test_data)');
              tx.executeSql('INSERT INTO tt (test_data) VALUES (?)', ['test data']);
            }, function(error) {
              console.log('ERROR: ' + error.message);
              ok(false, 'tx error: ' + error.message);
              start();
            }, function() {
              ok(true, 'ready to close db');
              db.close(function () {
                ok(true, 'db is closed');

                var db1 = openDatabase({name: dbName, key: 'test-password'});
                db1.transaction(function(tx) {
                  // not expected (ignored):
                  tx.executeSql('SELECT 1');
                }, function(error) {
                  console.log('ERROR: ' + error.message);
                  ok(true, 'Attempted transaction on invalid db should fail');
                  ok(!!error, 'valid error object');
                  ok(!!error.message, 'should report a valid error message');
                  start();
                }, function() {
                  ok(false, 'Attempted transaction on invalid db should not succeed');
                  start();
                });
              }, function (error) {
                ok(false, 'error closing: ' + error.message);
                start();
              });
            });
        }, function (error) {
            ok(false, 'open error: ' + error.message);
            start();
        });
    });

});

/* vim: set expandtab : */
