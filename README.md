# StaffSync HRM - Enterprise Workforce Management Portal

[![Status](https://img.shields.io/badge/Module%2001-Completed-10b981?style=for-the-badge)](https://github.com/Varun-Kulshrestha/StaffSyncHrm)
[![Role](https://img.shields.io/badge/Architecture-Full--Stack%20%2B%20RBAC-6366f1?style=for-the-badge)](https://github.com/Varun-Kulshrestha/StaffSyncHrm)
[![QA](https://img.shields.io/badge/SDET%20Ready-Seeded%20Defects-f59e0b?style=for-the-badge)](https://github.com/Varun-Kulshrestha/StaffSyncHrm)

StaffSync HRM is a modern enterprise Human Resource Management web platform built for streamlined employee lifecycle operations, role-based access control, and automated QA testing.

---

## 📌 Abhi Tak Kya Kya Ban Chuka Hai (Delivered Scope)

### 1. Module 01: Authentication & Role-Based Access Control (RBAC) — [COMPLETED]
* **Frontend Web Application (React 18 + Vite):**
  * Modern dark glassmorphic design system with Google Fonts (**Outfit** & **Inter**).
  * `/login` portal with client-side field validation (`"Email is required"`, `"Password is required"`).
  * Email whitespace auto-trimming and masked password toggle.
  * Role-based landing screens with distinctive confirmation headers:
    * `/admin/dashboard` ➔ Header H1: `"Admin Logged In Successfully"`
    * `/hr/dashboard` ➔ Header H1: `"HR Logged In Successfully"`
    * `/employee/dashboard` ➔ Header H1: `"Employee Logged In Successfully"`
  * Route Guards enforcing RBAC:
    * Guests attempting direct URL access are redirected to `/login`.
    * Cross-role navigation (e.g. Employee visiting `/admin/dashboard`) renders `"403 Forbidden - Access Denied"`.
  * Session persistence across browser refresh using tokenized storage.
  * Explicit `Logout` button destroying session and blocking browser history back traversal.
  * Quick-fill QA test buttons for 1-click test credentials input.

* **Backend REST API (Node.js + Express):**
  * Running on port `5000` with JSON Web Token (JWT) generation (8-hour expiry).
  * Bcrypt password encryption (Salt rounds: 10).
  * CORS and request logging middleware.
  * Implemented Endpoints:
    * `POST /api/v1/auth/login` (Authentication & JWT token generation)
    * `GET  /api/v1/auth/me` (Protected current user context retrieval)
    * `GET  /api/v1/admin/stats` (Administrative metrics & operational analytics)
    * `POST /api/v1/auth/logout` (Session invalidation acknowledgment)
    * `GET  /api/health` (Service health check)

* **Seeded Test Accounts:**
  * `admin@staffsync.com` / `Admin@123` (Role: `ADMIN`, Active)
  * `hr@staffsync.com` / `Hr@123` (Role: `HR`, Active)
  * `employee@staffsync.com` / `Emp@123` (Role: `EMPLOYEE`, Active)
  * `deactivated@staffsync.com` / `Deact@123` (Role: `EMPLOYEE`, Inactive)

* **Intentional QA Bug Seeding (For SDET Automation Testing):**
  1. `DEFECT-001` (Input Sanitization): Backend does not sanitize or normalize email strings; untrimmed email requests return `401 Unauthorized`.
  2. `DEFECT-002` (Status Code & Exception Leak): Inactive user login attempt throws an unhandled exception returning `500 Internal Server Error` instead of `403 Forbidden`.
  3. `DEFECT-003` (RBAC Privilege Leak): `/api/v1/admin/stats` validates token presence but omits the admin role requirement; employee tokens can read admin stats.

* **Automated Smoke & Defect Verification Suite:**
  * Script: `automation/backend-api-check.js` (Tests all endpoints and asserts the presence of the 3 intentional bugs).

---

## 📂 Documentation Sitemap (Kaun Si MD File Kiske Liye Hai)

| Document Path | Purpose |
|---|---|
| 📄 **[README.md](file:///f:/StaffSyncHrm/README.md)** | **Master Project Summary & Status:** Project overview, kya ban chuka hai, running commands, and complete structure. |
| 📄 **[docs/module-01-auth/prd/prd-login-rbac.md](file:///f:/StaffSyncHrm/docs/module-01-auth/prd/prd-login-rbac.md)** | **Approved PRD:** Module 1 requirements, scope boundaries, acceptance criteria, test user specifications, and UI locators. |
| 📄 **[docs/module-01-auth/development/architecture-and-api.md](file:///f:/StaffSyncHrm/docs/module-01-auth/development/architecture-and-api.md)** | **Technical Specs:** Backend architecture, Express middleware structure, data model, and API contract specifications. |
| 📄 **[docs/module-01-auth/testing/seeded-bugs-answer-key.md](file:///f:/StaffSyncHrm/docs/module-01-auth/testing/seeded-bugs-answer-key.md)** | **QA Secret Answer Key:** Exact code lines and filenames of the 3 seeded bugs, expected vs actual behaviors, and automated detection tests. |
| 📄 **[automation/README.md](file:///f:/StaffSyncHrm/automation/README.md)** | **Automation Testing Guide:** QA checklist for automated regression test cases (Playwright/Selenium). |
| 📄 **[credentials.md](file:///f:/StaffSyncHrm/credentials.md)** *(Local)* | **Project Credentials:** GitHub repo link, PAT token, seeded logins, and local endpoints. *(Git ignored for security)*. |

---

## 🎯 Test Automation Locators (`data-testid`)

| Element | Selector Attribute | Purpose |
|---|---|---|
| Email Input | `data-testid="input-email"` | Accepts username/email |
| Password Input | `data-testid="input-password"` | Masked password entry |
| Login Button | `data-testid="btn-login"` | Form submission CTA |
| Error Message Banner | `data-testid="error-banner"` | Displays authentication & validation errors |
| Role Landing Title | `data-testid="dashboard-title"` | Displays role-specific confirmation heading `<h1>` |
| Logout Button | `data-testid="btn-logout"` | Terminates authenticated session |

---

## 🚀 How to Run Locally

### 1. Start Backend API Server
```bash
cd backend
npm install
npm run dev
# Server will run at http://localhost:5000
```

### 2. Start Frontend Web Client
```bash
cd frontend
npm install
npm run dev
# App will run at http://localhost:3000 (proxies /api to :5000)
```

### 3. Run Automated Smoke & Defect Check
```bash
npm run test:api
# Or: node automation/backend-api-check.js
```
