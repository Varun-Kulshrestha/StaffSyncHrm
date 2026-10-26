# Architecture & Technical Specifications

**Module:** MOD-01 Authentication & RBAC  
**System:** StaffSync HRM  
**Author:** Lead Full-Stack Developer  
**Status:** Implemented  

---

## 1. System Overview

StaffSync HRM Module 1 provides a secure, token-based authentication mechanism and client-side/server-side Role-Based Access Control (RBAC).

```
[ Browser / Frontend Client (React + Vite) ]
                    │
            HTTP/REST (CORS enabled)
                    │
                    ▼
[ Express.js REST API Server (Port: 5000) ]
        ├── Auth Router (/api/v1/auth)
        │     ├── POST /login
        │     ├── GET  /me
        │     └── POST /logout
        ├── Admin Router (/api/v1/admin)
        │     └── GET  /stats
        └── Database Access Layer (Seeded Accounts with Bcrypt)
```

---

## 2. Technology Stack

* **Frontend:** React 18, Vite, Lucide Icons, Vanilla CSS Design System with responsive glassmorphic cards and dark/light UI.
* **Backend:** Node.js, Express.js, JSON Web Tokens (`jsonwebtoken`), Password Hashing (`bcryptjs`), CORS.
* **Database / Store:** Seeded persistent user store in `backend/src/data/users.json` / in-memory data store with atomic updates.

---

## 3. Seeded Accounts & Roles

| Email | Password | Role | Status | User ID |
|---|---|---|---|---|
| `admin@staffsync.com` | `Admin@123` | `ADMIN` | Active (`true`) | `usr_99812` |
| `hr@staffsync.com` | `Hr@123` | `HR` | Active (`true`) | `usr_99813` |
| `employee@staffsync.com` | `Emp@123` | `EMPLOYEE` | Active (`true`) | `usr_99814` |
| `deactivated@staffsync.com` | `Deact@123` | `EMPLOYEE` | Inactive (`false`) | `usr_99815` |

---

## 4. API Endpoints Contract

### 4.1 `POST /api/v1/auth/login`
- **Purpose:** Authenticate user credentials and issue JWT.
- **Headers:** `Content-Type: application/json`
- **Body:** `{ "email": "<email>", "password": "<password>" }`
- **Success (`200 OK`):**
  ```json
  {
    "status": "success",
    "token": "eyJhbGciOi...",
    "user": {
      "id": "usr_99812",
      "email": "admin@staffsync.com",
      "role": "ADMIN",
      "is_active": true
    }
  }
  ```

### 4.2 `GET /api/v1/auth/me`
- **Purpose:** Retrieve currently authenticated user context.
- **Headers:** `Authorization: Bearer <token>`
- **Success (`200 OK`):** User payload.

### 4.3 `GET /api/v1/admin/stats`
- **Purpose:** System metrics & operational analytics.
- **Headers:** `Authorization: Bearer <token>`
- **Expected:** Admin only (Enforced in RBAC).

### 4.4 `POST /api/v1/auth/logout`
- **Purpose:** Terminate session / invalidate token client-side.
- **Success (`200 OK`):** Logout confirmation message.

---

## 5. Locators Map for Automation (`data-testid`)

* `input-email`: Email text input
* `input-password`: Password input (masked)
* `btn-login`: Login button
* `error-banner`: Inline error alert message container
* `dashboard-title`: Dashboard main heading `<h1>`
* `btn-logout`: Top navbar logout action button
