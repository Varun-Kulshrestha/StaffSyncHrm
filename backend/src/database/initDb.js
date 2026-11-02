const db = require('../config/db');
const bcrypt = require('bcryptjs');

function initDb() {
  // 1. Create users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(36) PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL CHECK(role IN ('ADMIN', 'HR', 'EMPLOYEE')),
      is_active BOOLEAN NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 2. Seed initial users if table is empty
  const countUsers = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (countUsers.count === 0) {
    const saltRounds = 10;
    const seedUsers = [
      {
        id: 'usr_99812',
        email: 'admin@staffsync.com',
        password_hash: bcrypt.hashSync('Admin@123', saltRounds),
        role: 'ADMIN',
        is_active: 1
      },
      {
        id: 'usr_99813',
        email: 'hr@staffsync.com',
        password_hash: bcrypt.hashSync('Hr@123', saltRounds),
        role: 'HR',
        is_active: 1
      },
      {
        id: 'usr_99814',
        email: 'employee@staffsync.com',
        password_hash: bcrypt.hashSync('Emp@123', saltRounds),
        role: 'EMPLOYEE',
        is_active: 1
      },
      {
        id: 'usr_99815',
        email: 'deactivated@staffsync.com',
        password_hash: bcrypt.hashSync('Deact@123', saltRounds),
        role: 'EMPLOYEE',
        is_active: 0
      }
    ];

    const insertStmt = db.prepare(`
      INSERT INTO users (id, email, password_hash, role, is_active)
      VALUES (@id, @email, @password_hash, @role, @is_active)
    `);

    const insertMany = db.transaction((users) => {
      for (const user of users) {
        insertStmt.run(user);
      }
    });

    insertMany(seedUsers);
    console.log('[DB] Core 4 users successfully seeded into SQLite database.');
  }
}

module.exports = { initDb };
