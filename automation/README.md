# StaffSync HRM - Automation Suite

This directory is dedicated to the automated test suite maintained by QA & SDET teams.

## Recommended Frameworks
* **API Testing:** Supertest / Jest or Newman (Postman) / REST Assured
* **E2E / UI Testing:** Playwright / Selenium WebDriver / Cypress

## Test Coverage Checklist for Module 1 (Auth & RBAC)
1. **Positive Flows:**
   - [ ] Admin login redirect to `/admin/dashboard` & verify H1 `"Admin Logged In Successfully"`
   - [ ] HR login redirect to `/hr/dashboard` & verify H1 `"HR Logged In Successfully"`
   - [ ] Employee login redirect to `/employee/dashboard` & verify H1 `"Employee Logged In Successfully"`
   - [ ] Session persistence across page reloads
   - [ ] Explicit logout redirects to `/login` and invalidates browser back navigation

2. **Negative Flows:**
   - [ ] Blank email/password triggers client-side validation errors
   - [ ] Invalid email or invalid password returns 401 `"Invalid email or password"`
   - [ ] Inactive account returns 403 (Note: Watch out for intentional Defect 2!)
   - [ ] Unauthenticated guest redirected to `/login` when accessing protected routes
   - [ ] Employee accessing `/admin/dashboard` renders `"403 Forbidden - Access Denied"`

3. **Seeded Defects to Catch:**
   - [ ] Defect 1: Raw email with whitespace/casing sent via API
   - [ ] Defect 2: Deactivated user receives 500 error instead of 403
   - [ ] Defect 3: Employee token succeeds accessing `GET /api/v1/admin/stats`
