# StaffSync HRM - Enterprise Human Resource Management Portal

[![Node.js Version](https://img.shields.io/badge/Node.js-v18%2B%20%7C%20v22-green.svg)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-SQLite%20(better--sqlite3)-blue.svg)](https://www.sqlite.org/)
[![Frontend](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-purple.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)]()

StaffSync HRM is a modern, enterprise-grade Human Resource Management web application delivering fine-grained Role-Based Access Control (RBAC), end-to-end workforce lifecycle management, statutory leave entitlement workflows, and biometric-precision attendance timesheets.

---

## 🏗️ System Architecture & Technology Stack

The application employs a decoupled 3-tier client-server architecture:

```
StaffSync HRM Architecture
├── Frontend Tier: React 18 SPA (Vite, Vanilla CSS Modern Glassmorphism Design System, Lucide Icons)
│   ├── Port: 3000
│   └── Reverse Proxy: /api -> http://localhost:5000
├── Application Gateway & REST API: Express.js (Node.js runtime)
│   ├── Port: 5000
│   ├── Security: JWT Bearer Tokens (8h Sliding Window), CORS Whitelisting, Bcrypt (10 Salt Rounds)
│   └── RBAC: Strict middleware hierarchy (authMiddleware -> roleGuard)
└── Persistence Tier: Embedded SQLite Database
    ├── Driver: better-sqlite3 (Native WAL Mode enabled for high-concurrency read/write)
    └── File Path: backend/src/database/staffsync.db
```

---

## 📦 Functional Modules Overview

### Module 01: Authentication & Role-Based Access Control (RBAC)
* **Secure JWT Sessions:** 8-hour token issuance with role-aware route guards protecting routes based on `ADMIN`, `HR`, and `EMPLOYEE` privileges.
* **1-Click Test Credential Quickfill:** Instant persona switching on `/login` between all seeded administrative and staff roles.
* **Role Landing Portals:**
  * `/admin/dashboard`: Infrastructure metrics, user accounts audit, and system health telemetry.
  * `/hr/dashboard`: Talent onboarding pipeline, department overview, and review actions.
  * `/employee/dashboard`: Self-service portal with profile verification and personal workflows.

### Module 02: Employee Lifecycle & Directory Management
* **Personnel Directory (`<EmployeeDirectory />`):** Full-text real-time search across first/last names and corporate email addresses.
* **Department Filtering:** Instant multi-department categorization (`Engineering`, `HR`, `Sales`, `Finance`, `Operations`).
* **Workforce Actions:** Modal onboarding (`Add Employee`), profile modification (`Edit`), and soft-deletion offboarding (`Deactivate`).
* **Verified Profile Card (`<ReadOnlyProfileCard />`):** Non-tamperable identity viewer for logged-in employees.

### Module 03: Leave Management & Approval Workflows
* **Statutory Policy Ledgers (`<LeaveBalanceCards />`):** Live accounting across Sick Leave (12d), Casual Leave (12d), and Privilege Leave (15d).
* **Self-Service Application Modal (`<ApplyLeaveModal />`):** Calendar validation, balance sufficiency checks, and day reservation.
* **Multi-Tenant Review Queue (`<PendingApprovalsQueue />`):** Administrative console for managers and HR to review absence rationales with 1-click Approval and Rejection actions.
* **Personal Historical Audit (`<LeaveHistoryTable />`):** Complete chronological tracking of all past requests with review remarks.

### Module 04: Attendance Tracking, Live Timers & Timesheets
* **1-Click Biometric Punch (`<ClockWidget />`):** Single-click Clock-In / Clock-Out state transitions with double-punch guard.
* **High-Precision Session Ticker (`<ActiveTimer />`):** Real-time `HH:mm:ss` live display calculated from session initiation.
* **Statutory Shift Thresholds:**
  * **PRESENT:** $\ge$ 480 minutes (8.0 hours)
  * **HALF_DAY:** $\ge$ 240 minutes (4.0 hours)
  * **ABSENT:** &lt; 240 minutes (&lt; 4.0 hours)
* **Monthly Timesheet Calendar (`<TimesheetCalendar />`):** Interactive month filtering, total hours logged, days present, and absence metrics.
* **Executive Daily Roster (`<AdminDailyAttendanceReport />`):** Real-time organization-wide daily shift roster with live headcount KPIs.

---

## 🗄️ Database Schema Specification

The SQLite database (`staffsync.db`) maintains strict foreign key constraints and transactional integrity:

```sql
-- 1. Identity & RBAC
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK(role IN ('ADMIN', 'HR', 'EMPLOYEE')),
  is_active BOOLEAN NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Employee Directory
CREATE TABLE employees (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NULL REFERENCES users(id) ON DELETE SET NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  department VARCHAR(50) NOT NULL,
  designation VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  date_of_joining DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Statutory Leave Quotas
CREATE TABLE leave_balances (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  employee_id VARCHAR(36) NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leave_type VARCHAR(20) NOT NULL CHECK (leave_type IN ('SICK', 'CASUAL', 'PRIVILEGE')),
  allocated_days INT NOT NULL,
  consumed_days INT NOT NULL DEFAULT 0,
  locked_days INT NOT NULL DEFAULT 0,
  CONSTRAINT uq_user_leave UNIQUE (user_id, leave_type)
);

-- 4. Leave Applications
CREATE TABLE leave_requests (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  employee_id VARCHAR(36) NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leave_type VARCHAR(20) NOT NULL CHECK (leave_type IN ('SICK', 'CASUAL', 'PRIVILEGE')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days_count INT NOT NULL,
  reason TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')),
  reviewed_by VARCHAR(36) NULL REFERENCES users(id),
  review_comment TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Attendance & Timesheets
CREATE TABLE attendance_records (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  employee_id VARCHAR(36) NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  clock_in_time TIMESTAMP NOT NULL,
  clock_out_time TIMESTAMP NULL,
  duration_minutes INT NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS' CHECK (status IN ('PRESENT', 'HALF_DAY', 'ABSENT', 'IN_PROGRESS')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔑 Seeded Test Accounts Reference

| Role | Corporate Email | Password | Personnel Name | Employee ID | Status |
|---|---|---|---|---|---|
| **ADMIN** | `admin@staffsync.com` | `Admin@123` | Sarah Jenkins | `EMP-001` | Active |
| **HR** | `hr@staffsync.com` | `Hr@123` | David Vance | `EMP-002` | Active |
| **EMPLOYEE** | `employee@staffsync.com` | `Emp@123` | Elena Rostova | `EMP-003` | Active |
| **EMPLOYEE** | `deactivated@staffsync.com` | `Deact@123` | Marcus Thorne | `EMP-004` | Deactivated (`is_active = 0`) |

---

## 🎯 Test Automation Locators Matrix (`data-testid`)

All interactive elements carry deterministic `data-testid` attributes matching PRD and HLD specifications:

| Area / Control | `data-testid` Attribute | Description |
|---|---|---|
| **Login Email** | `input-email` | Authentication email text input |
| **Login Password** | `input-password` | Authentication password input |
| **Login Submit** | `btn-login` | Dispatches auth request |
| **Logout CTA** | `btn-logout` | Navbar session sign-out |
| **Dashboard Heading** | `dashboard-title` | Dynamic H1 verifying authorized landing |
| **Employee Directory** | `container-employee-directory` | Personnel directory parent card |
| **Search Employees** | `input-search-employee` | Directory search input |
| **Department Filter** | `select-department-filter` | Department filtration dropdown |
| **Employee Table** | `table-employees` | Directory table container |
| **Employee Row** | `row-employee-<id>` | Specific employee row (`<id>` e.g. `EMP-001`) |
| **Add Employee Button** | `btn-add-employee` | Opens onboarding modal |
| **Save Employee Button** | `btn-save-employee` | Submits new employee modal form |
| **Edit Employee Button** | `btn-edit-<id>` | Opens profile edit modal |
| **Deactivate Button** | `btn-deactivate-<id>` | Soft-deactivates employee |
| **Pagination Next** | `btn-pagination-next` | Advance page button |
| **Pagination Prev** | `btn-pagination-prev` | Previous page button |
| **Sick Balance Card** | `card-balance-sick` | Displays Sick leave quota |
| **Casual Balance Card** | `card-balance-casual` | Displays Casual leave quota |
| **Privilege Balance Card** | `card-balance-privilege` | Displays Privilege leave quota |
| **Apply Leave Button** | `btn-apply-leave` | Opens leave application dialog |
| **Apply Leave Modal** | `modal-apply-leave` | Leave application form container |
| **Leave Type Dropdown** | `select-leave-type` | Selection for SICK, CASUAL, PRIVILEGE |
| **Leave Start Date** | `input-leave-start` | Calendar start picker |
| **Leave End Date** | `input-leave-end` | Calendar conclusion picker |
| **Submit Leave Request** | `btn-submit-leave` | Dispatches leave creation |
| **Leave Queue Table** | `table-leave-queue` | Admin/HR authorization table |
| **Approve Leave Action** | `btn-approve-leave-<id>` | Approves specific leave request |
| **Reject Leave Action** | `btn-reject-leave-<id>` | Rejects specific leave request |
| **Clock-In Button** | `btn-clock-in` | Initiates work session |
| **Clock-Out Button** | `btn-clock-out` | Ends shift and evaluates duration |
| **Active Session Timer** | `timer-active-session` | Real-time `HH:mm:ss` counter |
| **Timesheet History** | `table-timesheet-history` | Monthly shift log table |
| **Month Filter Dropdown** | `select-month-filter` | Month selector for timesheet |
| **Monthly Present Card** | `card-monthly-present` | Metric card for present days |
| **Monthly Absent Card** | `card-monthly-absent` | Metric card for absent days |
| **Total Hours Card** | `card-total-hours` | Metric card for accumulated hours |
| **Admin Attendance Table** | `table-admin-attendance-roster` | Org-wide daily attendance roster |

---

## 🧪 Intentional QA Seeded Bugs Reference

A total of 12 intentional defects spanning security, business logic, boundary conditions, and concurrency have been architected into the codebase. For full reproduction steps, expected vs. actual behaviors, and root-cause files, refer to:
👉 [`docs/testing/seeded-bugs-answer-key.md`](docs/testing/seeded-bugs-answer-key.md)

| Defect ID | Severity | Category | Description Summary |
|---|---|---|---|
| `DEFECT-001` | Medium | Authentication | Email trimming/lowercasing omission in `POST /api/v1/auth/login` |
| `DEFECT-002` | High | Exception Handling | Deactivated user login unhandled crash (HTTP 500 instead of 403) |
| `DEFECT-003` | Critical | RBAC / Authorization | `GET /api/v1/admin/stats` omits role check; Employee token retrieves admin metrics |
| `DEFECT-004` | High | Security (IDOR) | `PUT /api/v1/employees/:id` omits roleGuard; Employee role can modify arbitrary profiles |
| `DEFECT-005` | Medium | Data Leakage | Department filter queries leak deactivated staff records by omitting `is_active = 1` |
| `DEFECT-006` | Medium | Pagination Math | Pagination calculation uses `offset = page * limit`, skipping Page 1 records |
| `DEFECT-007` | Critical | Business Rule Invariant | Balance check checks `(allocated - consumed) > 0`, allowing negative leave quotas |
| `DEFECT-008` | High | Temporal Logic | Naive point-in-time check (`start_date === existing.start_date`) allows overlapping leaves |
| `DEFECT-009` | High | State Reconciliation | Rejecting leave forgets to decrement `locked_days`, permanently locking employee quotas |
| `DEFECT-010` | Medium | Timezone Boundary | Date serialized via UTC `.toISOString().split('T')[0]`, shifting evening shifts to wrong days |
| `DEFECT-011` | High | Concurrency | Missing mutex/lock in `POST /clock-in`; rapid concurrent clicks create duplicate open shifts |
| `DEFECT-012` | High | Boundary Invariant | Strict inequality `> 240` classifies exactly 240.0 minutes of work as ABSENT instead of HALF_DAY |

---

## 🚀 How to Run Locally

### Prerequisites
* Node.js v18+ (tested on Node.js v22 on Windows / Linux / macOS)
* npm v9+

### 1. Start the Backend API Server
```bash
cd backend
npm install
npm run dev
```
* Backend runs at: **`http://localhost:5000`**
* Health check: **`http://localhost:5000/api/health`**
* SQLite database file will automatically initialize and seed at `backend/src/database/staffsync.db`.

### 2. Start the Frontend React Application
In a separate terminal window:
```bash
cd frontend
npm install
npm run dev
```
* Frontend runs at: **`http://localhost:3000`**
* Vite automatically proxies `/api` calls to the backend on port 5000.

### 3. Build Frontend for Production (Optional)
```bash
cd frontend
npm run build
```
Build bundle will be generated into `frontend/dist/`.
