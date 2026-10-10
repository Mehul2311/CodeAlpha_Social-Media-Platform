import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.resolve(process.cwd(), 'chaupal.sqlite');

let dbInstance: any = null;

export async function getDatabase() {
  if (dbInstance) {
    return dbInstance;
  }

  const SQL = await initSqlJs();
  let db: any;

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Enforce foreign key constraints
  db.run('PRAGMA foreign_keys = ON;');

  const saveToDisk = () => {
    try {
      const data = db.export();
      fs.writeFileSync(DB_PATH, Buffer.from(data));
    } catch (err) {
      console.error('Failed to persist database to disk:', err);
    }
  };

  const wrapper = {
    raw: db,
    save: saveToDisk,
    exec: (sql: string) => {
      db.exec(sql);
      saveToDisk();
    },
    prepare: (sql: string) => {
      return {
        get: (...params: any[]) => {
          // Normalize parameters if passed as array or multiple args
          const args = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
          const stmt = db.prepare(sql);
          if (args.length > 0) {
            stmt.bind(args);
          }
          let result: any = undefined;
          if (stmt.step()) {
            result = stmt.getAsObject();
          }
          stmt.free();
          return result;
        },
        all: (...params: any[]) => {
          const args = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
          const stmt = db.prepare(sql);
          if (args.length > 0) {
            stmt.bind(args);
          }
          const results: any[] = [];
          while (stmt.step()) {
            results.push(stmt.getAsObject());
          }
          stmt.free();
          return results;
        },
        run: (...params: any[]) => {
          const args = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
          if (args.length > 0) {
            db.run(sql, args);
          } else {
            db.run(sql);
          }
          saveToDisk();

          const rowIdRes = db.exec('SELECT last_insert_rowid() AS id;');
          const lastInsertRowid = rowIdRes?.[0]?.values?.[0]?.[0] ?? 0;
          const changes = db.getRowsModified();
          return { lastInsertRowid, changes };
        }
      };
    }
  };

  // Initialize tables if not already created
  initSchema(wrapper);

  dbInstance = wrapper;
  return dbInstance;
}

function initSchema(db: any) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      avatar TEXT,
      bio TEXT,
      city TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      parent_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(post_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS followers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      follower_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      following_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(follower_id, following_id)
    );

    CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
    CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
    CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
    CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id);
    CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
    CREATE INDEX IF NOT EXISTS idx_followers_follower ON followers(follower_id);
    CREATE INDEX IF NOT EXISTS idx_followers_following ON followers(following_id);
  `);
}
