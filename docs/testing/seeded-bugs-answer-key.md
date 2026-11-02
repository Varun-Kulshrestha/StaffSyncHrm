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
