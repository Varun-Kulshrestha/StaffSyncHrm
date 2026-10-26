const bcrypt = require('bcryptjs');

// Seeded users with hashed passwords
const users = [
  {
    id: 'usr_99812',
    name: 'Admin User',
    email: 'admin@staffsync.com',
    passwordHash: bcrypt.hashSync('Admin@123', 10),
    role: 'ADMIN',
    is_active: true,
    department: 'Executive Operations',
    createdAt: '2026-01-15T09:00:00Z'
  },
  {
    id: 'usr_99813',
    name: 'HR Manager',
    email: 'hr@staffsync.com',
    passwordHash: bcrypt.hashSync('Hr@123', 10),
    role: 'HR',
    is_active: true,
    department: 'Human Resources',
    createdAt: '2026-01-20T10:00:00Z'
  },
  {
    id: 'usr_99814',
    name: 'John Employee',
    email: 'employee@staffsync.com',
    passwordHash: bcrypt.hashSync('Emp@123', 10),
    role: 'EMPLOYEE',
    is_active: true,
    department: 'Engineering',
    createdAt: '2026-02-01T11:30:00Z'
  },
  {
    id: 'usr_99815',
    name: 'Deactivated Staff',
    email: 'deactivated@staffsync.com',
    passwordHash: bcrypt.hashSync('Deact@123', 10),
    role: 'EMPLOYEE',
    is_active: false,
    department: 'Logistics',
    createdAt: '2025-11-10T08:15:00Z'
  }
];

/**
 * DEFECT 1 NOTE:
 * This method directly looks up by raw exact match without trimming or lowercasing.
 * If backend receives untrimmed or non-lowercase email directly, lookup fails.
 */
function findUserByRawEmail(rawEmail) {
  if (!rawEmail) return null;
  return users.find((u) => u.email === rawEmail) || null;
}

function findUserById(id) {
  return users.find((u) => u.id === id) || null;
}

function getAllUsersSummary() {
  return users.map(({ id, name, email, role, is_active, department }) => ({
    id,
    name,
    email,
    role,
    is_active,
    department
  }));
}

module.exports = {
  users,
  findUserByRawEmail,
  findUserById,
  getAllUsersSummary
};
