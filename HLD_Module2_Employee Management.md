High-Level Design (HLD) Document
System Name: StaffSync HRM - Enterprise Workforce Management Portal
Module Name: MOD-02: Employee Lifecycle & Directory Management
Document Version: 1.0
Author / SDET Lead: Varun Kulshrestha
Status: Approved for Development & Antigravity Automation
1. System Architecture & Layer Breakdown
The Employee Lifecycle & Directory Management module orchestrates directory searching, role-based workforce profiling, lifecycle mutations (onboarding/offboarding), and employee record governance across the platform.
Architectural Tiers
Presentation Layer (Frontend): React 18 SPA bootstrapped via Vite. Utilizes Lucide Icons for consistent visual affordances, a custom debounced search and multi-criteria department filter hook, interactive modal dialogs for employee provisioning and profile adjustments, and a zero-indexed client pagination controller.
Application Layer (Express.js REST API):
Security Middlewares: authMiddleware validates incoming bearer tokens (decodes JWT payload, attaches identity to request context); roleGuard(['ADMIN', 'HR', 'EMPLOYEE']) evaluates role claims against endpoint access control lists.
Controllers: EmployeeController exposes handlers: listEmployees, createEmployee, getEmployeeById, updateEmployee, and deactivateEmployee.
Data Access Layer: Abstraction interfacing with an in-memory JSON data store (backend/src/data/employees.json) with an active query interface mirrorable to relational SQL storage engines.
System Architecture Flow
+-------------------------------------------------------------------------+

|                    Client Tier: React 18 (Vite SPA)                     |
|---|
+-------------------------------------------------------------------------+
                                    |
                         HTTPS Bearer JWT Token
                                    v
+-------------------------------------------------------------------------+
|                 Application Tier: Express.js REST API                   |
|                                                                         |
|  [Router: /api/v1/employees]                                            |
|       |                                                                 |
|       v                                                                 |
|  [Middlewares]                                                          |
|       |--> authMiddleware (Verify signature & decode payload)          |
|       `--> roleGuard (Enforce RBAC: ADMIN, HR, EMPLOYEE)                |
|       |                                                                 |
|       v                                                                 |
|  [EmployeeController]                                                   |
|       |--> listEmployees()        --> getEmployeeById()                 |
|       |--> createEmployee()       --> updateEmployee()                  |
|       `--> deactivateEmployee()                                         |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
|                  Data Tier: Abstraction & Repository                    |
|       |                                                                 |
|       v                                                                 |
|  [EmployeeRepository / Data Access Engine]                              |
|       |                                                                 |
|       v                                                                 |
|  [Store: backend/src/data/employees.json OR Relational Database]       |
+-------------------------------------------------------------------------+
2. Database Schema & Data Models
SQL DDL Specification: employees Table
CREATE TABLE employees (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    department VARCHAR(50) NOT NULL CHECK (department IN ('Engineering', 'HR', 'Sales', 'Finance', 'Operations')),
    designation VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    date_of_joining DATE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_employees_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_employees_dept_active ON employees(department, is_active);
Relational Mapping
Linkage: 1:1 optional linkage between employees.user_id and users.id.
Behavior: Deletion of an authentication identity retains historical HR employee records by nullifying user_id (ON DELETE SET NULL), preserving audit continuity.
Pre-seeded Test Dataset
ID
User ID Reference
Full Name
Email Address
Department
Designation
Active
EMP-001
usr_99812
Sarah Jenkins
admin@staffsync.com
 HR
VP of People Ops
 true
EMP-002
usr_99813
David Vance
hr@staffsync.com
 HR
Senior HR Generalist
 true
EMP-003
usr_99814
Elena Rostova
employee@staffsync.com
 Engineering
Staff Platform Engineer
 true
EMP-004
usr_99815
Marcus Thorne
deactivated@staffsync.com
 Sales
Account Executive
 false
EMP-005
USR-EMP-005
Aisha Patel
aisha.p@staffsync.com
 Engineering
Senior Frontend Architect
 true
EMP-006
USR-EMP-006
Liam O'Connor
liam.o@staffsync.com
 Finance
Financial Controller
 true
EMP-007
USR-EMP-007
Chloe Chen
chloe.c@staffsync.com
 Operations
Operations Lead
 true
EMP-008
USR-EMP-008
Tariq Al-Mansoor
tariq.m@staffsync.com
 Engineering
Backend Engineer
 true
EMP-009
USR-EMP-009
Jessica Miller
jessica.m@staffsync.com
 Sales
Solutions Specialist
 true
EMP-010
USR-EMP-010
Ronald Davies
ronald.d@staffsync.com
 Operations
Logistics Coordinator
 false

3. REST API Interface Contracts
1. GET /api/v1/employees
Description: Retrieves paginated employee records supporting query-driven filtering.
Authentication: Valid JWT (ADMIN, HR, or EMPLOYEE).
Query Parameters:
search (string, optional): Substring match against first_name, last_name, or email.
department (string, optional): Direct match against department enum.
page (integer, optional, default: 1): Page index.
limit (integer, optional, default: 5): Records per request.
include_inactive (boolean, optional, default: false): Include deactivated records.
Response (200 OK):

{
  "status": "success",
  "data": [
    {
      "id": "EMP-001",

      "user_id": "usr_99812",
      "first_name": "Sarah",
      "last_name": "Jenkins",
      "email": "admin@staffsync.com",
      "department": "HR",
      "designation": "VP of People Ops",
      "phone": "+1-555-0199",
      "date_of_joining": "2021-03-15",
      "is_active": true,
      "created_at": "2021-03-15T08:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 5,
    "total": 8,
    "totalPages": 2
  }
}
2. POST /api/v1/employees
Description: Creates and onboards a new employee profile. Automatically provisions an authenticated user account in the `users` table linked via `user_id` and seeds default statutory leave balances.
Authentication: Required (ADMIN or HR role enforced).
Request Payload:

{
  "first_name": "Alexander",
  "last_name": "Wright",
  "email": "alex.wright@staffsync.com",
  "department": "Engineering",
  "designation": "Cloud Security Architect",
  "phone": "+1-555-0144",
  "date_of_joining": "2024-02-01",
  "password": "Emp@123"
}

Behavior & Side Effects:
- Inserts employee into `employees` table.
- Generates or links user login account in `users` (hashes password using Bcrypt 10 rounds; defaults to 'Emp@123' if omitted).
- Provisions initial statutory leave allocations (12d Sick, 12d Casual, 15d Privilege) in `leave_balances`.

Status Codes:
201 Created: Employee and login account persisted successfully.
400 Bad Request: Field validation error or invalid department.
403 Forbidden: Authenticated user lacks ADMIN or HR role claims.
409 Conflict: Unique constraint violation (email exists).
3. GET /api/v1/employees/:id
Description: Retrieves singular employee detail.
Authentication: Required (ADMIN, HR, or EMPLOYEE).
Path Parameters: id (e.g., EMP-001).
Status Codes:
200 OK: Returns matching employee object payload.
404 Not Found: No entity with specified ID found.
4. PUT /api/v1/employees/:id
Description: Updates non-identity properties of an employee profile.
Authentication: Required (ADMIN or HR role enforcement required).
Path Parameters: id (e.g., EMP-003).
Request Payload:

{
  "department": "Engineering",
  "designation": "Lead Platform Engineer",
  "phone": "+1-555-0188"
}

Status Codes:
200 OK: Record updated successfully.
403 Forbidden: User lacks write privileges.
404 Not Found: Target entity not found.
5. DELETE /api/v1/employees/:id
Description: Executes soft-deletion lifecycle termination.
Authentication: Required (ADMIN or HR role enforced).
Path Parameters: id (e.g., EMP-004).
Response (200 OK):

{
  "status": "success",
  "message": "Employee deactivated successfully",
  "data": {
    "id": "EMP-004",
    "is_active": false
  }
}
4. UI Component Architecture & State Management
Route Tree & Component Hierarchy
[App Router]
  |
  +-- /login (Public)
  |
  +-- /dashboard (Protected via <ProtectedRoute />)
        |
        +-- <AdminDashboard /> | <HRDashboard />
        |     |
        |     `-- <EmployeeDirectory />
        |           |
        |           +-- <DirectoryHeader />
        |           |     |
        |           |     +-- <DirectorySearchBar />
        |           |     +-- <DepartmentFilter />
        |           |     `-- <AddEmployeeButton />
        |           |
        |           +-- <EmployeeTable />
        |           |     +-- <EmployeeTableRow />
        |           |     `-- <ActionMenu />
        |           |
        |           +-- <Pagination />
        |           |
        |           +-- <AddEmployeeModal />
        |           `-- <EditEmployeeModal />
        |
        `-- /employee/profile (Employee Role Default)
              `-- <ReadOnlyProfileCard />
Component State & Route Guards
<ProtectedRoute allowedRoles={['ADMIN', 'HR']} />: Validates session context. If authenticated subject possesses role EMPLOYEE, redirection directs to /employee/profile, showing the read-only view (<ReadOnlyProfileCard />).
<EmployeeDirectory /> State Engine:
searchQuery: Debounced by 300ms before dispatching API calls.
selectedDepartment: Tracks active dropdown selection or ALL.
currentPage: Zero-indexed integer handling paginated chunks.
modals: Manages open/close states and target entity IDs for create and edit modals.
Automated Test Locator Registry (Antigravity Automation Standard)
Target UI Element
Component
data-testid Locator String
Global Directory Container
 <EmployeeDirectory />
container-employee-directory
Search Input Field
 <DirectorySearchBar />
input-search-employee
Department Filter Dropdown
 <DepartmentFilter />
select-department-filter
Add Employee Primary Button
 <DirectoryHeader />
btn-add-employee
Employee Table Container
 <EmployeeTable />
table-employees
Table Row Record
 <EmployeeTableRow />
row-employee-<id>
Action Button: Edit Record
 <ActionMenu />
btn-edit-<id>
Action Button: Deactivate
 <ActionMenu />
btn-deactivate-<id>
Save Button (Create Modal)
 <AddEmployeeModal />
btn-save-employee
Update Button (Edit Modal)
 <EditEmployeeModal />
btn-update-employee
Next Page Button
 <Pagination />
btn-pagination-next
Previous Page Button
 <Pagination />
btn-pagination-prev
Page Number Label
 <Pagination />
label-pagination-page

5. Intentional Seeded Bugs Specifications (For Antigravity Implementation)
The following defect injection specifications are integrated into this release for automated testing verification:
DEFECT-004: Insecure Direct Object Reference / Broken Function Level Authorization
Target: PUT /api/v1/employees/:id
File Under Test: backend/src/routes/employeeRoutes.js
Intended Implementation:

// DEFECT-004 INJECTION: roleGuard is omitted from the PUT route chain
router.put('/:id', authMiddleware, employeeController.updateEmployee);
// EXPECTED BEHAVIOR: router.put('/:id', authMiddleware, roleGuard(['ADMIN', 'HR']), ...);

Failure Mode & Verification: An identity authenticated with the EMPLOYEE role can submit modification requests against arbitrary IDs (e.g., updating designation or department for EMP-001) and receive 200 OK instead of being rejected with 403 Forbidden.
DEFECT-005: Query Leakage of Soft-Deleted Records Under Department Filter
Target: GET /api/v1/employees
File Under Test: backend/src/controllers/employeeController.js
Intended Implementation:

// DEFECT-005 INJECTION: department branch omits is_active enforcement
if (department) {
  filtered = employees.filter(emp => emp.department === department);
  // EXPECTED BEHAVIOR:
  // filtered = employees.filter(emp => emp.department === department && (include_inactive ? true : emp.is_active === true));
}

Failure Mode & Verification: When fetching the full directory without query parameters, inactive records (e.g., EMP-004) remain hidden. When applying ?department=Sales, deactivated employee records matching that department are returned in the payload despite include_inactive=false.
DEFECT-006: Zero-Base Off-By-One Skip in Pagination Offset Calculation
Target: Core pagination utility logic
File Under Test: backend/src/utils/pagination.js
Intended Implementation:

// DEFECT-006 INJECTION: Calculation treats page index as 1-offset multiplier directly
const offset = page * limit;
// EXPECTED BEHAVIOR:
// const offset = (page - 1) * limit;

Failure Mode & Verification: Assuming a page limit of 5:
Page 1 computes offset = 1 * 5 = 5, returning records 5 to 9 instead of 0 to 4.
Page 2 computes offset = 2 * 5 = 10, skipping record index 5 entirely.
Navigating across page boundaries causes lost items and irregular slice boundaries.

