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

  // Seed initial users if table is empty
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

  // 2. Create employees table
  db.exec(`
    CREATE TABLE IF NOT EXISTS employees (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NULL REFERENCES users(id) ON DELETE SET NULL,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      department VARCHAR(50) NOT NULL,
      designation VARCHAR(100) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      date_of_joining DATE NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
    CREATE INDEX IF NOT EXISTS idx_employees_dept_active ON employees(department, is_active);
  `);

  // Seed initial 10 employees if table is empty
  const countEmployees = db.prepare('SELECT COUNT(*) as count FROM employees').get();
  if (countEmployees.count === 0) {
    const seedEmployees = [
      {
        id: 'EMP-001',
        user_id: 'usr_99812',
        first_name: 'Sarah',
        last_name: 'Jenkins',
        email: 'admin@staffsync.com',
        department: 'HR',
        designation: 'VP of People Ops',
        phone: '+1-555-0199',
        date_of_joining: '2021-03-15',
        is_active: 1
      },
      {
        id: 'EMP-002',
        user_id: 'usr_99813',
        first_name: 'David',
        last_name: 'Vance',
        email: 'hr@staffsync.com',
        department: 'HR',
        designation: 'Senior HR Generalist',
        phone: '+1-555-0192',
        date_of_joining: '2022-06-01',
        is_active: 1
      },
      {
        id: 'EMP-003',
        user_id: 'usr_99814',
        first_name: 'Elena',
        last_name: 'Rostova',
        email: 'employee@staffsync.com',
        department: 'Engineering',
        designation: 'Staff Platform Engineer',
        phone: '+1-555-0188',
        date_of_joining: '2023-01-10',
        is_active: 1
      },
      {
        id: 'EMP-004',
        user_id: 'usr_99815',
        first_name: 'Marcus',
        last_name: 'Thorne',
        email: 'deactivated@staffsync.com',
        department: 'Sales',
        designation: 'Account Executive',
        phone: '+1-555-0177',
        date_of_joining: '2022-11-20',
        is_active: 0
      },
      {
        id: 'EMP-005',
        user_id: null,
        first_name: 'Aisha',
        last_name: 'Patel',
        email: 'aisha.p@staffsync.com',
        department: 'Engineering',
        designation: 'Senior Frontend Architect',
        phone: '+1-555-0105',
        date_of_joining: '2023-04-12',
        is_active: 1
      },
      {
        id: 'EMP-006',
        user_id: null,
        first_name: 'Liam',
        last_name: "O'Connor",
        email: 'liam.o@staffsync.com',
        department: 'Finance',
        designation: 'Financial Controller',
        phone: '+1-555-0106',
        date_of_joining: '2021-09-01',
        is_active: 1
      },
      {
        id: 'EMP-007',
        user_id: null,
        first_name: 'Chloe',
        last_name: 'Chen',
        email: 'chloe.c@staffsync.com',
        department: 'Operations',
        designation: 'Operations Lead',
        phone: '+1-555-0107',
        date_of_joining: '2022-02-15',
        is_active: 1
      },
      {
        id: 'EMP-008',
        user_id: null,
        first_name: 'Tariq',
        last_name: 'Al-Mansoor',
        email: 'tariq.m@staffsync.com',
        department: 'Engineering',
        designation: 'Backend Engineer',
        phone: '+1-555-0108',
        date_of_joining: '2023-08-20',
        is_active: 1
      },
      {
        id: 'EMP-009',
        user_id: null,
        first_name: 'Jessica',
        last_name: 'Miller',
        email: 'jessica.m@staffsync.com',
        department: 'Sales',
        designation: 'Solutions Specialist',
        phone: '+1-555-0109',
        date_of_joining: '2024-01-08',
        is_active: 1
      },
      {
        id: 'EMP-010',
        user_id: null,
        first_name: 'Ronald',
        last_name: 'Davies',
        email: 'ronald.d@staffsync.com',
        department: 'Operations',
        designation: 'Logistics Coordinator',
        phone: '+1-555-0110',
        date_of_joining: '2023-05-18',
        is_active: 0
      }
    ];

    const insertEmp = db.prepare(`
      INSERT INTO employees (id, user_id, first_name, last_name, email, department, designation, phone, date_of_joining, is_active)
      VALUES (@id, @user_id, @first_name, @last_name, @email, @department, @designation, @phone, @date_of_joining, @is_active)
    `);

    const insertManyEmp = db.transaction((employees) => {
      for (const emp of employees) {
        insertEmp.run(emp);
      }
    });

    insertManyEmp(seedEmployees);
    console.log('[DB] 10 Employee fixtures successfully seeded into SQLite database.');
  }
}

module.exports = { initDb };
