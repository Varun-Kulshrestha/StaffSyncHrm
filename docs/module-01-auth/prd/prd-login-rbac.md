# Product Requirement Document (PRD)

| Document Attribute | Details |
| --- | --- |
| **Project Name** | StaffSync HRM |
| **Module Code** | MOD-01: Authentication & RBAC |
| **Document Version** | 1.0 (Base Release) |
| **Author / Lead** | Varun Kulshrestha (QA Lead / SDET) |
| **Status** | Approved for Development & QA |
| **Target Audience** | Full-Stack Dev (AI/Antigravity), QA / Automation Engineer |

---

## 1. Executive Summary & Objective

StaffSync HRM ka primary goal corporate workforce management ko streamline karna hai. Module 1 (**Authentication & Role-Based Access Control**) application ka security gateway hai. Iska objective authenticated users (Admin, HR, Employee) ko verify karke unke role ke specific landing dashboard par safely route karna aur unauthorised access ko prevent karna hai.

---

## 2. Scope Boundaries

### In-Scope (Phase 1)
* Login web screen (Email & Password inputs, Login CTA).
* Role-based landing screens with distinctive confirmation headers.
* Session persistence on page refresh and explicit session termination (Logout).
* Client-side and server-side input validation.
* Route guards enforcing Role-Based Access Control (RBAC).
* Pre-seeded users for automated testing.

### Out-of-Scope (Deferred to Later Phases)
* User self-registration / sign-up flow (managed via backend/seed data).
* Forgot password / reset password via email link.
* Multi-Factor Authentication (MFA / 2FA) and Social OAuth (Google, GitHub).
* Account profile picture upload.

---

## 3. User Roles & Seeded Test Data

Automation testing aur reproducible test runs ke liye backend database mein neeche diye gaye 4 accounts pre-seeded rahenge:

| User Role | Seeded Email | Seeded Password | Account Status | Expected Landing Route & UI Text |
| --- | --- | --- | --- | --- |
| **Admin** | `admin@staffsync.com` | `Admin@123` | `is_active: true` | `/admin/dashboard`<br>`"Admin Logged In Successfully"` |
| **HR** | `hr@staffsync.com` | `Hr@123` | `is_active: true` | `/hr/dashboard`<br>`"HR Logged In Successfully"` |
| **Employee** | `employee@staffsync.com` | `Emp@123` | `is_active: true` | `/employee/dashboard`<br>`"Employee Logged In Successfully"` |
| **Deactivated** | `deactivated@staffsync.com` | `Deact@123` | `is_active: false` | Login Screen (Inline Error Triggered) |

---

## 4. Functional Requirements & Acceptance Criteria

### US-01: Login Screen UI & Field Validations
* **Description:** As an employee/staff member, I want to access a clean login screen so that I can submit my credentials.
* **Route:** `/login` (Base URL `/` par hit karne par redirect to `/login` if unauthenticated).
* **Acceptance Criteria:**
  1. Login form mein Email field, masked Password field (`type="password"`), aur primary 'Login' button render hona chahiye.
  2. Dono fields blank chhod kar 'Login' press karne par client-side validation triggers honge: `"Email is required"`, `"Password is required"`. Form submit nahi hoga.
  3. Email field ke leading aur trailing whitespaces automatically trim hone chahiye aur email verification case-insensitive honi chahiye.

### US-02: Role-Based Redirection & Landing Views
* **Description:** As an authenticated user, I should be routed strictly to my dedicated portal so that I see role-relevant actions.
* **Acceptance Criteria:**
  1. Valid Admin credentials par landing page `/admin/dashboard` khulega aur header text **"Admin Logged In Successfully"** render hoga.
  2. Valid HR credentials par landing page `/hr/dashboard` khulega aur header text **"HR Logged In Successfully"** render hoga.
  3. Valid Employee credentials par landing page `/employee/dashboard` khulega aur header text **"Employee Logged In Successfully"** render hoga.
  4. Har dashboard screen par top-right navigation mein ek clear `Logout` button visible hona chahiye.

### US-03: Session Lifecycle & RBAC Route Protection
* **Description:** As a system administrator, I want unauthenticated and unauthorized requests blocked from accessing private views.
* **Acceptance Criteria:**
  1. **Persistence:** Active session page refresh karne par terminate nahi honi chahiye.
  2. **Logout:** 'Logout' click karne par session destroy ho jayegi aur browser `/login` par redirect hoga. Browser ka back button dabane par authenticated dashboard access nahi hoga.
  3. **Unauthenticated Access (Guest):** Agar bina login kiye direct URL `/admin/dashboard`, `/hr/dashboard`, ya `/employee/dashboard` access kiya jaye, toh system user ko `/login` par redirect karega.
  4. **Cross-Role Access (Privilege Escalation):** Agar koi `Employee` manually URL bar mein `/admin/dashboard` daalta hai, toh use **"403 Forbidden - Access Denied"** screen render honi chahiye.

### US-04: Negative Scenarios & Error Feedback
* **Acceptance Criteria:**
  1. Galat password ya non-existing email submit karne par generic error display hoga: `"Invalid email or password"` (Status code: `401 Unauthorized`).
  2. Deactivated account (`deactivated@staffsync.com`) se login attempt karne par error trigger hoga: `"Account is deactivated. Please contact admin."` (Status code: `403 Forbidden`).

---

## 5. UI Elements & Test Automation Locators (`data-testid`)

Test automation (Selenium / Playwright) ke liye saare key UI elements par standard test IDs hone zaroori hain:

| Component | Element Type | `data-testid` Attribute | Expected Action / Content |
| --- | --- | --- | --- |
| **Email Field** | `<input type="text">` | `data-testid="input-email"` | Accepts email input |
| **Password Field** | `<input type="password">` | `data-testid="input-password"` | Masked text entry |
| **Login CTA** | `<button type="submit">` | `data-testid="btn-login"` | Triggers authentication |
| **Error Banner** | `<div>` / `<p>` | `data-testid="error-banner"` | Displays failure messages |
| **Dashboard Title** | `<h1>` | `data-testid="dashboard-title"` | Displays role landing confirmation |
| **Logout CTA** | `<button>` | `data-testid="btn-logout"` | Clears session and logs out |

---

## 6. API Specifications (High-Level Contract)

### 6.1 User Login
* **Method & Path:** `POST /api/v1/auth/login`
* **Request Payload:**
```json
{
  "email": "admin@staffsync.com",
  "password": "Admin@123"
}
```
* **Success Response (`200 OK`):**
```json
{
  "status": "success",
  "token": "<JWT_BEARER_TOKEN>",
  "user": {
    "id": "usr_99812",
    "email": "admin@staffsync.com",
    "role": "ADMIN",
    "is_active": true
  }
}
```
* **Failure Responses:**
  * `401 Unauthorized`: `{"status": "error", "message": "Invalid email or password"}`
  * `403 Forbidden`: `{"status": "error", "message": "Account is deactivated. Please contact admin."}`
  * `400 Bad Request`: `{"status": "error", "message": "Validation failed: Email and password are required."}`

### 6.2 Authenticated User Info
* **Method & Path:** `GET /api/v1/auth/me`
* **Headers:** `Authorization: Bearer <TOKEN>`
* **Success Response (`200 OK`):** Returns current user details.

### 6.3 Admin Statistics
* **Method & Path:** `GET /api/v1/admin/stats`
* **Headers:** `Authorization: Bearer <TOKEN>`
* **Success Response (`200 OK`):** System metrics, user counts, audit summaries.

### 6.4 Logout
* **Method & Path:** `POST /api/v1/auth/logout`
* **Success Response (`200 OK`):** `{"status": "success", "message": "Logged out successfully"}`

---

## 7. Quality Assurance & Intentional Seeded Defect Specifications

Module 1 ko automate karte waqt automation suite ke detection power ko verify karne ke liye ye 3 defects codebase mein exist karenge:

1. **Defect 1 (Data Sanitization Flaw):** Email trimming frontend level par ho rahi hai lekin backend API level par whitespace/casing handle nahi ho rahi.
2. **Defect 2 (Status Code & Exception Leak):** Inactive user login attempt karne par backend `403 Forbidden` ki jagah `500 Internal Server Error` fek raha hai.
3. **Defect 3 (Authorization Bypass):** Admin stats endpoint (`GET /api/v1/admin/stats`) valid token verify karta hai par user ka role `ADMIN` hona enforce nahi karta (Privilege Escalation bug).
