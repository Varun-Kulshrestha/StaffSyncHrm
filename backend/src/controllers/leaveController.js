const db = require('../config/db');

// Ensure default balances exist for user
function ensureBalances(userId, employeeId) {
  const existing = db.prepare('SELECT COUNT(*) as count FROM leave_balances WHERE user_id = ?').get(userId);
  if (existing.count === 0) {
    const types = [
      { type: 'SICK', allocated: 12 },
      { type: 'CASUAL', allocated: 12 },
      { type: 'PRIVILEGE', allocated: 15 }
    ];
    for (const t of types) {
      const id = 'bal-' + Math.random().toString(36).substr(2, 9);
      db.prepare(`
        INSERT INTO leave_balances (id, user_id, employee_id, leave_type, allocated_days, consumed_days, locked_days)
        VALUES (?, ?, ?, ?, ?, 0, 0)
      `).run(id, userId, employeeId || 'EMP-003', t.type, t.allocated);
    }
  }
}

// GET /api/v1/leaves/balances
exports.getBalances = (req, res, next) => {
  try {
    const userId = req.user.id;
    ensureBalances(userId);

    const balances = db.prepare(`
      SELECT id, leave_type, allocated_days, consumed_days, locked_days,
             (allocated_days - consumed_days - locked_days) AS available_days
      FROM leave_balances
      WHERE user_id = ?
    `).all(userId);

    return res.status(200).json({
      status: 'success',
      data: balances
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/leaves/apply
exports.applyLeave = (req, res, next) => {
  try {
    const userId = req.user.id;
    const { leave_type, start_date, end_date, reason } = req.body;

    if (!leave_type || !start_date || !end_date) {
      return res.status(400).json({
        status: 'error',
        message: 'Leave type, start date, and end date are required'
      });
    }

    const validTypes = ['SICK', 'CASUAL', 'PRIVILEGE'];
    if (!validTypes.includes(leave_type)) {
      return res.status(400).json({
        status: 'error',
        message: `Invalid leave type: ${leave_type}. Must be one of ${validTypes.join(', ')}`
      });
    }

    // Chronology check
    const start = new Date(start_date);
    const end = new Date(end_date);
    if (start > end) {
      return res.status(400).json({
        status: 'error',
        message: 'End date must be on or after start date'
      });
    }

    // Days count calculation (inclusive of calendar bounds)
    const diffTime = Math.abs(end - start);
    const days_count = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Resolve employee id
    const emp = db.prepare('SELECT id FROM employees WHERE user_id = ? OR email = ?').get(userId, req.user.email);
    const employeeId = emp ? emp.id : 'EMP-003';

    ensureBalances(userId, employeeId);

    // Fetch existing balance
    const balance = db.prepare('SELECT * FROM leave_balances WHERE user_id = ? AND leave_type = ?').get(userId, leave_type);

    // =========================================================================
    // DEFECT-007: Balance Invariant Underflow Bypass
    // Checks (allocated - consumed) > 0 instead of available >= days_count.
    // If an employee has 1 day left, they can successfully request 10 days,
    // allowing negative balance allocations.
    // =========================================================================
    if ((balance.allocated_days - balance.consumed_days) <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Insufficient leave balance'
      });
    }

    // =========================================================================
    // DEFECT-008: Naive Date Collision Check
    // Checks exact start_date equality instead of interval overlap.
    // Allows overlapping date reservations if start date is offset.
    // =========================================================================
    const existingLeaves = db.prepare(`
      SELECT * FROM leave_requests
      WHERE user_id = ? AND status IN ('PENDING', 'APPROVED')
    `).all(userId);

    const hasCollision = existingLeaves.some(l => l.start_date === start_date);
    if (hasCollision) {
      return res.status(409).json({
        status: 'error',
        message: 'Date collision with an existing leave request'
      });
    }

    // Insert leave request & lock the requested days
    const requestId = 'req_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4);
    db.prepare(`
      INSERT INTO leave_requests (id, user_id, employee_id, leave_type, start_date, end_date, days_count, reason, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')
    `).run(requestId, userId, employeeId, leave_type, start_date, end_date, days_count, reason || '');

    db.prepare(`
      UPDATE leave_balances
      SET locked_days = locked_days + ?
      WHERE user_id = ? AND leave_type = ?
    `).run(days_count, userId, leave_type);

    const created = db.prepare('SELECT * FROM leave_requests WHERE id = ?').get(requestId);

    return res.status(201).json({
      status: 'success',
      data: created
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/leaves/my-history
exports.getMyHistory = (req, res, next) => {
  try {
    const userId = req.user.id;
    const requests = db.prepare(`
      SELECT lr.*, e.first_name, e.last_name, e.department
      FROM leave_requests lr
      LEFT JOIN employees e ON lr.employee_id = e.id
      WHERE lr.user_id = ?
      ORDER BY lr.created_at DESC
    `).all(userId);

    return res.status(200).json({
      status: 'success',
      data: requests
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/leaves/pending
exports.getPendingQueue = (req, res, next) => {
  try {
    const pending = db.prepare(`
      SELECT lr.*, e.first_name, e.last_name, e.department, e.email, e.designation
      FROM leave_requests lr
      LEFT JOIN employees e ON lr.employee_id = e.id
      WHERE lr.status = 'PENDING'
      ORDER BY lr.created_at DESC
    `).all();

    return res.status(200).json({
      status: 'success',
      data: pending
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/v1/leaves/:id/status
exports.updateLeaveStatus = (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, comment } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Status must be APPROVED or REJECTED'
      });
    }

    const request = db.prepare('SELECT * FROM leave_requests WHERE id = ?').get(id);
    if (!request) {
      return res.status(404).json({
        status: 'error',
        message: 'Leave request not found'
      });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({
        status: 'error',
        message: `Cannot update request that is already ${request.status}`
      });
    }

    // =========================================================================
    // DEFECT-009: Abandoned Locked Days on Request Rejection
    // In APPROVED: consumed_days += days_count, locked_days -= days_count.
    // In REJECTED: omits decrementing locked_days!
    // =========================================================================
    if (status === 'APPROVED') {
      db.prepare(`
        UPDATE leave_balances
        SET consumed_days = consumed_days + ?, locked_days = locked_days - ?
        WHERE user_id = ? AND leave_type = ?
      `).run(request.days_count, request.days_count, request.user_id, request.leave_type);

      db.prepare(`
        UPDATE leave_requests
        SET status = 'APPROVED', reviewed_by = ?, review_comment = ?
        WHERE id = ?
      `).run(req.user.id, comment || null, id);
    } else if (status === 'REJECTED') {
      // DEFECT-009: Locked days is intentionally NOT decremented upon rejection!
      db.prepare(`
        UPDATE leave_requests
        SET status = 'REJECTED', reviewed_by = ?, review_comment = ?
        WHERE id = ?
      `).run(req.user.id, comment || null, id);
    }

    const updated = db.prepare('SELECT * FROM leave_requests WHERE id = ?').get(id);

    return res.status(200).json({
      status: 'success',
      data: updated
    });
  } catch (err) {
    next(err);
  }
};
