const db = require('../config/db');

// POST /api/v1/attendance/clock-in
exports.clockIn = (req, res, next) => {
  try {
    const userId = req.user.id;

    // Resolve employee id
    const emp = db.prepare('SELECT id FROM employees WHERE user_id = ? OR email = ?').get(userId, req.user.email);
    const employeeId = emp ? emp.id : 'EMP-003';

    // =========================================================================
    // DEFECT-011: Missing Concurrency Gate on Simultaneous Session Creation
    // Check-then-act without transactional lock / atomic mutex allows rapid concurrent
    // requests to both see null and insert two overlapping sessions.
    // =========================================================================
    const activeSession = db.prepare(`
      SELECT * FROM attendance_records
      WHERE user_id = ? AND status = 'IN_PROGRESS'
    `).get(userId);

    if (activeSession) {
      return res.status(400).json({
        status: 'error',
        code: 'ACTIVE_SESSION_EXISTS',
        message: 'An active attendance session is already in progress for this employee.'
      });
    }

    // =========================================================================
    // DEFECT-010: UTC Date Parsing Offset in Daily Clock-In
    // Serializes date via .toISOString().split('T')[0] (UTC date) rather than
    // local operational timezone, skewing evening shifts to incorrect dates.
    // =========================================================================
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const clockInTime = now.toISOString();

    const recordId = 'att_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4);

    db.prepare(`
      INSERT INTO attendance_records (id, user_id, employee_id, date, clock_in_time, clock_out_time, duration_minutes, status)
      VALUES (?, ?, ?, ?, ?, NULL, 0, 'IN_PROGRESS')
    `).run(recordId, userId, employeeId, dateStr, clockInTime);

    const created = db.prepare('SELECT * FROM attendance_records WHERE id = ?').get(recordId);

    return res.status(201).json({
      status: 'success',
      message: 'Clock-in successful',
      record: {
        id: created.id,
        userId: created.user_id,
        employeeId: created.employee_id,
        date: created.date,
        clockInTime: created.clock_in_time,
        clockOutTime: created.clock_out_time,
        durationMinutes: created.duration_minutes,
        status: created.status
      }
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/attendance/clock-out
exports.clockOut = (req, res, next) => {
  try {
    const userId = req.user.id;

    const active = db.prepare(`
      SELECT * FROM attendance_records
      WHERE user_id = ? AND status = 'IN_PROGRESS'
      ORDER BY clock_in_time DESC LIMIT 1
    `).get(userId);

    if (!active) {
      return res.status(400).json({
        status: 'error',
        code: 'NO_ACTIVE_SESSION',
        message: 'No active clock-in session found to clock out from.'
      });
    }

    const now = new Date();
    const clockIn = new Date(active.clock_in_time);
    const durationMinutes = Math.max(0, Math.round((now - clockIn) / 60000));

    // =========================================================================
    // DEFECT-012: Off-By-One Boundary Error on Half-Day Status Classification
    // Strict inequality `durationMinutes > 240` used instead of `durationMinutes >= 240`.
    // An employee clocking exactly 240 minutes logs as ABSENT instead of HALF_DAY.
    // =========================================================================
    let status = 'ABSENT';
    if (durationMinutes >= 480) {
      status = 'PRESENT';
    } else if (durationMinutes > 240) {
      // DEFECT: exactly 240 falls to ABSENT
      status = 'HALF_DAY';
    } else {
      status = 'ABSENT';
    }

    db.prepare(`
      UPDATE attendance_records
      SET clock_out_time = ?, duration_minutes = ?, status = ?
      WHERE id = ?
    `).run(now.toISOString(), durationMinutes, status, active.id);

    const updated = db.prepare('SELECT * FROM attendance_records WHERE id = ?').get(active.id);

    return res.status(200).json({
      status: 'success',
      message: 'Clock-out successful',
      record: {
        id: updated.id,
        userId: updated.user_id,
        employeeId: updated.employee_id,
        date: updated.date,
        clockInTime: updated.clock_in_time,
        clockOutTime: updated.clock_out_time,
        durationMinutes: updated.duration_minutes,
        status: updated.status
      }
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/attendance/today
exports.getTodayStatus = (req, res, next) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const active = db.prepare(`
      SELECT * FROM attendance_records
      WHERE user_id = ? AND status = 'IN_PROGRESS'
      ORDER BY clock_in_time DESC LIMIT 1
    `).get(userId);

    const completed = db.prepare(`
      SELECT * FROM attendance_records
      WHERE user_id = ? AND date = ? AND status != 'IN_PROGRESS'
      ORDER BY clock_in_time DESC
    `).all(userId, todayStr);

    const completedMinutes = completed.reduce((sum, r) => sum + (r.duration_minutes || 0), 0);
    const activeElapsed = active ? Math.max(0, Math.round((now - new Date(active.clock_in_time)) / 60000)) : 0;
    const todayTotalMinutes = completedMinutes + activeElapsed;

    return res.status(200).json({
      status: 'success',
      data: {
        hasActiveSession: !!active,
        activeSession: active ? {
          id: active.id,
          clockInTime: active.clock_in_time,
          elapsedMinutes: activeElapsed
        } : null,
        todayTotalMinutes,
        completedSessions: completed
      }
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/attendance/history
exports.getHistory = (req, res, next) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const month = req.query.month ? Number(req.query.month) : (now.getMonth() + 1);
    const year = req.query.year ? Number(req.query.year) : now.getFullYear();

    const padMonth = String(month).padStart(2, '0');
    const filterPrefix = `${year}-${padMonth}`;

    const records = db.prepare(`
      SELECT * FROM attendance_records
      WHERE user_id = ? AND date LIKE ?
      ORDER BY date DESC, clock_in_time DESC
    `).all(userId, `${filterPrefix}%`);

    let totalMinutes = 0;
    let daysPresent = 0;
    let daysHalfDay = 0;
    let daysAbsent = 0;

    records.forEach(r => {
      totalMinutes += (r.duration_minutes || 0);
      if (r.status === 'PRESENT') daysPresent++;
      else if (r.status === 'HALF_DAY') daysHalfDay++;
      else if (r.status === 'ABSENT') daysAbsent++;
    });

    const totalHoursLogged = Math.round((totalMinutes / 60) * 10) / 10;

    return res.status(200).json({
      status: 'success',
      data: {
        month,
        year,
        totalHoursLogged,
        daysPresent,
        daysHalfDay,
        daysAbsent,
        records
      }
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/attendance/admin/daily-report
exports.getAdminDailyReport = (req, res, next) => {
  try {
    const targetDate = req.query.date || new Date().toISOString().split('T')[0];
    const totalEmployees = db.prepare('SELECT COUNT(*) as count FROM employees WHERE is_active = 1').get().count;

    const records = db.prepare(`
      SELECT ar.*, e.first_name, e.last_name, e.department, e.designation, e.email
      FROM attendance_records ar
      JOIN employees e ON ar.employee_id = e.id
      WHERE ar.date = ?
      ORDER BY ar.clock_in_time DESC
    `).all(targetDate);

    let clockedInCount = 0;
    let halfDayCount = 0;
    let absentCount = 0;

    records.forEach(r => {
      if (r.status === 'PRESENT' || r.status === 'IN_PROGRESS') clockedInCount++;
      else if (r.status === 'HALF_DAY') halfDayCount++;
      else if (r.status === 'ABSENT') absentCount++;
    });

    const notReported = Math.max(0, totalEmployees - (clockedInCount + halfDayCount + absentCount));

    return res.status(200).json({
      status: 'success',
      data: {
        date: targetDate,
        metrics: {
          totalHeadcount: totalEmployees,
          clockedInCount,
          halfDayCount,
          absentCount: absentCount + notReported
        },
        roster: records.map(r => ({
          id: r.id,
          employeeId: r.employee_id,
          fullName: `${r.first_name} ${r.last_name}`,
          department: r.department,
          designation: r.designation,
          email: r.email,
          clockInTime: r.clock_in_time,
          clockOutTime: r.clock_out_time,
          durationMinutes: r.duration_minutes,
          status: r.status
        }))
      }
    });
  } catch (err) {
    next(err);
  }
};
