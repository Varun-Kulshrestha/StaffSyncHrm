# QA Testing Secret Answer Key: Seeded Intentional Defects

**Module:** MOD-01 Authentication & RBAC  
**Project:** StaffSync HRM  
**Target Audience:** QA Lead / SDET  
**Status:** Seeded & Verified  

---

## 1. Defect 1: Input Sanitization Flaw (DEFECT-001)

* **Defect ID:** `DEFECT-001`
* **Severity:** Medium
* **Category:** Data Sanitization / API Robustness
* **File Location:** `backend/src/controllers/authController.js` (Method: `login`)
* **Vulnerable Code Snippet:**
  ```javascript
  // DEFECT-001: Raw email comparison without trimming or lowercasing
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  ```
* **Expected Behavior:** Any valid email variation with spaces (e.g., `" admin@staffsync.com "`) or mixed casing should be sanitized via `.trim().toLowerCase()` prior to querying the database, succeeding with HTTP `200 OK`.
* **Actual Behavior:** Direct exact-match query in SQLite fails for untrimmed or casing-mismatched email strings, returning HTTP `401 Unauthorized` (`"Invalid email or password"`).

---

## 2. Defect 2: Unhandled Inactive User Exception (DEFECT-002)

* **Defect ID:** `DEFECT-002`
* **Severity:** High
* **Category:** Error Handling / Information Leak
* **File Location:** `backend/src/controllers/authController.js` (Method: `login`)
* **Vulnerable Code Snippet:**
  ```javascript
  // DEFECT-002: Throws unhandled exception instead of returning 403 Forbidden
  if (!user.is_active) {
    throw new Error(`CRITICAL_ACCOUNT_DEACTIVATED_EXCEPTION: Account is inactive for ${user.email}`);
  }
  ```
* **Expected Behavior:** Return HTTP `403 Forbidden` with body `{ "status": "error", "message": "Account is deactivated. Please contact admin." }`.
* **Actual Behavior:** An unhandled error is thrown, caught by `errorHandler`, returning HTTP `500 Internal Server Error` with stack/error details.

---

## 3. Defect 3: RBAC Privilege Escalation on Admin Statistics (DEFECT-003)

* **Defect ID:** `DEFECT-003`
* **Severity:** Critical
* **Category:** Broken Object Level / Role-Based Authorization (RBAC Bypass)
* **File Location:** `backend/src/routes/adminRoutes.js` (Endpoint: `GET /api/v1/admin/stats`)
* **Vulnerable Code Snippet:**
  ```javascript
  // DEFECT-003: verifyToken/authMiddleware is present, but roleGuard(['ADMIN']) is omitted
  router.get('/stats', authMiddleware, getAdminStats);
  ```
* **Expected Behavior:** Calls from non-admin accounts (e.g. `EMPLOYEE` or `HR`) must be rejected with HTTP `403 Forbidden` (`"403 Forbidden - Access Denied"`).
* **Actual Behavior:** Valid JWT token passes `authMiddleware`, allowing any authenticated `EMPLOYEE` to view system metrics with HTTP `200 OK`.

---

## 4. Defect 4: IDOR / Broken Function Level Authorization on Profile Edit (DEFECT-004)

* **Defect ID:** `DEFECT-004`
* **Module:** MOD-02 Employee Lifecycle & Directory Management
* **Severity:** High
* **Category:** Insecure Direct Object Reference (IDOR) / Broken Access Control
* **File Location:** `backend/src/routes/employeeRoutes.js` (Endpoint: `PUT /api/v1/employees/:id`)
* **Vulnerable Code Snippet:**
  ```javascript
  // DEFECT-004: roleGuard(['ADMIN', 'HR']) is omitted from the PUT route chain
  router.put('/:id', authMiddleware, updateEmployee);
  ```
* **Expected Behavior:** Only `ADMIN` and `HR` roles should be permitted to update employee profiles; standard `EMPLOYEE` role requests must be rejected with HTTP `403 Forbidden`.
* **Actual Behavior:** The endpoint omits `roleGuard`, allowing an authenticated `EMPLOYEE` to modify any employee's designation, department, and phone details, succeeding with HTTP `200 OK`.

---

## 5. Defect 5: Query Leakage of Soft-Deleted Employees on Department Filter (DEFECT-005)

* **Defect ID:** `DEFECT-005`
* **Module:** MOD-02 Employee Lifecycle & Directory Management
* **Severity:** Medium
* **Category:** Query Filtration / Information Disclosure
* **File Location:** `backend/src/controllers/employeeController.js` (Method: `listEmployees`)
* **Vulnerable Code Snippet:**
  ```javascript
  // DEFECT-005: Department filter branch omits the is_active = 1 condition
  if (department && department !== 'ALL') {
    query += ' AND department = ?';
    params.push(department);
  }
  ```
* **Expected Behavior:** Deactivated personnel (e.g., `EMP-004` Marcus Thorne in Sales) should remain excluded from directory listings unless `?include_inactive=true` is explicitly requested.
* **Actual Behavior:** Applying `?department=Sales` queries without `is_active = 1`, causing inactive/offboarded employees to leak into directory results even with default `include_inactive=false`.

---

## 6. Defect 6: Zero-Base Off-By-One Skip in Pagination Offset Calculation (DEFECT-006)

* **Defect ID:** `DEFECT-006`
* **Module:** MOD-02 Employee Lifecycle & Directory Management
* **Severity:** Medium
* **Category:** Functional Calculation Flaw
* **File Location:** `backend/src/controllers/employeeController.js` (Method: `listEmployees`)
* **Vulnerable Code Snippet:**
  ```javascript
  // DEFECT-006: Computes offset = page * limit instead of (page - 1) * limit
  const offset = page * limit;
  ```
* **Expected Behavior:** For Page 1 with limit 5, offset should be `(1 - 1) * 5 = 0`, returning records 0 to 4.
* **Actual Behavior:** For Page 1 with limit 5, offset evaluates to `1 * 5 = 5`, immediately skipping the first 5 records (`EMP-001` to `EMP-005`) and rendering records 5 to 9 instead.

---

### DEFECT-007: Balance Invariant Underflow Bypass (Leave Quota Overbooking)
* **Module:** MOD-03: Leave Management & Approval Workflow
* **Subsystem / Source File:** `backend/src/controllers/leaveController.js` (`applyLeave`)
* **Severity:** Critical
* **Bug Description:**
  The validation logic checks `(balance.allocated_days - balance.consumed_days) <= 0` instead of verifying whether available days (`allocated - consumed - locked`) can accommodate `requested_days`.
* **Reproduction Steps:**
  1. Authenticate as employee (`employee@staffsync.com`).
  2. With available Casual Leave quota of 9 days (or 1 day), submit a leave request for 15 days from `2026-11-20` to `2026-12-04`.
  3. POST payload to `/api/v1/leaves/apply`.
* **Expected Behavior:** Returns HTTP 400 Bad Request with message `"Insufficient leave balance"`.
* **Actual Behavior:** Returns HTTP 201 Created and locks 15 days, sending net available balance into negative integers (`9 - 15 = -6`).

---

### DEFECT-008: Naive Date Collision Check on Overlapping Bookings
* **Module:** MOD-03: Leave Management & Approval Workflow
* **Subsystem / Source File:** `backend/src/controllers/leaveController.js` (`applyLeave`)
* **Severity:** High
* **Bug Description:**
  Temporal collision verification implements an exact point-in-time check (`leave.start_date === start_date`) rather than interval intersection (`start_date <= existing.end_date && end_date >= existing.start_date`).
* **Reproduction Steps:**
  1. Have an active pending leave request for dates `2026-11-10` to `2026-11-12`.
  2. Submit a new leave request spanning `2026-11-11` to `2026-11-13`.
* **Expected Behavior:** Returns HTTP 409 Conflict with message `"Date collision with an existing leave request"`.
* **Actual Behavior:** Since `2026-11-11 !== 2026-11-10`, the exact equality check passes, returning HTTP 201 Created and permitting double-booked time off.

---

### DEFECT-009: Abandoned Locked Days on Request Rejection
* **Module:** MOD-03: Leave Management & Approval Workflow
* **Subsystem / Source File:** `backend/src/controllers/leaveController.js` (`updateLeaveStatus`)
* **Severity:** High
* **Bug Description:**
  When transitioning a leave request to `REJECTED`, the database update marks the request as `REJECTED` but omits decrementing `locked_days` in `leave_balances`.
* **Reproduction Steps:**
  1. Employee applies for 3 days of leave; `locked_days` increments from 0 to 3.
  2. Admin or HR calls `PATCH /api/v1/leaves/:id/status` with `{ "status": "REJECTED" }`.
* **Expected Behavior:** `locked_days` should decrement by 3, releasing the days back to the employee's available balance.
* **Actual Behavior:** `leave_requests.status` becomes `REJECTED`, but `locked_days` remains 3 forever, permanently withholding those days from the employee.

---

### DEFECT-010: UTC Date Parsing Offset in Daily Clock-In
* **Module:** MOD-04: Attendance & Timesheet Management
* **Subsystem / Source File:** `backend/src/controllers/attendanceController.js` (`clockIn`)
* **Severity:** Medium
* **Bug Description:**
  The date column is populated using `.toISOString().split('T')[0]` (UTC date) rather than local operational timezone formatting. Shifts commencing during late evening hours in local time will have their records attached to the previous UTC day.
* **Reproduction Steps:**
  1. Trigger `POST /api/v1/attendance/clock-in` during evening/night hours (e.g. 11:30 PM IST, which is 6:00 PM UTC).
  2. Inspect the generated attendance record's `date` field.
* **Expected Behavior:** Date matches local organizational work date (e.g., `2026-11-04`).
* **Actual Behavior:** Date records as UTC date, misaligning timesheet logs across midnight boundaries.

---

### DEFECT-011: Missing Concurrency Gate on Simultaneous Session Creation
* **Module:** MOD-04: Attendance & Timesheet Management
* **Subsystem / Source File:** `backend/src/controllers/attendanceController.js` (`clockIn`)
* **Severity:** High
* **Bug Description:**
  In `POST /api/v1/attendance/clock-in`, there is no concurrency gate or table mutex. Rapid simultaneous clock-in clicks (dispatched concurrently within 50ms) both evaluate `activeSession` as null and insert duplicate open sessions for the same user.
* **Reproduction Steps:**
  1. Authenticate as employee.
  2. Dispatch two simultaneous `POST /api/v1/attendance/clock-in` requests using `Promise.all()`.
* **Expected Behavior:** First request returns HTTP 201 Created; second request returns HTTP 400 Bad Request with code `"ACTIVE_SESSION_EXISTS"`.
* **Actual Behavior:** Both requests return HTTP 201 Created, creating duplicate concurrent `IN_PROGRESS` sessions for the employee.

---

### DEFECT-012: Off-By-One Boundary Error on Half-Day Status Classification
* **Module:** MOD-04: Attendance & Timesheet Management
* **Subsystem / Source File:** `backend/src/controllers/attendanceController.js` (`clockOut`)
* **Severity:** High
* **Bug Description:**
  The statutory threshold for `HALF_DAY` classification implements a strict inequality `if (durationMinutes > 240)` instead of `if (durationMinutes >= 240)`.
* **Reproduction Steps:**
  1. Open a clock-in session.
  2. Clock out after exactly 240.0 minutes (4.0 hours).
* **Expected Behavior:** Session classified as `HALF_DAY` (since 240 minutes meets statutory half-day duration).
* **Actual Behavior:** Strict `> 240` condition evaluates to false, improperly tagging the session as `ABSENT`.



