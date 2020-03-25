# Changes

## cordova-sqlcipher-adapter 0.5.0

- SQLCipher 4.3.0 update for Android in custom build, as documented, now using `androidx.sqlite:sqlite:2.1.0` framework reference
- SQLCipher 4.3.0 update for iOS/macOS

#### cordova-sqlite-storage 5.0.0

- avoid incorrect default directory on iOS/macOS - to be extra safe (see <https://github.com/xpbrew/cordova-sqlite-storage/issues/907>)
  - ensure that default "nosync" directory *always* has resource value set for `NSURLIsExcludedFromBackupKey`
  - add more checks for missing database directory

#### cordova-sqlite-storage 4.0.0

- rename PSPDFThreadSafeMutableDictionary to CustomPSPDFThreadSafeMutableDictionary and completely remove PSPDFThreadSafeMutableDictionary.h

#### cordova-sqlite-storage 3.4.1

- SQLite 3.31.1 update from cordova-sqlite-storage-dependencies@2.1.1

#### cordova-sqlite-storage 3.4.0

- quick workaround for `SYNTAX_ERR` redefinition

#### cordova-sqlite-storage 3.3.0

- new default page & cache sizes with cordova-sqlite-storage-dependencies@2.1.0

##### cordova-sqlite-storage-commoncore 1.0.0

- additional EU string manipulation test cases

#### cordova-sqlite-storage 3.2.1

- cordova-sqlite-storage-dependencies@2.0.1 with SQLite 3.28.0 update for all supported platforms Android/iOS/macOS/Windows

#### cordova-sqlite-storage 3.2.0

- sqlite3_threadsafe() error handling on iOS/macOS

#### cordova-sqlite-storage 3.1.0

- no SQLITE_DEFAULT_CACHE_SIZE compile-time setting on iOS/macOS/Windows

#### cordova-sqlite-storage 3.0.0

- Use cordova-sqlite-storage-dependencies 2.0.0 with SQLITE_DBCONFIG_DEFENSIVE setting used by sqlite-native-driver.jar on Android

###### cordova-sqlite-ext-common-core 0.2.0

- Move SQLite3.UWP.vcxproj out of extra SQLite3.UWP subdirectory
- Completely remove old Windows 8.1 & Windows Phone 8.1 vcxproj files

###### cordova-sqlite-extcore 0.1.0

- move the embedded `SQLite3-WinRT` component to `src/windows/SQLite3-WinRT-sync` and update `plugin.xml`

##### cordova-sqlite-ext-common-core 0.1.0

###### cordova-sqlite-ext-core-common 0.1.0

- beforePluginInstall.js updates
  - use standard Promise
  - get the plugin package name from package.json
  - use const instead of var (this should be considered a POSSIBLY BREAKING CHANGE since const may not work on some really old Node.js versions)
  - remove hasbang line that is not needed

### cordova-sqlite-storage 2.6.0

- Use cordova-sqlite-storage-dependencies 1.2.1 with SQLite 3.26.0, with a security update and support for window functions

### cordova-sqlite-storage 2.5.2

- Ignore Android end transaction error when closing for androidDatabaseProvider: 'system' setting, to avoid possible crash during app shutdown (<https://github.com/litehelpers/Cordova-sqlite-storage/issues/833>)

### cordova-sqlite-storage 2.5.1

- fix internal plugin cleanup error log on Android

### cordova-sqlite-storage 2.5.0

- androidDatabaseProvider: 'system' setting, to replace androidDatabaseImplementation setting which is now deprecated

### cordova-sqlite-storage 2.4.0

- Report internal plugin error in case of attempt to open database with no database name on iOS or macOS
- Cover use of standard (WebKit) Web SQL API in spec test suite
- Test and document insertId in UPDATE result set on plugin vs (WebKit) Web SQL
- other test updates

### cordova-sqlite-storage 2.3.3

- Quick fix for some iOS/macOS internal plugin error log messagess
- test updates
- quick doc updates

### cordova-sqlite-storage 2.3.2

- Mark some Android errors as internal plugin errors (quick fix)
- remove trailing whitespace from Android implementation
- test coverage updates
- quick doc updates

### cordova-sqlite-storage 2.3.1

- Mark some iOS/macOS plugin error messages as internal plugin errors (quick fix)
- Quick documentation updates

### cordova-sqlite-storage 2.3.0

- Use SQLite 3.22.0 with SQLITE_DEFAULT_SYNCHRONOUS=3 (EXTRA DURABLE) compile-time setting on all platforms (Android/iOS/macOS/Windows) ref: litehelpers/Cordova-sqlite-storage#736

## cordova-sqlcipher-adapter 0.4.1

- SQLCipher 4.2.0 update

## cordova-sqlcipher-adapter 0.4.0

- SQLITE_DBCONFIG_DEFENSIVE flag for Android (custom build) in addition to iOS/macOS/Windows (POTENTIALLY BREAKING CHANGE)
- Cleanup SQLiteAndroidDatabase.java in this plugin version (no workaround needed for pre-Honeycomb in this plugin version)
- `SQLITE_DEFAULT_SYNCHRONOUS=3` (EXTRA DURABLE) compile-time setting on the disabled Windows platform

###### cordova-sqlite-storage-ext-core-common 2.0.0

- SQLITE_DBCONFIG_DEFENSIVE flag - iOS/macOS/Windows (POTENTIALLY BREAKING CHANGE)
- remove internal qid usage from JavaScript (not needed)
- non-static Android database runner map (POTENTIALLY BREAKING CHANGE)
- Completely remove old Android SuppressLint (android.annotation.SuppressLint) - POSSIBLY BREAKING CHANGE
- drop workaround for pre-Honeycomb Android API (BREAKING CHANGE)
- no extra @synchronized block per batch (iOS/macOS) - should be considered a POSSIBLY BREAKING change
- remove backgroundExecuteSql method not needed (iOS/macOS)
- Completely remove iOS/macOS MRC (Manual Reference Counting) support - should be considered a POSSIBLY BREAKING change

## cordova-sqlcipher-adapter 0.3.0

- SQLCipher 4.0.1 update, with SQLITE_OMIT_SHARED_CACHE build flag now used on Android

## cordova-sqlcipher-adapter 0.2.1

- SQLITE_OMIT_DEPRECATED for iOS/macOS

## cordova-sqlcipher-adapter 0.2.0

- Remove default page/cache size settings for unencrypted databases on iOS/macOS & unsupported Windows platforms (already gone for Android)

### cordova-sqlite-storage 2.2.1

- Fix Android/iOS src copyright, perpetually

### cordova-sqlite-storage 2.2.0

- Fix SQLiteAndroidDatabase implementation for Turkish and other foreign locales

### cordova-sqlite-storage 2.1.0

Windows platform updates that are currently not supported in this plugin version:
- Visual Studio 2017 updates for Windows UWP build
- Fix Windows target platform version
- Reference Windows platform toolset v141 to support Visual Studio 2017 (RC)

## cordova-sqlcipher-adapter 0.1.12-rc3

- SQLCipher `3.4.2` with FTS3/FTS5 update from SQLite 3.26.0 (security update) for iOS/macOS from <https://github.com/brodybits/sqlcipher/tree/3.4.x%2Bfts-update> (`3.4.x+fts-update` branch)
- SQLCipher `3.5.9` for Android, in JARs again, with FTS3/FTS5 update from SQLite 3.26.0 (security update) in custom build from <https://github.com/brodybits/android-database-sqlcipher/tree/3.5.x%2Bfts-update-custom-jars> (`3.5.x+fts-update-custom-jars` branch)
- SQLITE_DEFAULT_SYNCHRONOUS=3 (extra durable build setting)
- Fix build settings in README.md

## cordova-sqlcipher-adapter 0.1.12-rc2

- cordova-sqlcipher-adapter with SQLITE_THREADSAFE=1 for iOS/macOS ref: litehelpers/Cordova-sqlite-storage#754 (<https://github.com/litehelpers/Cordova-sqlite-storage/issues/754>)

## cordova-sqlcipher-adapter 0.1.12-rc1

- SQLCipher for Android 3.5.9 Gradle reference
- SQLCipher 3.4.2 for iOS/macOS
- Windows platform build disabled (no longer tested in this plugin version; CRYPTO no longer enabled in Windows SQLite3 library build; unwanted libTomCrypt provider completely removed)

##### cordova-sqlite-legacy-core 1.0.7

- Add error info text in case of close error on Windows
- Signal INTERNAL ERROR in case of attempt to reuse db on Windows (should never happen due to workaround solution to BUG 666)
- SQLITE_DEFAULT_CACHE_SIZE build flag fix for macOS ("osx") and Windows

###### cordova-sqlite-legacy-express-core 1.0.5

- iOS/macOS @synchronized guard for sqlite3_open operation
- Signal INTERNAL ERROR in case of attempt to reuse db (Android/iOS) (should never happen due to workaround solution to BUG 666)

## cordova-sqlcipher-adapter 0.1.11

##### cordova-sqlite-legacy-core 1.0.6

###### cordova-sqlite-legacy-express-core 1.0.4

- Cleaned up workaround solution to BUG 666: close db before opening (ignore close error)
- android.database end transaction if active before closing (needed for new BUG 666 workaround solution to pass selfTest in case of builtin android.database implementation)

##### cordova-sqlite-legacy-core 1.0.5

###### cordova-sqlite-legacy-express-core 1.0.3

- Resolve Java 6/7/8 concurrent map compatibility issue reported in litehelpers/Cordova-sqlite-storage#726, THANKS to pointer by @NeoLSN (Jason Yang/楊朝傑) in litehelpers/Cordova-sqlite-storage#727.
- selfTest database cleanup do not ignore close or delete error on any platforms

## cordova-sqlcipher-adapter 0.1.10

- Windows 8.1 and Windows Phone 8.1 supported again, NOW DEPRECATED

##### cordova-sqlite-legacy-core 1.0.4

- New workaround solution to BUG 666: close db before opening (ignore close error)

##### cordova-sqlite-legacy-core 1.0.3

- Suppress warnings when building sqlite3.c & PSPDFThreadSafeMutableDictionary.m on iOS/macOS

##### cordova-sqlite-legacy-core 1.0.2

- Fix log in case of transaction waiting for open to finish; doc fixes
- SQLite 3.15.2 build with SQLITE_THREADSAFE=2 on iOS/macOS (SQLITE_THREADSAFE=1 on Android/Windows) and other flag fixes in this version branch to avoid possible malformed database due to multithreaded access ref: litehelpers/Cordova-sqlite-storage#703
- Windows 10 (UWP) build with /SAFESEH flag on Win32 (x86) target

###### cordova-sqlite-legacy-express-core 1.0.2

- Use PSPDFThreadSafeMutableDictionary for iOS/macOS to avoid threading issue ref: litehelpers/Cordova-sqlite-storage#716

###### cordova-sqlite-legacy-express-core 1.0.1

- Fix bug 666 workaround to trigger ROLLBACK in the next event tick (needed to support version with pre-populated database on Windows)

###### cordova-sqlite-legacy-express-core 1.0.0

- Workaround solution to BUG litehelpers/Cordova-sqlite-storage#666 (hanging transaction in case of location reload/change)
- selfTest simulate scenario & test solution to BUG litehelpers/Cordova-sqlite-storage#666 (also includes string test and test of effects of location reload/change in this version branch, along with another internal check)
- Drop engine constraints in package.json & plugin.xml (in this version branch)
- Remove Lawnchair adapter from this version branch
- Support macOS platform with builtin libsqlite3.dylib framework in this version branch

## cordova-sqlcipher-adapter 0.1.9

- SQLCipher 3.4.1, SQLCipher for Android 3.5.6
- Build flag fixes
- minor test fixes
- certain array and object tests disabled in this version branch due to testing issues on iOS with WKWebView
- doc fixes

### cordova-sqlite-storage 1.5.4

- Fix iOS/macOS version to report undefined insertId in case INSERT OR IGNORE is ignored
- Fix FIRST_WORD check for android.sqlite.database implementation
- SQLite 3.15.2 build fixes
- Doc updates

### cordova-sqlite-storage 1.5.3

- Fix merges to prevent possible conflicts with other plugins (Windows)
- Fix handling of undefined SQL argument values (Windows)
- Signal error in case of a failure opening the database file (iOS/macOS)
- Doc fixes and updates

### cordova-sqlite-storage 1.5.2

- Check transaction callback functions to avoid crash on Windows
- Fix echoTest callback handling
- Fix openDatabase/deleteDatabase exception messages
- Move Lawnchair adapter to a separate project
- Doc updates

### cordova-sqlite-storage 1.5.1

- Minor test fixes

### cordova-sqlite-storage 1.5.0

- Drop support for Windows 8.1 & Windows Phone 8.1

### cordova-sqlite-storage 1.4.9

- Minor JavaScript fix (generated by CoffeeScript 1.11.1)
- Update test due to issue with u2028/u2029 on cordova-android 6.0.0
- doc fixes
- Cleanup plugin.xml: remove old engine constraint that was already commented out
- Fix LICENSE.md

## cordova-sqlcipher-adapter 0.1.8

- Android version with android-database-sqlcipher 3.5.4

### cordova-sqlite-storage 1.4.8

- selfTest function add string test and test of effects of location reload/change
- Support macOS ("osx" platform)
- Signal an error in case of SQL with too many parameter argument values on iOS (in addition to Android & Windows)
- Include proper SQL error code on Android (in certain cases)
- Fix reporting of SQL statement execution errors in Windows version
- Fix Windows version to report errors with a valid error code (0)
- Some doc fixes

### cordova-sqlite-storage 1.4.7

- Minor JavaScript fixes to pass @brodybits/Cordova-sql-test-app

### cordova-sqlite-storage 1.4.6

- Stop remaining transaction callback in case of an error with no error handler returning false
- Expand selfTest function to cover CRUD with unique record keys
- Fix readTransaction to reject ALTER, REINDEX, and REPLACE operations
- Fix Windows 10 ARM Release Build of SQLite3 by disabling SDL check (ARM Release only)
- Fix Windows 8.1/Windows Phone 8.1 Release Build of SQLite3 by disabling SDL check
- Some documentation fixes

### cordova-sqlite-storage 1.4.5

- Log/error message fixes; remove extra qid from internal JSON interface

### cordova-sqlite-storage 1.4.4

- Fix readTransaction to reject modification statements with extra semicolon(s) in the beginning
- Announce new Cordova-sqlite-evcore-extbuild-free version
- Additional tests
- Other doc fixes

### cordova-sqlite-storage 1.4.3

- Handle executeSql with object sql value (solves another possible crash on iOS)

### cordova-sqlite-storage 1.4.2

- Fix sqlitePlugin.openDatabase and sqlitePlugin.deleteDatabase to check location/iosDatabaseLocation values
- Fix sqlitePlugin.deleteDatabase to check that db name is really a string (prevents possible crash on iOS)
- Fix iOS version to use DLog macro to remove extra logging from release build
- Fix Lawnchair adapter to use new mandatory "location" parameter
- Remove special handling of Blob parameters, use toString for all non-value parameter objects
- Minor cleanup of Android version code

### cordova-sqlite-storage 1.4.1

- Minimum Cordova version no longer enforced in this version

### cordova-sqlite-storage 1.4.0

- Now using cordova-sqlite-storage-dependencies for SQLite 3.8.10.2 Android/iOS/Windows
- Android-sqlite-connector implementation supported by this version again
- Enforce minimum cordova-windows version (should be OK in Cordova 6.x)
- Support Windows 10 along with Windows 8.1/Windows Phone 8.1

### cordova-sqlite-storage 1.2.2

- Self-test function to verify ability to open/populate/read/delete a test database
- Read BLOB as Base-64 DISABLED in Android version (was already disabled for iOS)

## cordova-sqlcipher-adapter 0.1.7

- Fix Windows build
- SQLCipher prerelease fix to use append mode for cipher_profile
- SQLCipher for Android updates

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
- Fix conversion warnings in iOS version

### cordova-sqlite-storage 0.7.12

- Fix to Windows "Universal" version to support big integers
- Implement database close and delete operations for Windows "Universal"
- Fix readTransaction to skip BEGIN/COMMIT/ROLLBACK

### cordova-sqlite-storage 0.7.11

- Fix plugin ID in plugin.xml to match npm package ID
- Unpacked sqlite-native-driver.so libraries from jar
- Fix conversion of INTEGER type (iOS version)
- Disable code to read BLOB as Base-64 (iOS version) due to https://issues.apache.org/jira/browse/CB-9638

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
