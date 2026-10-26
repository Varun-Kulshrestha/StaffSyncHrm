# QA Testing Secret Answer Key: Seeded Intentional Defects

**Module:** MOD-01 Authentication & RBAC  
**Project:** StaffSync HRM  
**Target Audience:** QA Lead / SDET (Varun Kulshrestha)  
**Classification:** Confidential QA Key  

---

## Executive Summary

To validate the test automation suite's bug detection capabilities, three realistic defects have been intentionally planted across the backend codebase. This document outlines the defect descriptions, exact file locations, expected vs actual behaviors, test automation verification steps, and proposed patches.

---

## 1. Defect 1: Input Sanitization & Case Normalization Flaw

### Summary
The client-side UI performs `.trim()` on the email input, giving a false impression that whitespace and case handling are robust. However, the backend login controller fails to sanitize or normalize incoming email strings.

* **Defect ID:** `DEFECT-001`
* **Severity:** Medium
* **Category:** Data Sanitization / API Robustness
* **File Location:** `backend/src/controllers/authController.js`
* **Method:** `login`
* **Vulnerable Code Snippet:**
  ```javascript
  // DEFECT 1: Raw email comparison without .trim() or .toLowerCase()
  const user = findUserByEmail(email); 
  ```

### Expected Behavior
- Any valid email variation (e.g. `" admin@staffsync.com "` or `"Admin@staffsync.com"`) sent directly to `POST /api/v1/auth/login` should be sanitized (trimmed and lowercase-normalized) by the backend before database lookup.
- Status code should be `200 OK` with valid JWT token.

### Actual Behavior
- The backend compares the raw input directly against `user.email`.
- Because the seeded database stores `"admin@staffsync.com"`, any leading/trailing spaces or uppercase characters fail exact match.
- Returns `401 Unauthorized` (`"Invalid email or password"`).

### How to Catch via Automation
1. Send an API POST request to `/api/v1/auth/login` with `{"email": " admin@staffsync.com ", "password": "Admin@123"}`.
2. Assert status is `200 OK`.
3. Test will FAIL with `401 Unauthorized`.

---

## 2. Defect 2: Status Code & Exception Leak on Deactivated Account Login

### Summary
When an inactive user (`deactivated@staffsync.com`) attempts to log in, instead of returning an HTTP 403 Forbidden with a user-friendly error message, the controller throws an unhandled exception that propagates to the 500 error handler.

* **Defect ID:** `DEFECT-002`
* **Severity:** High
* **Category:** Error Handling / Information Disclosure
* **File Location:** `backend/src/controllers/authController.js`
* **Method:** `login`
* **Vulnerable Code Snippet:**
  ```javascript
  // DEFECT 2: Throws unhandled exception instead of returning 403 Forbidden
  if (!user.is_active) {
    throw new Error(`CRITICAL_ACCOUNT_DEACTIVATED_EXCEPTION: User status is inactive for ${user.email}`);
  }
  ```

### Expected Behavior
- Request returns HTTP `403 Forbidden`.
- Response JSON:
  ```json
  {
    "status": "error",
    "message": "Account is deactivated. Please contact admin."
  }
  ```

### Actual Behavior
- An unhandled error is thrown.
- Backend responds with HTTP `500 Internal Server Error`.
- Leaks exception details in response:
  ```json
  {
    "status": "error",
    "message": "Internal Server Error: CRITICAL_ACCOUNT_DEACTIVATED_EXCEPTION..."
  }
  ```

### How to Catch via Automation
1. Submit login request with `email: "deactivated@staffsync.com"`, `password: "Deact@123"`.
2. Assert response status code is `403`.
3. Test will FAIL because status is `500`.

---

## 3. Defect 3: RBAC Privilege Escalation Leak on Admin Statistics Endpoint

### Summary
The administrative metrics endpoint `/api/v1/admin/stats` validates whether a valid JWT bearer token is present (`verifyToken`), but fails to verify that the user's role is `ADMIN`. As a result, any authenticated user (e.g. `EMPLOYEE` or `HR`) can access confidential system statistics.

* **Defect ID:** `DEFECT-003`
* **Severity:** Critical
* **Category:** Broken Object Level / Role-Based Authorization (BOLA/RBAC Bypass)
* **File Location:** `backend/src/routes/adminRoutes.js`
* **Endpoint:** `GET /api/v1/admin/stats`
* **Vulnerable Code Snippet:**
  ```javascript
  // DEFECT 3: Only verifyToken is applied; requireRole('ADMIN') middleware is missing!
  router.get('/stats', verifyToken, getAdminStats);
  ```

### Expected Behavior
- When an `EMPLOYEE` or `HR` token calls `GET /api/v1/admin/stats`, the server should block the request with HTTP `403 Forbidden` (`{"status": "error", "message": "Access denied. Admin role required."}`).

### Actual Behavior
- The server only checks if the JWT token is cryptographically valid.
- The request succeeds with HTTP `200 OK` and returns sensitive administrative analytics to an ordinary employee.

### How to Catch via Automation
1. Login as `employee@staffsync.com` / `Emp@123` to obtain an Employee JWT.
2. Send `GET /api/v1/admin/stats` with `Authorization: Bearer <EMPLOYEE_JWT>`.
3. Assert response status code is `403 Forbidden`.
4. Test will FAIL because status is `200 OK`.
