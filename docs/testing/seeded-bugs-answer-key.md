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

