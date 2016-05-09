# Changes

## cordova-sqlcipher-adapter 0.1.6

- SQLCipher for Android with API 23 fixes from: https://github.com/litehelpers/android-database-sqlcipher-api-fix
- ICU-Unicode string manipulation no longer supported for Android
- REGEXP disabled for iOS
- Minimum Cordova version no longer enforced

## cordova-sqlcipher-adapter 0.1.5

- SQLCipher 3.4.0 with FTS5 (all platforms) and JSON1 (Android/iOS)
- Support Windows 10 UWP build along with Windows 8.1/Windows Phone 8.1 (WAL/MMAP disabled for Windows Phone 8.1)
- Renamed SQLiteProxy.js to sqlite-proxy.js in Windows version

### cordova-sqlite-storage 1.2.1

- Close Android SQLiteStatement after INSERT/UPDATE/DELETE
- Specify minimum Cordova version 6.0.0
- Lawnchair adapter fix: Changed remove method to work with key array

### x.x.x-common-dev

- Fix PCH issue with Debug Win32 UWP (Windows 10) build

### cordova-sqlite-storage 1.2.0

- Rename Lawnchair adapter to prevent clash with standard webkit-sqlite adapter
- Support location: 'default' setting in openDatabase & deleteDatabase

### cordova-sqlite-storage 0.8.5

- More explicit iosDatabaseLocation option
- iOS database location is now mandatory
- Split-up of some more spec test scripts

### cordova-sqlite-storage 0.8.2

- Workaround fix for empty readTransaction issue (litehelpers/Cordova-sqlite-storage#409)
- Split spec/www/spec/legacy.js into db-open-close-delete-test.js & tx-extended.js

### cordova-sqlite-storage 0.8.0

- Simple sql batch transaction function
- Echo test function
- Remove extra runInBackground: step from iOS version
- Java source of Android version now using io.sqlc package

### cordova-sqlite-storage 0.7.15-pre

- All iOS operations are now using background processing (reported to resolve intermittent problems with cordova-ios@4.0.1)

### cordova-sqlite-storage 0.7.13

- REGEXP support partially removed from this version branch
- Rename Windows C++ Database close function to closedb to resolve conflict for Windows Store certification
- Android version with sqlite `3.8.10.2` embedded (with error messages fixed)
- Pre-populated database support removed from this version branch
- Amazon Fire-OS support removed

## cordova-sqlcipher-adapter 0.1.4-rc

- Workaround fix for empty readTransaction issue

## cordova-sqlcipher-adapter 0.1.4-pre

- Implement database close and delete operations for Windows "Universal"
- Fix conversion warnings in iOS version

### cordova-sqlite-storage 0.7.12

- Fix to Windows "Universal" version to support big integers
- Fix readTransaction to skip BEGIN/COMMIT/ROLLBACK

## cordova-sqlcipher-adapter 0.1.3-pre

- Update to SQLCipher v3.3.1 (all platforms)
- Check that the database name is a string, and throw exception otherwise

### cordova-sqlite-storage 0.7.11

- Fix conversion of INTEGER type (iOS version)

### cordova-sqlite-storage 0.7.8

- Build ARM target of Windows "Universal" version with Function Level Linking ref: http://www.monkey-x.com/Community/posts.php?topic=7739

## cordova-sqlcipher-adapter 0.1.2

- Update Android and iOS versions to use SQLCipher v3.3.0
- Windows Universal (8.1) including both Windows and Windows Phone 8.1 now supported
- insertId and rowsAffected longer missing for Windows (Universal) 8.1
- iOS and Windows Universal versions built with a close match to the sqlite4java sqlite compiler flags-for example: FTS3/FTS4 and R-TREE

## cordova-sqlcipher-adapter 0.1.1

- Abort initially pending transactions for db handle if db cannot be opened (due to incorrect password key, for example)
- Proper handling of transactions that may be requested before the database open operation is completed
- Report an error upon attempt to close a database handle object multiple times.
- Resolve issue with INSERT OR IGNORE (Android)
