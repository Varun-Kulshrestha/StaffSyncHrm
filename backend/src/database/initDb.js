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

  // ==========================================
  // SPRINT 3: Leave Management & Approval Tables
  // ==========================================
  db.exec(`
    CREATE TABLE IF NOT EXISTS leave_balances (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      employee_id VARCHAR(36) NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
      leave_type VARCHAR(20) NOT NULL CHECK (leave_type IN ('SICK', 'CASUAL', 'PRIVILEGE')),
      allocated_days INT NOT NULL,
      consumed_days INT NOT NULL DEFAULT 0,
      locked_days INT NOT NULL DEFAULT 0,
      CONSTRAINT uq_user_leave UNIQUE (user_id, leave_type)
    );

    CREATE TABLE IF NOT EXISTS leave_requests (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      employee_id VARCHAR(36) NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
      leave_type VARCHAR(20) NOT NULL CHECK (leave_type IN ('SICK', 'CASUAL', 'PRIVILEGE')),
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      days_count INT NOT NULL,
      reason TEXT NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')),
      reviewed_by VARCHAR(36) NULL REFERENCES users(id),
      review_comment TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_leaves_user ON leave_requests(user_id);
    CREATE INDEX IF NOT EXISTS idx_leaves_status ON leave_requests(status);
  `);

  // Seed baseline leave balances if empty
  const countBalances = db.prepare('SELECT COUNT(*) as count FROM leave_balances').get();
  if (countBalances.count === 0) {
    const seedBalances = [
      // usr_99814 (Elena Rostova, EMP-003, Employee)
      { id: 'bal-001-s', user_id: 'usr_99814', employee_id: 'EMP-003', leave_type: 'SICK', allocated_days: 12, consumed_days: 0, locked_days: 0 },
      { id: 'bal-001-c', user_id: 'usr_99814', employee_id: 'EMP-003', leave_type: 'CASUAL', allocated_days: 12, consumed_days: 0, locked_days: 3 },
      { id: 'bal-001-p', user_id: 'usr_99814', employee_id: 'EMP-003', leave_type: 'PRIVILEGE', allocated_days: 15, consumed_days: 0, locked_days: 0 },

      // usr_99813 (David Vance, EMP-002, HR)
      { id: 'bal-002-s', user_id: 'usr_99813', employee_id: 'EMP-002', leave_type: 'SICK', allocated_days: 12, consumed_days: 0, locked_days: 2 },
      { id: 'bal-002-c', user_id: 'usr_99813', employee_id: 'EMP-002', leave_type: 'CASUAL', allocated_days: 12, consumed_days: 0, locked_days: 0 },
      { id: 'bal-002-p', user_id: 'usr_99813', employee_id: 'EMP-002', leave_type: 'PRIVILEGE', allocated_days: 15, consumed_days: 0, locked_days: 0 },

      // usr_99812 (Sarah Jenkins, EMP-001, Admin)
      { id: 'bal-003-s', user_id: 'usr_99812', employee_id: 'EMP-001', leave_type: 'SICK', allocated_days: 12, consumed_days: 0, locked_days: 0 },
      { id: 'bal-003-c', user_id: 'usr_99812', employee_id: 'EMP-001', leave_type: 'CASUAL', allocated_days: 12, consumed_days: 0, locked_days: 0 },
      { id: 'bal-003-p', user_id: 'usr_99812', employee_id: 'EMP-001', leave_type: 'PRIVILEGE', allocated_days: 15, consumed_days: 0, locked_days: 0 }
    ];

    const insertBal = db.prepare(`
      INSERT INTO leave_balances (id, user_id, employee_id, leave_type, allocated_days, consumed_days, locked_days)
      VALUES (@id, @user_id, @employee_id, @leave_type, @allocated_days, @consumed_days, @locked_days)
    `);

    const insertManyBal = db.transaction((balances) => {
      for (const bal of balances) {
        insertBal.run(bal);
      }
    });

    insertManyBal(seedBalances);
    console.log('[DB] Baseline leave balances seeded for core accounts.');
  }

  // Seed sample pending leave requests if empty
  const countRequests = db.prepare('SELECT COUNT(*) as count FROM leave_requests').get();
  if (countRequests.count === 0) {
    const seedRequests = [
      {
        id: 'req-seed-001',
        user_id: 'usr_99814',
        employee_id: 'EMP-003',
        leave_type: 'CASUAL',
        start_date: '2026-11-10',
        end_date: '2026-11-12',
        days_count: 3,
        reason: 'Attending family wedding ceremony',
        status: 'PENDING',
        reviewed_by: null,
        review_comment: null
      },
      {
        id: 'req-seed-002',
        user_id: 'usr_99813',
        employee_id: 'EMP-002',
        leave_type: 'SICK',
        start_date: '2026-11-15',
        end_date: '2026-11-16',
        days_count: 2,
        reason: 'Scheduled medical dental procedure',
        status: 'PENDING',
        reviewed_by: null,
        review_comment: null
      }
    ];

    const insertReq = db.prepare(`
      INSERT INTO leave_requests (id, user_id, employee_id, leave_type, start_date, end_date, days_count, reason, status, reviewed_by, review_comment)
      VALUES (@id, @user_id, @employee_id, @leave_type, @start_date, @end_date, @days_count, @reason, @status, @reviewed_by, @review_comment)
    `);

    for (const req of seedRequests) {
      insertReq.run(req);
    }
    console.log('[DB] Baseline pending leave requests seeded.');
  }
}

module.exports = { initDb };

if (require.main === module) {
  initDb();
}

