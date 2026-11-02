High-Level Design (HLD) Document
System Name: StaffSync HRM - Enterprise Workforce Management Portal
Module Name: MOD-04: Attendance & Timesheet Management
Document Version: 1.0
Author / SDET Lead: Varun Kulshrestha
Status: Approved for Development & Antigravity Automation
1. System Architecture & Layer Breakdown
Architectural Overview
The Attendance & Timesheet Management module delivers reliable tracking of daily work sessions, real-time status detection, automated duration calculations, and aggregated timesheet metrics across organizational tiers.

Architectural Tier
Technology Stack / Components
Core Responsibilities
Presentation Layer
React 18, Vite, Tailwind CSS, Lucide Icons
1-Click Clock-In/Clock-Out toggle with real-time active counter (HH:mm:ss), monthly timesheet data grids with dynamic month/year pickers, and admin organization-wide daily roster with live KPI cards.
Security & Routing Middleware
Node.js Express Middleware
Token validation (authMiddleware via JWT verification), security claims extraction, and role enforcement (roleGuard: ['EMPLOYEE', 'HR', 'ADMIN']).
Application Layer
AttendanceController, AttendanceService
Session orchestration, payload validation, hours math, statutory threshold evaluation engine (PRESENT, HALF_DAY, ABSENT), and administrative summary aggregation.
Data Persistence Tier
In-memory/JSON store (attendance.json) / SQL DB
ACID-compliant transaction boundaries, composite uniqueness enforcement on user session timestamps, and optimized indexing for date-range queries.

ASCII Architecture Diagram
+--------------------------------------------------------------------------+
|                       PRESENTATION LAYER (React 18)                      |
|  +--------------------+  +----------------------+  +-------------------+  |
|  |   <ClockWidget />  |  | <TimesheetCalendar/> |  | <AdminRosterGrid> |  |
|  |  (Timer: HH:mm:ss) |  |   (Monthly View)     |  |   (Org-Wide KPI)  |  |
|  +---------+----------+  +----------+-----------+  +---------+---------+  |
+------------|------------------------|------------------------|-----------+
             | REST Payload (JSON)    | GET History            | GET Report
             v                        v                        v
+--------------------------------------------------------------------------+
|                      API GATEWAY / MIDDLEWARE TIER                       |
|   [ authMiddleware (JWT Check) ]  ==>  [ roleGuard (RBAC Authorization) ] |
+-------------------------------------+------------------------------------+
                                      |
                                      v
+--------------------------------------------------------------------------+
|                        APPLICATION CONTROLLER TIER                       |
|                       AttendanceController.ts                            |
|    - clockIn()          - clockOut()        - getTodayStatus()           |
|    - getHistory()       - getAdminDailyReport()                          |
+-------------------------------------+------------------------------------+
                                      |
                                      v
+--------------------------------------------------------------------------+
|                           DOMAIN SERVICE LAYER                           |
|                        AttendanceService.ts                              |
|   * Session Duration Engine (Math.round((out - in) / 60000))             |
|   * Status Classification Rules (>=480m: PRESENT, >=240m: HALF_DAY)      |
|   * Organization Aggregation Engine (Headcount, Present, Absent, KPIs)   |
+-------------------------------------+------------------------------------+
                                      |
                                      v
+--------------------------------------------------------------------------+
|                          PERSISTENCE LAYER                               |
|        attendance_records (SQL Engine / backend/src/data/attendance.json) |
+--------------------------------------------------------------------------+
Clock-In / Clock-Out Sequence Flow
User (Browser)          Controller             Service                Persistence
     |                      |                     |                        |
     |--- POST clock-in --->|                     |                        |
     |                      |--- validateUser --->|                        |
     |                      |--- findActive() --->|--- query open rec ---->|
     |                      |<-- null (none) -----|<-- [] -----------------|
     |                      |--- createSession -->|--- INSERT INTO DB ---->|
     |<-- 201 Created ------|                     |                        |
     |    (Timer starts)    |                     |                        |
     |                      |                     |                        |
     |                      |     [Time Passes]   |                        |
     |                      |                     |                        |
     |--- POST clock-out -->|                     |                        |
     |                      |--- getActive() ---->|--- query open rec ---->|
     |                      |<-- session data ----|<-- session rec --------|
     |                      |--- calcDuration() ->|                        |
     |                      |    (Math/Rules)     |                        |
     |                      |--- closeSession --->|--- UPDATE status/out ->|
     |<-- 200 OK (Summary)--|                     |                        |
2. Database Schema & Data Models
SQL DDL Specification
CREATE TABLE attendance_records (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    employee_id VARCHAR(36) NOT NULL,
    date DATE NOT NULL,
    clock_in_time TIMESTAMP NOT NULL,
    clock_out_time TIMESTAMP NULL,
    duration_minutes INT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_attendance_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_attendance_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    CONSTRAINT chk_attendance_status CHECK (status IN ('PRESENT', 'HALF_DAY', 'ABSENT', 'IN_PROGRESS')),
    CONSTRAINT uq_user_clock_in UNIQUE (user_id, clock_in_time)
);

CREATE INDEX idx_attendance_user_date ON attendance_records(user_id, date);
CREATE INDEX idx_attendance_org_roster ON attendance_records(date, status);
Pre-Seeded Test Dataset

Record ID
User ID
Employee ID
Date
Clock In (ISO)
Clock Out (ISO)
Duration (min)
Final Status
att-rec-101
usr_99812
 EMP-001
2026-11-02
2026-11-02T09:00:00Z
2026-11-02T17:30:00Z
510
 PRESENT
att-rec-102
usr_99813
 EMP-002
2026-11-02
2026-11-02T09:15:00Z
2026-11-02T13:45:00Z
270
 HALF_DAY
att-rec-103
usr_99814
 EMP-003
2026-11-02
2026-11-02T10:00:00Z
2026-11-02T13:00:00Z
180
 ABSENT
att-rec-104
usr_99812
 EMP-001
2026-11-03
2026-11-03T08:55:00Z
2026-11-03T17:15:00Z
500
 PRESENT
att-rec-105
usr_99813
 EMP-002
2026-11-03
2026-11-03T09:00:00Z
NULL
0
 IN_PROGRESS
att-rec-106
usr_99814
 EMP-003
2026-11-03
2026-11-03T13:00:00Z
2026-11-03T17:00:00Z
240
 HALF_DAY

3. REST API Interface Contracts
1. POST /api/v1/attendance/clock-in
Description: Initiates an active clock-in session for the authenticated context.
Access Control: Authenticated Employee (Bearer <JWT>).
Request Body: None (Identity extracted from token).
Success Response (201 Created):


{
  "status": "success",
  "message": "Clock-in successful",
  "record": {
    "id": "7b0b6c62-8e7c-48be-8fbf-4cb34dcfb987",
    "userId": "usr_99814",
    "employeeId": "EMP-003",
    "date": "2026-11-04",
    "clockInTime": "2026-11-04T09:01:15.123Z",
    "clockOutTime": null,
    "durationMinutes": 0,
    "status": "IN_PROGRESS"
  }
}

Error Response (400 Bad Request):

{
  "status": "error",
  "code": "ACTIVE_SESSION_EXISTS",
  "message": "An active attendance session is already in progress for this employee."
}
2. POST /api/v1/attendance/clock-out
Description: Concludes the open attendance session, computes elapsed time, and assigns statutory classification status.
Access Control: Authenticated Employee (Bearer <JWT>).
Classification Threshold Logic:
Total Minutes $\ge$ 480 (8 hrs): PRESENT
Total Minutes $\ge$ 240 and $<$ 480 (4–8 hrs): HALF_DAY
Total Minutes $<$ 240 ($<$ 4 hrs): ABSENT
Success Response (200 OK):


{
  "status": "success",
  "message": "Clock-out successful",
  "record": {
    "id": "7b0b6c62-8e7c-48be-8fbf-4cb34dcfb987",
    "userId": "usr_99814",
    "employeeId": "EMP-003",
    "date": "2026-11-04",
    "clockInTime": "2026-11-04T09:01:15.123Z",
    "clockOutTime": "2026-11-04T17:35:15.123Z",
    "durationMinutes": 514,
    "status": "PRESENT"
  }
}

Error Response (400 Bad Request):

{
  "status": "error",
  "code": "NO_ACTIVE_SESSION",
  "message": "No active clock-in session found to clock out from."
}
3. GET /api/v1/attendance/today
Description: Retrieves the current day's active status, session intervals, and total accumulated duration.
Access Control: Authenticated Employee.
Success Response (200 OK):

{
  "status": "success",
  "data": {
    "hasActiveSession": true,
    "activeSession": {
      "id": "7b0b6c62-8e7c-48be-8fbf-4cb34dcfb987",
      "clockInTime": "2026-11-04T09:01:15.123Z",
      "elapsedMinutes": 142
    },
    "todayTotalMinutes": 142,
    "completedSessions": []
  }
}
4. GET /api/v1/attendance/history
Description: Lists chronological attendance logs for a specific calendar month and year.
Query Parameters: month=11 (1-12), year=2026.
Access Control: Authenticated Employee.
Success Response (200 OK):

{
  "status": "success",
  "data": {
    "month": 11,
    "year": 2026,
    "totalHoursLogged": 38.5,
    "daysPresent": 4,
    "daysHalfDay": 1,
    "daysAbsent": 0,
    "records": [
      {
        "id": "att-rec-101",
        "date": "2026-11-02",
        "clockInTime": "2026-11-02T09:00:00Z",
        "clockOutTime": "2026-11-02T17:30:00Z",
        "durationMinutes": 510,
        "status": "PRESENT"
      }
    ]
  }
}
5. GET /api/v1/attendance/admin/daily-report
Description: Administrative summary of organization-wide clock-in distribution and daily roster.
Access Control: Role-restricted (ADMIN, HR).
Query Parameters: date=YYYY-MM-DD.
Success Response (200 OK):

{
  "status": "success",
  "data": {
    "date": "2026-11-04",
    "metrics": {
      "totalHeadcount": 50,
      "clockedInCount": 42,
      "halfDayCount": 3,
      "absentCount": 5
    },
    "roster": [
      {
        "employeeId": "EMP-001",
        "fullName": "Jane Doe",
        "department": "Engineering",
        "clockInTime": "2026-11-04T09:01:15Z",
        "clockOutTime": null,
        "status": "IN_PROGRESS"
      }
    ]
  }
}
4. UI Component Architecture & State Management
Front-End Component Composition
<ClockWidget />: Context provider wrapper managing user actions, invoking /clock-in and /clock-out mutations, and binding to local application storage.
<ActiveTimer />: High-precision timer component maintaining an internal ticker (setInterval at 1000ms offset from clockInTime) outputting HH:mm:ss.
<TimesheetCalendar />: Filterable grid supporting custom month/year dropdowns, rendering monthly aggregates, color-coded badges, and session listings.
<AdminDailyAttendanceReport />: Executive management dashboard rendering headcount metrics tiles and searchable, exportable daily employee rosters.
Automation Test Locators Matrix
Target Element / Control
Component Host
data-testid Attribute
Description & Action
Clock-In Action Button
 <ClockWidget />
btn-clock-in
Initiates session when no open session exists.
Clock-Out Action Button
 <ClockWidget />
btn-clock-out
Finalizes current open session.
Active Ticker Counter
 <ActiveTimer />
timer-active-session
Text node containing live duration formatted as HH:mm:ss.
Timesheet Historical Table
 <TimesheetCalendar />
table-timesheet-history
Tabular list of historical records for target month.
Month Selector Control
 <TimesheetCalendar />
select-month-filter
Dropdown element handling numerical month selection.
Monthly Present Count Card
 <TimesheetCalendar />
card-monthly-present
Aggregate metric display for days tagged as PRESENT.
Monthly Absent Count Card
 <TimesheetCalendar />
card-monthly-absent
Aggregate metric display for days tagged as ABSENT.
Total Hours Metric Card
 <TimesheetCalendar />
card-total-hours
Aggregate metric display for total hours completed.
Admin Roster Data Table
 <AdminDailyAttendanceReport />
table-admin-attendance-roster
Roster table containing cross-organization logs.

5. Intentional Seeded Bugs Specifications (For Antigravity Implementation)
This section details intentional architectural defects seeded within Module 04 for automated regression detection and Antigravity framework validation.
DEFECT-010: UTC Date Parsing Offset in Daily Clock-In
Module / File: backend/src/controllers/AttendanceController.ts
Defect Type: Timezone Handling / Date Boundary Serialization
Description: In POST /api/v1/attendance/clock-in, the date attribute is determined using .toISOString().split('T')[0] (UTC date) instead of formatting according to the local organization timezone (Asia/Kolkata / configured offset). For shifts beginning after 5:30 PM UTC (or corresponding local evening shifts), this shifts the date forward or backward, corrupting daily aggregation.
Failure Impact: A user starting a shift at 11:30 PM IST (6:00 PM UTC) on November 4 receives an entry recorded under date 2026-11-04 instead of the local working calendar day 2026-11-05, breaking next-day clock-out reconciliation.
Target Automation Assertion: Verify response.body.record.date exactly matches Intl.DateTimeFormat('en-CA', { timeZone: orgTimezone }).format(now).
DEFECT-011: Missing Concurrency Gate on Simultaneous Session Creation
Module / File: backend/src/services/AttendanceService.ts
Defect Type: Concurrency / Race Condition Flaw
Description: In POST /api/v1/attendance/clock-in, there is a missing concurrency check / race condition check. Rapid double clicks dispatching simultaneous requests within 50ms both pass the "no active session" check, creating two simultaneous unclosed clock-ins for the same user on the same day.
Failure Impact: Duplicate sessions break total hour counters, throw uncaught 500 exceptions when resolving clock-out ambiguous keys, and corrupt downstream payroll calculations.
Target Automation Assertion: Dispatching two concurrent POST /clock-in calls via Promise.all() must resolve to exactly one 201 Created and one 400 Bad Request (ACTIVE_SESSION_EXISTS).
DEFECT-012: Off-By-One Boundary Error on Half-Day Status Classification
Module / File: backend/src/services/AttendanceService.ts
Defect Type: Business Rule Logic Error (Strict Inequality)
Description: In the status classification threshold logic inside POST /api/v1/attendance/clock-out, the condition is written as if (totalMinutes > 240) instead of if (totalMinutes >= 240) for HALF_DAY. If an employee logs exactly 4.0 hours (240 minutes), the system evaluates to false and improperly tags them as 'ABSENT'.
Failure Impact: Employees fulfilling exactly 240.0 minutes of mandatory half-day working time are penalized with an unlawful ABSENT status, directly affecting salary deductions and attendance compliance.
Target Automation Assertion: An attendance session spanning exactly 14,400,000 milliseconds (240 minutes) must yield status: 'HALF_DAY', rather than 'ABSENT'.

