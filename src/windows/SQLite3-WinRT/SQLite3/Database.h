#pragma once

#include "sqlite3.h"

namespace SQLite3
{
  ref class Statement;

  public ref class Database sealed
  {
  public:
    Database(Platform::String^ dbPath);
    virtual ~Database();

    int Key(Platform::String^ key);

    Statement^ Prepare(Platform::String^ sql);

    int LastInsertRowid();
    int TotalChanges();

  private:
    friend Statement;

    sqlite3* sqlite;
  };
}
