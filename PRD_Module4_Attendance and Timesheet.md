Product Requirement Document (PRD)
Metadata
Details
Product Name
StaffSync HRM
Module
Module 04: Attendance & Timesheet Management
Document Version
2.0 (Product Manager Edition)
Document Owner
Varun Kulshrestha (Product Lead / PM)
Status
Approved for UX & Engineering Delivery


1. Problem Statement & Executive Summary
Manual timesheets, physical punch registers, and disconnected spreadsheet logs lead to inaccuracies, delayed payroll processing, and zero real-time visibility into daily workforce availability. HR teams spend countless hours each month reconciling attendance disputes, while employees lack visibility into their logged hours.

StaffSync HRM Module 04 delivers a modern digital attendance solution featuring 1-click web Clock-In and Clock-Out, a real-time shift timer, automated daily status determination (Present, Half-Day, Absent), self-service monthly timesheet views, and an organization-wide administrative monitor for real-time headcount availability.

2. Target Personas & Use Cases
Persona
Core Responsibilities & Needs
Key User Intent
Standard Employee
Daily shift tracking, recording check-in/out times, and monitoring work hours.
Wants an effortless 1-click punch action, a live shift timer, and transparent monthly attendance records.
HR Manager
Monitoring daily workforce availability, tracking absenteeism, and validating timesheets.
Needs an organization-wide live monitor showing who is clocked in, on half-day, or absent today.
Department Lead
Team shift coverage, project capacity planning, and punctuality oversight.
Requires real-time visibility into team members' check-in status without intrusive manual check-ins.


3. Product Goals & Success Metrics (KPIs)
Business Goals
Eliminate manual timesheet tracking with an effortless, 1-click digital punch experience.
Provide real-time visibility into organization-wide headcount availability.
Automate statutory attendance status classification based on objective hours worked.
Empower employees with transparent self-service timesheet histories.
Key Performance Indicators (KPIs)
Punch Completion Time: $\le$ 1 click and under 1 second to record Clock-In or Clock-Out.
Attendance Adoption: $\ge$ 95% of active employees logging shifts digitally within week 1.
Timesheet Dispute Reduction: 75% drop in end-of-month attendance correction requests.
Live Monitor Precision: 100% real-time reflection of active workforce status.

4. Attendance Rules & Daily Classification Standards
Daily attendance status is evaluated automatically based on cumulative net working hours logged within the organization's operating day:

Status Code
Status Label
Working Duration Requirement
Visual Indicator
PRESENT
Full Day Present
Cumulative active time $\ge$ 8.0 hours (480 minutes)
Green Pill Badge
HALF_DAY
Half Day
Cumulative active time $\ge$ 4.0 hours and < 8.0 hours (240 to 479 minutes)
Amber Pill Badge
ABSENT
Absent
Cumulative active time < 4.0 hours (0 to 239 minutes) or no punch recorded
Red Pill Badge
IN_PROGRESS
Currently on Shift
Active open shift session without a terminal Clock-Out
Blue Pulsing Badge


5. User Journey & Experience Flow
Starting the Shift (Clock In):
The employee lands on their dashboard at the start of their workday.
The primary action displays a prominent "Clock In" button.
Clicking Clock In immediately records the timestamp, begins an active timer ticking in HH:mm:ss, and switches the button to "Clock Out".
During the Shift:
The dynamic shift counter ticks continuously, showing elapsed time for the current session.
Net daily hours accumulated across previous sessions (if taking breaks) are summarized in real time.
Ending the Shift (Clock Out):
At the end of the shift, the employee clicks "Clock Out".
The session ends, the timer halts, and cumulative hours for the day are computed.
The daily status badge updates instantly to Present, Half-Day, or Absent based on total hours.
Reviewing Historical Timesheets:
Employees navigate to their "Timesheet History" to review daily logs across any selected month and year.
The view breaks down first clock-in, last clock-out, total sessions, cumulative hours, and daily status.
HR Daily Roster Oversight:
HR Managers open the "Daily Attendance Monitor".
Top metrics summarize: Total Headcount, Currently Clocked In, Half-Day Count, and Absent Count.
An employee roster table displays real-time punch status, searchable by name and filterable by department.

6. Scope Boundaries
In Scope
1-Click web Clock-In and Clock-Out action with live shift session timer.
Net daily hours aggregation supporting multiple shift sessions per day.
Automated statutory status classification (Present, Half-Day, Absent).
Self-service monthly timesheet calendar and tabular history with month/year selectors.
Organization-wide daily attendance monitor with summary KPI cards for Admin and HR.
Real-time search and department filtering on the administrative roster.
Out of Scope (Future Releases)
Physical biometric hardware integration (fingerprint, facial scanners) (Phase 2).
Mobile GPS geofencing and strict office IP whitelisting (Phase 2).
Overtime multiplier rules and payroll compensation computation (Handled in Payroll Module).
Formal employee punch adjustment / dispute request workflow (Phase 3).

7. Functional Requirements & Acceptance Criteria
Feature 1: 1-Click Clock-In / Clock-Out & Shift Timer
User Story: As an employee, I want to record my start and end times with a single click so that my active work hours are accurately tracked.
Acceptance Criteria:
If no active session exists for today, the dashboard displays an enabled "Clock In" button.
Clicking "Clock In" immediately records the current time, transitions the button to "Clock Out", and starts an active session timer (HH:mm:ss).
While clocked in, the session timer updates dynamically every second.
Clicking "Clock Out" closes the active session, stops the timer, and computes net duration.
The interface prevents duplicate accidental rapid punches through momentary submission throttling.
Feature 2: Automated Daily Hours & Status Engine
User Story: As an enterprise system, I want to automatically categorize daily attendance so that compliance and performance records are consistent.
Acceptance Criteria:
Total daily hours are calculated as the sum of all completed punch sessions for the calendar day.
Cumulative hours are displayed clearly formatted to two decimal points (e.g., 8.25 hrs).
Following each terminal clock-out, the daily attendance badge updates automatically:
$\ge 8.00\text{ hrs} \rightarrow$ Present
$\ge 4.00\text{ hrs}$ and < $8.00\text{ hrs} \rightarrow$ Half-Day
< $4.00\text{ hrs} \rightarrow$ Absent
Feature 3: Self-Service Timesheet History
User Story: As an employee, I want to browse my historical attendance logs by month so that I can audit my worked hours and attendance regularity.
Acceptance Criteria:
The timesheet screen provides Month and Year dropdown selectors.
The table displays Date, First Clock-In, Last Clock-Out, Total Sessions, Cumulative Hours, and Final Status Badge.
An informative empty-state message appears if no records exist for the selected month.
Feature 4: Company-Wide Attendance Monitor (Admin & HR)
User Story: As an HR Manager, I want a centralized daily overview of all staff attendance so that I can see today's operational headcount and identify absentees.
Acceptance Criteria:
The monitor displays 4 real-time KPI cards: Total Headcount, Currently Clocked In, Half-Day Count, and Absent Count.
A comprehensive workforce table lists all employees with their first clock-in, current status, and total hours.
Admins can search employees by name or filter the roster by Department without a full page reload.

8. Non-Functional Requirements (NFRs)
Time Precision & Local Consistency: Timestamps and date calculations must consistently reflect the organization's local operating timezone.
State Resilience: If a user closes or refreshes their browser while clocked in, the active shift state and elapsed timer recover seamlessly upon re-opening.
Performance: Clock-In and Clock-Out state transitions complete within $\le$ 300ms.
Usability: High-contrast status badges (Present, Half-Day, Absent, In-Progress) for effortless visual scanning.

9. Assumptions & Open Product Questions
Auto Clock-Out Policy: If an employee forgets to clock out at the end of the day, should the system auto-close the session at midnight? (Recommended: Flag as unclosed session and prompt user on next login).
Grace Periods: Should there be a 15-minute grace period for the 8-hour Present threshold? (Flagged for corporate HR policy alignment).
