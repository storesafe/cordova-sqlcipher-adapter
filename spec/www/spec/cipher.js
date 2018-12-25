/* 'use strict'; */

// TBD Extra-long timeout needed for Windows 10 mobile device (is this due to libTomCrypt?)
// var MYTIMEOUT = 20000;
var MYTIMEOUT = 120000;

var DEFAULT_SIZE = 5000000; // max to avoid popup in safari/ios

var isWindows = /Windows /.test(navigator.userAgent); // Windows (...)
var isAndroid = !isWindows && /Android/.test(navigator.userAgent);

describe('cipher (SQLCipher) encryption test(s)', function() {
    var suiteName = "sqlcipher: ";

    // XXX TODO fix tests instead.
    // NOTE: MUST be defined within [describe]function scope, NOT outer scope:
    var openDatabase = function(first, second, third, fourth, fifth, sixth) {
      //return window.sqlitePlugin.openDatabase(first, second, third, fourth, fifth, sixth);
      return (typeof first === "string") ? window.sqlitePlugin.openDatabase({name: first, location: 'default'}) :
        (!!first.key) ? window.sqlitePlugin.openDatabase({name: first.name, key: first.key, location: 'default'}, second, third) :
          window.sqlitePlugin.openDatabase({name: first.name, location: 'default'}, second, third);
    }

      it(suiteName + "nested transaction test with encryption", function(done) {
        var db = openDatabase("nested-transaction-test-with-encryption.db", "1.0", "Demo", DEFAULT_SIZE);

        expect(db).toBeDefined();

        db.transaction(function(tx) {
            expect(tx).toBeDefined();

            tx.executeSql('DROP TABLE IF EXISTS test_table');
            tx.executeSql('CREATE TABLE IF NOT EXISTS test_table (id integer primary key, data text, data_num integer)');

            tx.executeSql("INSERT INTO test_table (data, data_num) VALUES (?,?)", ["test", 100], function(tx, rs1) {
              expect(rs1).toBeDefined();
              expect(rs1.insertId).toBeDefined();
              expect(rs1.insertId).toBe(1);
              expect(rs1.rowsAffected).toBe(1);

              tx.executeSql("select count(id) as cnt from test_table;", [], function(tx, rs2) {
                expect(rs2).toBeDefined();
                expect(rs2.rows).toBeDefined();
                expect(rs2.rows.length).toBe(1);
                expect(rs2.rows.item(0).cnt).toBe(1);
                done();
              });

            });

        });

      });

      it(suiteName + ' Open & read encrypted DB with same password', function (done) {
        var dbName = "Open-read-encrypted-DB-with-same-password.db";
        var test_data = "Test string to be stored with encryption";

        openDatabase({name: dbName, key: 'test-password'}, function (db) {
            // CREATE TABLE & INSERT some contents into the DB:
            db.sqlBatch([
              'DROP TABLE IF EXISTS tt',
              'CREATE TABLE IF NOT EXISTS tt (test_data)',
              ['INSERT INTO tt (test_data) VALUES (?)', [test_data]]
            ], function() {
              db.close(function () {
                openDatabase({name: dbName, key: 'test-password'}, function (db) {
                  expect(db).toBeDefined();

                  db.executeSql('SELECT * FROM tt', null, function(rs) {
                    expect(rs).toBeDefined();
                    expect(rs.rows).toBeDefined();
                    expect(rs.rows.length).toBe(1);
                    expect(rs.rows.item(0).test_data).toBe(test_data);
                    done();
                  }, function (error) {
                    // NOT EXPECTED:
                    expect(false).toBe(true);
                    expect(error).toBeDefined();
                    expect(error.message).toBeDefined();
                    expect(error.message).toBe('--');
                    done();
                  });

                }, function (error) {
                  // NOT EXPECTED:
                  expect(false).toBe(true);
                  expect(error).toBeDefined();
                  expect(error.message).toBeDefined();
                  expect(error.message).toBe('--');
                  done();
                });
              }, function (error) {
                // NOT EXPECTED:
                expect(false).toBe(true);
                expect(error).toBeDefined();
                expect(error.message).toBeDefined();
                expect(error.message).toBe('--');
                done();
              });
            });
        }, function (error) {
            // NOT EXPECTED:
            expect(false).toBe(true);
            expect(error).toBeDefined();
            expect(error.message).toBe('--');
            done();
        });
      });

      it(suiteName + ' Open encrypted DB with another password - should fail', function (done) {
        var dbName = "Encrypted-DB-reopen-with-another-password.db";

        openDatabase({name: dbName, key: 'test-password'}, function (db) {
            db.sqlBatch([
              'DROP TABLE IF EXISTS tt',
              'CREATE TABLE IF NOT EXISTS tt (test_data)',
              ['INSERT INTO tt (test_data) VALUES (?)', ['test data']]
            ], function() {
              db.close(function () {
                openDatabase({name: dbName, key: "another-password"}, function (db) {
                  // NOT EXPECTED (Open DB with another-password should not have succeeded):
                  expect(false).toBe(true);
                  done();
                }, function (error) {
                  // EXPECTED RESULT:
                  expect(error).toBeDefined();
                  expect(error.message).toBeDefined();
                  done();
                });
              }, function (error) {
                // NOT EXPECTED:
                expect(false).toBe(true);
                expect(error).toBeDefined();
                expect(error.message).toBeDefined();
                expect(error.message).toBe('--');
                done();
              });
            });
        }, function (error) {
          // NOT EXPECTED:
          expect(false).toBe(true);
          expect(error).toBeDefined();
          expect(error.message).toBeDefined();
          expect(error.message).toBe('--');
          done();
        });
      });

      it(suiteName + ' Attempt to open encrypted DB with INCORRECT password THEN OPEN & READ with CORRECT PASSWORD [PLUGIN BROKEN - BUG #43: MUST CLOSE THEN TRY AGAIN]', function (done) {
        // if (isWindows) pending('SKIP for Windows: CALLBACK NOT RECEIVED');

        var dbName = 'Encrypted-DB-attempt-incorrect-password-then-correct-password.db';
        var test_data = 'test-data';

        window.sqlitePlugin.openDatabase({name: dbName, key: 'test-password', location: 'default'}, function (db1) {
            expect(db1).toBeDefined();
            // CREATE TABLE & INSERT some contents into the DB:
            db1.sqlBatch([
              'DROP TABLE IF EXISTS tt',
              'CREATE TABLE IF NOT EXISTS tt (test_data)',
              ['INSERT INTO tt (test_data) VALUES (?)', [test_data]]
            ], function() {
              db1.close(function () {

                window.sqlitePlugin.openDatabase({name: dbName, key: 'another-password', location: 'default'}, function (db2) {
                  // NOT EXPECTED:
                  expect(false).toBe(true);
                  done();
                }, function (error) {
                  // EXPECTED RESULT:
                  expect(error).toBeDefined();
                  // FUTURE TBD CHECK code/message

                  window.sqlitePlugin.openDatabase({name: dbName, key: 'test-password', location: 'default'}, function (db3) {
                    // EXPECTED RESULT:
                    expect(db3).toBeDefined();
                    /* ** FUTURE TODO single SQL statement [BROKEN: NO SQL CALLBACK RECEIVED]:
                    db3.executeSql('SELECT * FROM tt', null, function(rs) {
                      expect(rs).toBeDefined();
                      expect(rs.rows).toBeDefined();
                      expect(rs.rows.length).toBe(1);
                      expect(rs.rows.item(0).test_data).toBe(test_data);
                      done();
                    }, function (error) {
                      // NOT EXPECTED:
                      expect(false).toBe(true);
                      expect(error).toBeDefined();
                      expect(error.message).toBe('--');
                      done();
                    });
                    // */
                    //* Use "standard" transaction mechanism instead:
                    db3.transaction(function(tx) {
                      tx.executeSql('SELECT * FROM tt', null, function(ignored, rs) {
                        // TBD CORRECT RESULT:
                        expect('PLUGIN FIXED PLEASE UPDATE THIS TEST').toBe('--');
                        expect(rs).toBeDefined();
                        expect(rs.rows).toBeDefined();
                        expect(rs.rows.length).toBe(1);
                        expect(rs.rows.item(0).test_data).toBe(test_data);
                        done();
                      }, function (ignored, error) {
                        // NOT EXPECTED:
                        expect(false).toBe(true);
                        expect(error).toBeDefined();
                        expect(error.message).toBeDefined();
                        expect(error.message).toBe('--');
                        done();
                      });

                    }, function (error) {
                      // TBD ACTUAL RESULT:
                      // expect(false).toBe(true);
                      // expect(error).toBeDefined();
                      // expect(error.message).toBe('--');
                      expect(error).toBeDefined();
                      db3.close(function() {
                        // TBD CORRECT RESULT:
                        expect('PLUGIN BEHAVIOR CHANGED PLEASE UPDATE THIS TEST AND CHECK STORED DATA HERE').toBe('--');
                        done();
                      }, function(error) {
                        // TBD ACTUAL RESULT:
                        // expect(false).toBe(true);
                        // expect(error).toBeDefined();
                        // expect(error.message).toBe('--');
                        expect(error).not.toBeDefined();
                        // TRY OPENING AGAIN:
                        window.sqlitePlugin.openDatabase({name: dbName, key: 'test-password', location: 'default'}, function (db4) {
                          // EXPECTED RESULT:
                          expect(db4).toBeDefined();
                          // Single SQL statement should work now:
                          db4.executeSql('SELECT * FROM tt', null, function(rs) {
                            expect(rs).toBeDefined();
                            expect(rs.rows).toBeDefined();
                            expect(rs.rows.length).toBe(1);
                            expect(rs.rows.item(0).test_data).toBe(test_data);
                            done();
                          });
                        });
                      });
                    });
                    // */
                  });

                });

              }, function (error) {
                // NOT EXPECTED:
                expect(false).toBe(true);
                expect(error.message).toBeDefined();
                expect(error.message).toBe('--');
                done();
              });
            });
        }, function (error) {
          // NOT EXPECTED:
          expect(false).toBe(true);
          expect(error.message).toBeDefined();
          expect(error.message).toBe('--');
          done();
        });
      });

      it(suiteName + 'Attempt to open and read unencrypted DB with password key', function (done) {
        var dbName = 'Open-and-read-unencrypted-DB-with-password.db';

        openDatabase({name: dbName}, function (db) {
            expect(db).toBeDefined();
            db.sqlBatch([
              'DROP TABLE IF EXISTS tt',
              'CREATE TABLE IF NOT EXISTS tt (test_data)',
              ['INSERT INTO tt (test_data) VALUES (?)', ['test data']]
            ], function() {
              db.close(function () {
                var db1 = openDatabase({name: dbName, key: 'test-password'});
                db1.transaction(function(tx) {
                  // NOT EXPECTED:
                  expect(false).toBe(true);
                  done();
                }, function(error) {
                  // EXPECTED RESULT:
                  expect(error).toBeDefined();
                  expect(error.message).toBeDefined();
                  done();
                }, function() {
                  // NOT EXPECTED:
                  expect(false).toBe(true);
                  done();
                });
              }, function (error) {
                // NOT EXPECTED:
                expect(false).toBe(true);
                expect(error.message).toBeDefined();
                expect(error.message).toBe('--');
                done();
              });
            });
        }, function (error) {
            // NOT EXPECTED:
            expect(false).toBe(true);
            expect(error.message).toBeDefined();
            expect(error.message).toBe('--');
            done();
        });
    });

});

/* vim: set expandtab : */
