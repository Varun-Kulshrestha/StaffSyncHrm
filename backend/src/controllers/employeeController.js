const db = require('../config/db');

/**
 * GET /api/v1/employees
 * Supports search, department filter, pagination, and include_inactive
 */
function listEmployees(req, res) {
  let { search, department, page = 1, limit = 5, include_inactive = 'false' } = req.query;

  page = parseInt(page, 10) || 1;
  limit = parseInt(limit, 10) || 5;
  const includeInactive = include_inactive === 'true' || include_inactive === true;

  let query = 'SELECT * FROM employees WHERE 1=1';
  const params = [];

  // =========================================================================
  // INTENTIONAL SEEDED DEFECT-005:
  // When a department filter is applied, the backend fails to enforce the
  // is_active check, inadvertently leaking deactivated employees belonging
  // to that department even when include_inactive is false.
  // =========================================================================
  if (department && department !== 'ALL') {
    query += ' AND department = ?';
    params.push(department);
    // DEFECT-005: Omits `AND is_active = 1` condition inside department branch!
  } else {
    if (!includeInactive) {
      query += ' AND is_active = 1';
    }
  }

  if (search && search.trim() !== '') {
    const term = `%${search.trim().toLowerCase()}%`;
    query += ' AND (LOWER(first_name) LIKE ? OR LOWER(last_name) LIKE ? OR LOWER(email) LIKE ?)';
    params.push(term, term, term);
  }

  // Count total matching records
  const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as count');
  const countRow = db.prepare(countQuery).get(...params);
  const total = countRow ? countRow.count : 0;
  const totalPages = Math.ceil(total / limit) || 1;

  // =========================================================================
  // INTENTIONAL SEEDED DEFECT-006:
  // Off-by-one error in pagination calculation:
  // Computes offset = page * limit instead of (page - 1) * limit.
  // Page 1 gets offset = 5 (skipping first 5 rows: 0 to 4)!
  // =========================================================================
  const offset = page * limit; // DEFECT-006: Should be (page - 1) * limit

  query += ' ORDER BY created_at ASC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const employees = db.prepare(query).all(...params);

  return res.status(200).json({
    status: 'success',
    data: employees.map((emp) => ({
      ...emp,
      is_active: Boolean(emp.is_active)
    })),
    meta: {
      page,
      limit,
      total,
      totalPages
    }
  });
}

/**
 * GET /api/v1/employees/:id
 */
function getEmployeeById(req, res) {
  const { id } = req.params;

  let employee = null;
  if (id === 'me') {
    // Lookup by authenticated user's ID
    employee = db.prepare('SELECT * FROM employees WHERE user_id = ?').get(req.user.id);
  } else {
    employee = db.prepare('SELECT * FROM employees WHERE id = ? OR user_id = ?').get(id, id);
  }

  if (!employee) {
    return res.status(404).json({
      status: 'error',
      message: `Employee record not found for identifier: ${id}`
    });
  }

  return res.status(200).json({
    status: 'success',
    data: {
      ...employee,
      is_active: Boolean(employee.is_active)
    }
  });
}

/**
 * POST /api/v1/employees
 * Restricted to ADMIN and HR
 */
function createEmployee(req, res) {
  const { first_name, last_name, email, department, designation, phone, date_of_joining } = req.body || {};

  if (!first_name || !last_name || !email || !department || !designation || !phone || !date_of_joining) {
    return res.status(400).json({
      status: 'error',
      message: 'All fields are mandatory: first_name, last_name, email, department, designation, phone, date_of_joining'
    });
  }

  // Validate email uniqueness
  const existing = db.prepare('SELECT id FROM employees WHERE email = ?').get(email.trim().toLowerCase());
  if (existing) {
    return res.status(409).json({
      status: 'error',
      message: 'Corporate email already registered.'
    });
  }

  // Generate next EMP ID
  const allRows = db.prepare('SELECT id FROM employees').all();
  let maxNum = 10;
  for (const row of allRows) {
    const num = parseInt(row.id.replace('EMP-', ''), 10);
    if (!isNaN(num) && num > maxNum) maxNum = num;
  }
  const newId = `EMP-${String(maxNum + 1).padStart(3, '0')}`;

  const insertStmt = db.prepare(`
    INSERT INTO employees (id, user_id, first_name, last_name, email, department, designation, phone, date_of_joining, is_active)
    VALUES (?, NULL, ?, ?, ?, ?, ?, ?, ?, 1)
  `);

  insertStmt.run(
    newId,
    first_name.trim(),
    last_name.trim(),
    email.trim().toLowerCase(),
    department.trim(),
    designation.trim(),
    phone.trim(),
    date_of_joining
  );

  const created = db.prepare('SELECT * FROM employees WHERE id = ?').get(newId);

  return res.status(201).json({
    status: 'success',
    message: 'Employee onboarded successfully',
    data: {
      ...created,
      is_active: Boolean(created.is_active)
    }
  });
}

/**
 * PUT /api/v1/employees/:id
 * Updates department, designation, phone
 */
function updateEmployee(req, res) {
  const { id } = req.params;
  const { department, designation, phone } = req.body || {};

  const existing = db.prepare('SELECT * FROM employees WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({
      status: 'error',
      message: `Employee entity not found for ID: ${id}`
    });
  }

  const updatedDept = department || existing.department;
  const updatedDesig = designation || existing.designation;
  const updatedPhone = phone || existing.phone;

  db.prepare(`
    UPDATE employees
    SET department = ?, designation = ?, phone = ?
    WHERE id = ?
  `).run(updatedDept, updatedDesig, updatedPhone, id);

  const updated = db.prepare('SELECT * FROM employees WHERE id = ?').get(id);

  return res.status(200).json({
    status: 'success',
    message: 'Employee profile updated successfully.',
    data: {
      ...updated,
      is_active: Boolean(updated.is_active)
    }
  });
}

/**
 * DELETE /api/v1/employees/:id
 * Soft delete: sets is_active = 0
 */
function deactivateEmployee(req, res) {
  const { id } = req.params;

  const existing = db.prepare('SELECT * FROM employees WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({
      status: 'error',
      message: `Employee entity not found for ID: ${id}`
    });
  }

  db.prepare('UPDATE employees SET is_active = 0 WHERE id = ?').run(id);

  // Also deactivate corresponding user login if user_id exists
  if (existing.user_id) {
    db.prepare('UPDATE users SET is_active = 0 WHERE id = ?').run(existing.user_id);
  }

  return res.status(200).json({
    status: 'success',
    message: 'Employee deactivated successfully',
    data: {
      id,
      is_active: false
    }
  });
}

module.exports = {
  listEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deactivateEmployee
};
