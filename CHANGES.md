# Changes

## 0.1.1

- Abort initially pending transactions for db handle if db cannot be opened (due to incorrect password key, for example)
- Proper handling of transactions that may be requested before the database open operation is completed
- Report an error upon attempt to close a database handle object multiple times.

