# Changes

## 0.1.3-pre

- Update to SQLCipher v3.3.1 (all platforms)
- Check that the database name is a string, and throw exception otherwise
- Build ARM target of Windows "Universal" version with Function Level Linking ref: http://www.monkey-x.com/Community/posts.php?topic=7739

## 0.1.2

- Update Android and iOS versions to use SQLCipher v3.3.0
- Windows Universal (8.1) including both Windows and Windows Phone 8.1 now supported
- insertId and rowsAffected longer missing for Windows (Universal) 8.1
- iOS and Windows Universal versions built with a close match to the sqlite4java sqlite compiler flags-for example: FTS3/FTS4 and R-TREE

## 0.1.1

- Abort initially pending transactions for db handle if db cannot be opened (due to incorrect password key, for example)
- Proper handling of transactions that may be requested before the database open operation is completed
- Report an error upon attempt to close a database handle object multiple times.

