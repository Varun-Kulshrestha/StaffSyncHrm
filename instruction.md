You are acting as the Principal Full-Stack Software Engineer for "StaffSync HRM".
Your objective is to read the existing specifications in the workspace root and build the entire production-grade web application incrementally (Module by Module).

Workspace Reference Documents (DO NOT OVERWRITE THEM):
- `instruction.md`
- `PRD_Module1_Authentication & Role-Ba...md` & `HLD_Module1_Authentication & RBAC.md`
- `PRD_Module2_Employee Lifecycle & Dire...md` & `HLD_Module2_Employee Management.md`
- `PRD_Module3_Leave Management.md` & `HLD_Module3_Leave Management.md`
- `PRD_Module4_Attendance and Timeshee...md` & `HLD_Module4_Attendance and Timesheets.md`

CRITICAL INSTRUCTIONS:
1. NO AUTOMATION TESTS: Do NOT create any Playwright, Cypress, Selenium, or automated test runner scripts. Testing will be conducted in a completely separate project. Focus 100% on the core web application (Backend + SQLite + React Frontend).
2. INCREMENTAL EXECUTION: Execute the 4 sprints sequentially. Complete and verify each sprint fully before writing code for the next sprint.
3. PRESERVE CONTRACTS: Never break or overwrite previously built modules, seed accounts, or JWT authentication mechanics.
4. ATTACH TEST LOCATORS: Ensure all interactive frontend elements carry the standard `data-testid` attributes specified in the HLD documents.

================================================================================
SPRINT 1: MODULE 01 - FOUNDATION, SQLITE DATABASE & AUTHENTICATION (RBAC)
================================================================================
1. Architecture Scaffolding:
   staffsync-hrm/
   ├── backend/
   │   ├── src/
   │   │   ├── config/ (db.js, jwt config)
   │   │   ├── controllers/ (authController.js)
   │   │   ├── middlewares/ (authMiddleware.js, roleGuard.js, errorHandler.js)
   │   │   ├── routes/ (authRoutes.js)
   │   │   └── database/ (sqlite setup, migrations, seeders)
   │   ├── package.json
   │   └── .env
   ├── frontend/
   │   ├── src/
   │   │   ├── components/ (ProtectedRoute.jsx, Navbar.jsx, ErrorBanner.jsx)
   │   │   ├── context/ (AuthContext.jsx)
   │   │   ├── pages/ (Login.jsx, AdminDashboard.jsx, HRDashboard.jsx, EmployeeDashboard.jsx)
   │   │   ├── services/ (api.js)
   │   │   ├── App.jsx
   │   │   └── main.jsx
   │   ├── package.json
   │   └── vite.config.js
   └── docs/testing/seeded-bugs-answer-key.md

2. Database Setup (`backend/src/database/staffsync.db` via `better-sqlite3` or `sqlite3`):
   Create `users` table:
   - `id VARCHAR(36) PRIMARY KEY`, `email VARCHAR(255) UNIQUE NOT NULL`, `password_hash VARCHAR(255) NOT NULL`, `role VARCHAR(20) NOT NULL CHECK(role IN ('ADMIN', 'HR', 'EMPLOYEE'))`, `is_active BOOLEAN NOT NULL DEFAULT 1`, `created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`.
   Seed the 4 core users (passwords hashed via bcrypt 10 rounds):
   - `usr_99812` | `admin@staffsync.com` | `Admin@123` | `ADMIN` | Active
   - `usr_99813` | `hr@staffsync.com` | `Hr@123` | `HR` | Active
   - `usr_99814` | `employee@staffsync.com` | `Emp@123` | `EMPLOYEE` | Active
   - `usr_99815` | `deactivated@staffsync.com` | `Deact@123` | `EMPLOYEE` | Inactive (`is_active = 0`)

3. Backend APIs (Express.js on Port 5000):
   - `POST /api/v1/auth/login`: Issue JWT token (8h expiry) and user payload.
   - `GET /api/v1/auth/me`: Decodes JWT from `Authorization: Bearer <token>`, returns authenticated user context.
   - `GET /api/v1/admin/stats`: Admin operational metrics.
   - `POST /api/v1/auth/logout`: Acknowledges session termination.
   - Setup CORS for `http://localhost:3000`.

4. Frontend Application (React 18 + Vite on Port 3000):
   - `/login`: Form with `data-testid="input-email"`, `data-testid="input-password"`, `data-testid="btn-login"`, `data-testid="error-banner"`. Add 1-click test buttons to autofill test credentials.
   - Landing Dashboards (Role-based):
     * `/admin/dashboard` ➔ H1 (`data-testid="dashboard-title"`): "Admin Logged In Successfully"
     * `/hr/dashboard` ➔ H1 (`data-testid="dashboard-title"`): "HR Logged In Successfully"
     * `/employee/dashboard` ➔ H1 (`data-testid="dashboard-title"`): "Employee Logged In Successfully"
   - Global Logout CTA (`data-testid="btn-logout"`) clearing session and redirecting to `/login`.
   - Route Guard blocking unauthorized cross-role traversal with "403 Forbidden - Access Denied".
   - Setup Vite proxy forwarding `/api` to `http://localhost:5000`.

5. Seed Module 1 Defects:
   - DEFECT-001: In `POST /api/v1/auth/login`, omit trimming/lowercase on email; untrimmed email yields 401.
   - DEFECT-002: Inactive user login throws unhandled exception returning 500 instead of 403.
   - DEFECT-003: `/api/v1/admin/stats` omits admin role check; employee token can read stats.
   Record them in `docs/testing/seeded-bugs-answer-key.md`.

6. Sprint 1 Verification & Git Commit:
   - Verify DB creation, backend boot on :5000, and frontend clean build.
   - Git commit: "feat(module-01): scaffold full-stack architecture, sqlite database, and auth rbac"
   - Git push to remote.

================================================================================
SPRINT 2: MODULE 02 - EMPLOYEE LIFECYCLE & DIRECTORY MANAGEMENT
================================================================================
1. Database Layer Expansion:
   Create `employees` table in `staffsync.db`:
   - `id VARCHAR(36) PRIMARY KEY`, `user_id VARCHAR(36) NULL REFERENCES users(id)`, `first_name VARCHAR(100)`, `last_name VARCHAR(100)`, `email VARCHAR(255) UNIQUE`, `department VARCHAR(50)`, `designation VARCHAR(100)`, `phone VARCHAR(20)`, `date_of_joining DATE`, `is_active BOOLEAN DEFAULT 1`, `created_at TIMESTAMP`.
   Seed 10 employee fixtures:
   - `EMP-001` -> Sarah Jenkins (`usr_99812`, HR, VP People Ops, Active)
   - `EMP-002` -> David Vance (`usr_99813`, HR, Senior HR Generalist, Active)
   - `EMP-003` -> Elena Rostova (`usr_99814`, Engineering, Staff Platform Engineer, Active)
   - `EMP-004` -> Marcus Thorne (`usr_99815`, Sales, Account Executive, Inactive)
   - `EMP-005` to `EMP-010` spanning Engineering, Finance, Operations, Sales.

2. Backend APIs (`/api/v1/employees`):
   - `GET /api/v1/employees` (Supports `?search=`, `?department=`, `?page=`, `?limit=`, `?include_inactive=`).
   - `POST /api/v1/employees` (Restricted to ADMIN and HR).
   - `GET /api/v1/employees/:id`.
   - `PUT /api/v1/employees/:id` (Updates department, designation, phone).
   - `DELETE /api/v1/employees/:id` (Soft delete: `is_active = 0`).

3. Frontend Components (`frontend/src/components/employees/`):
   - In `/admin/dashboard` & `/hr/dashboard`, render `<EmployeeDirectory />`:
     * Search bar (`data-testid="input-search-employee"`)
     * Department dropdown (`data-testid="select-department-filter"`)
     * Employee table (`data-testid="table-employees"`, rows: `data-testid="row-employee-<id>"`)
     * "Add Employee" button (`data-testid="btn-add-employee"`) + modal with `data-testid="btn-save-employee"`
     * Row actions: Edit (`data-testid="btn-edit-<id>"`) and Deactivate (`data-testid="btn-deactivate-<id>"`)
     * Pagination (`data-testid="btn-pagination-next"`, `data-testid="btn-pagination-prev"`)
   - In `/employee/dashboard`, render `<ReadOnlyProfileCard />` for the logged-in employee.

4. Seed Module 2 Defects:
   - DEFECT-004: In `PUT /api/v1/employees/:id`, omit `roleGuard`, allowing an Employee role to edit profiles (IDOR).
   - DEFECT-005: In `GET /api/v1/employees`, when `?department=` filter is applied, omit `is_active = 1` condition, leaking deactivated staff.
   - DEFECT-006: In pagination offset calculation, write `offset = page * limit` instead of `(page - 1) * limit`.
   Append details to `docs/testing/seeded-bugs-answer-key.md`.

5. Sprint 2 Verification & Git Commit:
   - Verify `employees` table & seed data, verify `/api/v1/employees` returns 200, verify frontend compiles cleanly.
   - Git commit: "feat(module-02): implement employee lifecycle and directory management"
   - Git push to remote.

================================================================================
SPRINT 3: MODULE 03 - LEAVE MANAGEMENT & APPROVAL WORKFLOW
================================================================================
1. Database Layer Expansion:
   Create `leave_balances` table:
   - `id VARCHAR(36) PRIMARY KEY`, `user_id VARCHAR(36) REFERENCES users(id)`, `employee_id VARCHAR(36) REFERENCES employees(id)`, `leave_type VARCHAR(20) CHECK(leave_type IN ('SICK', 'CASUAL', 'PRIVILEGE'))`, `allocated_days INT`, `consumed_days INT DEFAULT 0`, `locked_days INT DEFAULT 0`.
   Create `leave_requests` table:
   - `id VARCHAR(36) PRIMARY KEY`, `user_id VARCHAR(36) REFERENCES users(id)`, `employee_id VARCHAR(36) REFERENCES employees(id)`, `leave_type VARCHAR(20)`, `start_date DATE`, `end_date DATE`, `days_count INT`, `reason TEXT`, `status VARCHAR(20) DEFAULT 'PENDING'`, `reviewed_by VARCHAR(36)`, `review_comment TEXT`, `created_at TIMESTAMP`.
   Seed baseline balances for `usr_99812`, `usr_99813`, and `usr_99814` (Sick: 12, Casual: 12, Privilege: 15).

2. Backend APIs (`/api/v1/leaves`):
   - `GET /api/v1/leaves/balances`: Current user balances.
   - `POST /api/v1/leaves/apply`: Validates start <= end, available balance (`allocated - consumed - locked >= days`), date collision check. Locks requested days upon creation.
   - `GET /api/v1/leaves/my-history`: Current user's leave application logs.
   - `GET /api/v1/leaves/pending`: Organization-wide queue for ADMIN and HR.
   - `PATCH /api/v1/leaves/:id/status`: Updates status to APPROVED (consumed += days, locked -= days) or REJECTED (locked -= days).

3. Frontend Components (`frontend/src/components/leaves/`):
   - In `/employee/dashboard`:
     * Leave balance cards: `data-testid="card-balance-sick"`, `data-testid="card-balance-casual"`, `data-testid="card-balance-privilege"`.
     * "Apply Leave" button (`data-testid="btn-apply-leave"`) + modal (`data-testid="modal-apply-leave"`) with `data-testid="select-leave-type"`, `data-testid="input-leave-start"`, `data-testid="input-leave-end"`, `data-testid="btn-submit-leave"`.
     * Personal history table.
   - In `/admin/dashboard` & `/hr/dashboard`:
     * Review queue table (`data-testid="table-leave-queue"`) with `data-testid="btn-approve-leave-<id>"` and `data-testid="btn-reject-leave-<id>"`.

4. Seed Module 3 Defects:
   - DEFECT-007: In `POST /api/v1/leaves/apply`, check `(allocated - consumed) > 0` instead of available pool `>= requested_days`, allowing negative balances.
   - DEFECT-008: In collision logic, check exact `start_date === existing.start_date` instead of interval intersection, permitting overlapping bookings.
   - DEFECT-009: In `PATCH /api/v1/leaves/:id/status`, when rejecting leave, forget to decrement `locked_days` in `leave_balances`.
   Append details to `docs/testing/seeded-bugs-answer-key.md`.

5. Sprint 3 Verification & Git Commit:
   - Verify balance deduction/rollback logic, verify API endpoints, verify frontend compiles cleanly.
   - Git commit: "feat(module-03): implement leave management and approval workflows"
   - Git push to remote.

================================================================================
SPRINT 4: MODULE 04 - ATTENDANCE & TIMESHEET MANAGEMENT
================================================================================
1. Database Layer Expansion:
   Create `attendance_records` table:
   - `id VARCHAR(36) PRIMARY KEY`, `user_id VARCHAR(36) REFERENCES users(id)`, `employee_id VARCHAR(36) REFERENCES employees(id)`, `date DATE`, `clock_in_time TIMESTAMP`, `clock_out_time TIMESTAMP`, `duration_minutes INT DEFAULT 0`, `status VARCHAR(20) DEFAULT 'IN_PROGRESS' CHECK(status IN ('PRESENT', 'HALF_DAY', 'ABSENT', 'IN_PROGRESS'))`, `created_at TIMESTAMP`.
   Seed historical attendance records for `EMP-001`, `EMP-002`, `EMP-003` for current and previous month.

2. Backend APIs (`/api/v1/attendance`):
   - `POST /api/v1/attendance/clock-in`: Sets open session timestamp.
   - `POST /api/v1/attendance/clock-out`: Closes session, calculates `duration_minutes`, assigns status: PRESENT >= 480m, HALF_DAY >= 240m, ABSENT < 240m.
   - `GET /api/v1/attendance/today`: Active session state and today's accumulated duration.
   - `GET /api/v1/attendance/history`: Monthly timesheet query (`?month=&year=`).
   - `GET /api/v1/attendance/admin/daily-report`: ADMIN & HR org-wide roster and summary counts.

3. Frontend Components (`frontend/src/components/attendance/`):
   - In `/employee/dashboard`:
     * 1-Click Clock In/Out button (`data-testid="btn-clock-in"` / `data-testid="btn-clock-out"`).
     * Live active timer display (`data-testid="timer-active-session"`).
     * Monthly timesheet table (`data-testid="table-timesheet-history"`) with month filter (`data-testid="select-month-filter"`).
     * Summary tiles: `data-testid="card-monthly-present"`, `data-testid="card-monthly-absent"`, `data-testid="card-total-hours"`.
   - In `/admin/dashboard`:
     * Real-time org-wide daily roster table (`data-testid="table-admin-attendance-roster"`) with KPI tiles.

4. Seed Module 4 Defects:
   - DEFECT-010: In `POST /api/v1/attendance/clock-in`, parse date via `.toISOString().split('T')[0]` (UTC) rather than local timezone, shifting evening shifts to wrong dates.
   - DEFECT-011: In `POST /api/v1/attendance/clock-in`, omit concurrency lock, allowing rapid double-clicks to create duplicate open sessions.
   - DEFECT-012: In `POST /api/v1/attendance/clock-out`, evaluate half-day threshold using strict `totalMinutes > 240`. Exactly 240 minutes logs as ABSENT.
   Append details to `docs/testing/seeded-bugs-answer-key.md`.

5. Sprint 4 Verification & Git Commit:
   - Verify attendance calculations, timer persistence, and frontend build.
   - Git commit: "feat(module-04): implement attendance tracking, clock-in timers, and timesheets"
   - Git push to remote.

================================================================================
FINAL WRAP-UP & PROJECT VERIFICATION
================================================================================
1. Verify both servers run cleanly:
   - Backend: `cd backend && npm run dev` (Port 5000)
   - Frontend: `cd frontend && npm run dev` (Port 3000)
2. Update the root `README.md` with:
   - Clear project overview.
   - Full SQLite schema and architecture details.
   - Seeded logins reference.
   - Local running instructions.
3. Final Git commit: "chore: update documentation and finalize full-stack application"
4. Push all branches/commits to GitHub repository.