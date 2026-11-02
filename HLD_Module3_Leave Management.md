High-Level Design (HLD) Document
System Name: StaffSync HRM - Enterprise Workforce Management Portal
Module Name: MOD-03: Leave Management & Approval Workflow
Document Version: 1.0
Author / SDET Lead: Varun Kulshrestha
Status: Approved for Development & Antigravity Automation
1. System Architecture & Layer Breakdown
The Leave Management & Approval Workflow module provides end-to-end self-service request mechanisms for employees alongside multi-tenant approval engines for administrators and HR business partners. The architecture enforces strict separation of concerns across presentation, routing, core domain logic, and data abstraction layers.

Presentation Layer (React 18 / Vite): Responsive UI composed of single-responsibility components. Employs balance insight widgets (<LeaveBalanceCards />), validation-enforced request dialogs (<ApplyLeaveModal />), and a streamlined operations dashboard (<PendingApprovalsQueue />) equipped with one-click approval/rejection triggers.
Application & Routing Layer (Node.js / Express):
authMiddleware: Enforces JSON Web Token (JWT) integrity and populates the contextual identity (req.user).
roleGuard: Enforces role-based access control (RBAC) across ADMIN, HR, and EMPLOYEE permissions.
LeaveController: Orchestrates transport boundaries, validating payload schemas and delegating commands to downstream services (getBalances, applyLeave, getMyLeaves, getPendingApprovals, updateLeaveStatus).
Domain Service Layer (LeaveService): Implements business validation invariants, balance verification, date collision detection, and dual-phase status commitment (allocation deduction vs. locked holding rollbacks).
Data Persistence Layer: Abstracted repository interfacing with JSON-backed persistence stores (backend/src/data/leave_balances.json & leave_requests.json) or relational SQL storage targets.

+---------------------------------------------------------------------------------------+

|                                  PRESENTATION LAYER                                   |
|---|
|                                                                                       |
|   [LeaveBalanceCards]   [ApplyLeaveModal]   [LeaveHistoryTable]   [PendingQueue]      |
+-------------------------------------------+-------------------------------------------+
                                            |
                                 HTTPS REST (JSON / JWT)
                                            v
+---------------------------------------------------------------------------------------+
|                                   APPLICATION LAYER                                   |
|                                                                                       |
|  [Middleware Pipeline]                                                                |
|   +---------------------+    +----------------------------------------------------+   |
|   |   authMiddleware    |--->| roleGuard ('ADMIN' | 'HR' | 'EMPLOYEE')            |   |
|   +---------------------+    +----------------------------------------------------+   |
|                                            |                                          |
|  [LeaveController]                         v                                          |
|   * getBalances()        * applyLeave()          * getMyLeaves()                      |
|   * getPendingApprovals()* updateLeaveStatus()                                        |
+-------------------------------------------+-------------------------------------------+
                                            |
                                            v
+---------------------------------------------------------------------------------------+
|                                     SERVICE LAYER                                     |
|  [LeaveService]                                                                       |
|   +-------------------------------------------------------------------------------+   |
|   | - Balance Availability Check: (allocated - consumed - locked) >= requested   |   |
|   | - Date Collision Engine: Overlap verification via interval intersection       |   |
|   | - Commit Transitions: LOCKED -> CONSUMED (Approved) or AVAILABLE (Rejected)   |   |
|   +-------------------------------------------------------------------------------+   |
+-------------------------------------------+-------------------------------------------+
                                            |
                                            v
+---------------------------------------------------------------------------------------+
|                               DATA PERSISTENCE LAYER                                  |
|  SQL DB Abstraction / Local JSON Store                                                |
|   * backend/src/data/leave_balances.json                                              |
|   * backend/src/data/leave_requests.json                                              |
+---------------------------------------------------------------------------------------+
2. Database Schema & Data Models
The data model maintains transactional consistency across leave entitlements and immutable submission records.
SQL DDL Table Definitions

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


CREATE TABLE leave_requests (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  employee_id VARCHAR(36) NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leave_type VARCHAR(20) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days_count INT NOT NULL,
  reason TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')),
  reviewed_by VARCHAR(36) NULL REFERENCES users(id),
  review_comment TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

Pre-seeded Test Dataset
The system is pre-seeded with baseline leave ledger entries for automated integration verification across multiple personas:

Balance ID
User ID
Employee ID
Leave Type
Allocated Days
Consumed Days
Locked Days
Net Available
bal-001-s
usr_99814
EMP-001
SICK
12
0
0
12
bal-001-c
usr_99814
EMP-001
CASUAL
12
0
0
12
bal-001-p
usr_99814
EMP-001
PRIVILEGE
15
0
0
15
bal-002-s
usr_99813
EMP-002
SICK
12
0
0
12
bal-002-c
usr_99813
EMP-002
CASUAL
12
0
0
12
bal-002-p
usr_99813
EMP-002
PRIVILEGE
15
0
0
15
bal-003-s
usr_99812
EMP-003
SICK
12
0
0
12
bal-003-c
usr_99812
EMP-003
CASUAL
12
0
0
12
bal-003-p
usr_99812
EMP-003
PRIVILEGE
15
0
0
15


3. REST API Interface Contracts
3.1 Fetch Personal Balances
Endpoint: GET /api/v1/leaves/balances
Access Control: Authenticated Session (EMPLOYEE [usr_99814], HR [usr_99813], ADMIN [usr_99812])
Success Payload (200 OK):

{
  "success": true,
  "data": [
    {
      "leave_type": "SICK",
      "allocated_days": 12,
      "consumed_days": 2,
      "locked_days": 1,
      "available_days": 9
    }
  ]
}

3.2 Submit Leave Request
Endpoint: POST /api/v1/leaves/apply
Access Control: Active Employee (req.user.id = 'usr_99814')
Request Payload:

{
  "leave_type": "CASUAL",
  "start_date": "2025-06-10",
  "end_date": "2025-06-12",
  "reason": "Attending family event"
}

Validation Rules:
Chronology check: start_date <= end_date.
Capacity check: Available pool (allocated - consumed - locked) >= calculated_days.
Collision check: No intersecting dates in active applications (PENDING or APPROVED).
Error States: 400 Bad Request (Invalid ranges or insufficient balances), 409 Conflict (Date interval collision).
Success Payload (201 Created): Returns generated leave request object with status PENDING. Increments corresponding locked_days.
3.3 Retrieve Personal History
Endpoint: GET /api/v1/leaves/my-history
Access Control: Authenticated Employee (req.user.id = 'usr_99814')
Success Payload (200 OK): Returns chronological array of all requests initiated by req.user.id (e.g., usr_99814).
3.4 Retrieve Pending Review Queue
Endpoint: GET /api/v1/leaves/pending
Access Control: Restricted to ADMIN (usr_99812) and HR (usr_99813)
Success Payload (200 OK): Organization-wide collection of unresolved leave submissions joined with basic employee directory profiles.
3.5 Process Leave Decision
Endpoint: PATCH /api/v1/leaves/:id/status
Access Control: Restricted to ADMIN (usr_99812) and HR (usr_99813)
Request Payload:


{
  "status": "APPROVED",
  "comment": "Approved per team calendar coverage.",
  "reviewed_by": "usr_99813"
}

State Transition Logic:
If APPROVED: consumed_days += days_count, locked_days -= days_count.
If REJECTED: locked_days -= days_count (reinstating the days to available balance).
4. UI Component Architecture & State Management
The frontend presentation structure pairs isolated state views with globally deterministic automation hooks:

[Dashboard Layout]
  |-- <LeaveBalanceCards />
  |     |-- Card: Sick
  |     |-- Card: Casual
  |     |-- Card: Privilege
  |-- <ApplyLeaveModal />
  |     |-- Type Selector Dropdown
  |     |-- Start & End Date Pickers
  |     |-- Narrative Input Area
  |-- <LeaveHistoryTable />
  |-- <PendingApprovalsQueue /> (Protected: HR/Admin View)
        |-- Inline Action Triggers (Approve / Reject)
Standard Test Locators Mapping
UI Element / Component
Test Automation Locator (data-testid)
Expected Behavior / Interaction
Sick Leave Metric Card
card-balance-sick
Displays numerical available/allocated metric for Sick leave
Casual Leave Metric Card
card-balance-casual
Displays numerical available/allocated metric for Casual leave
Privilege Leave Metric Card
card-balance-privilege
Displays numerical available/allocated metric for Privilege leave
Apply Leave Open Button
btn-apply-leave
Opens modal dialog overlay <ApplyLeaveModal />
Apply Leave Dialog Frame
modal-apply-leave
Modal container containing the form inputs
Leave Type Selector
select-leave-type
Selection input for SICK, CASUAL, or PRIVILEGE
Start Date Picker
input-leave-start
HTML5 Date element selecting commencement date
End Date Picker
input-leave-end
HTML5 Date element selecting conclusion date
Request Submit Button
btn-submit-leave
Dispatches POST payload to /api/v1/leaves/apply
Review Queue Table
table-leave-queue
Grid container displaying all pending authorizations
Row Approve Action
btn-approve-leave-<id>
Sends PATCH request marking approval for target record
Row Reject Action
btn-reject-leave-<id>
Sends PATCH request marking rejection for target record

5. Intentional Seeded Bugs Specifications
(Architected for Antigravity Automated Quality Assurance and Fault Detection Frameworks)
DEFECT-007: Balance Invariant Underflow Bypass
Target Subsystem: LeaveService.applyLeave
Severity: Critical
Fault Logic Description: The backend balance validation check evaluates whether unreserved balance exists rather than validating sufficient coverage for the requested span:

// DEFECT-007: Defective logic
if ((balance.allocated_days - balance.consumed_days) > 0) {
  // Permits submission even if requested_days exceeds available balance
}

// Expected Correct Implementation
const availableDays = balance.allocated_days - balance.consumed_days - balance.locked_days;
if (availableDays < requestedDays) {
  throw new BadRequestException("Insufficient leave balance");
}

Failure Consequence: An employee with 1 remaining available day can successfully submit a request for a 10-day leave block, driving total committed days into negative integers.
DEFECT-008: Naive Date Collision Check
Target Subsystem: LeaveService.checkCollision
Severity: High
Fault Logic Description: The temporal overlap engine implements exact point-in-time matching rather than interval intersection:

// DEFECT-008: Defective check
const hasCollision = existingLeaves.some(leave => 
  leave.start_date === newRequest.start_date
);

// Expected Correct Implementation
const hasCollision = existingLeaves.some(leave => 
  (newRequest.start_date <= leave.end_date && newRequest.end_date >= leave.start_date)
);

Failure Consequence: Overlapping date reservations are permitted without restriction as long as the incoming request start date differs by at least +1 or -1 day from existing leaves.
DEFECT-009: Abandoned Locked Days on Request Rejection
Target Subsystem: LeaveService.updateLeaveStatus
Severity: High
Fault Logic Description: When handling a REJECTED status transition, the persistence update sets the request record status to REJECTED but omits decrementing the locked_days counter in leave_balances:

// DEFECT-009: Defective update
if (status === 'APPROVED') {
  balance.consumed_days += request.days_count;
  balance.locked_days -= request.days_count;
} else if (status === 'REJECTED') {
  // DEFECT: locked_days is never decremented
  request.status = 'REJECTED';
}

// Expected Correct Implementation
else if (status === 'REJECTED') {
  balance.locked_days -= request.days_count;
  request.status = 'REJECTED';
}

Failure Consequence: Days reserved during application remain locked indefinitely after rejection, permanently reducing the employee's available balance pool.

