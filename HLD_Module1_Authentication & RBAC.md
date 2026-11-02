High-Level Design (HLD) Document
System Name: StaffSync HRM - Enterprise Workforce Management Portal
Module Name: MOD-01: Authentication & Role-Based Access Control (RBAC)
Document Version: 1.0
Author / SDET Lead: Varun Kulshrestha
Status: Approved for Development & QA Automation


1. System Architecture Overview
The StaffSync HRM Authentication & RBAC module is designed following a robust 3-Tier Architecture pattern, ensuring separation of concerns, scalability, and maintainability across the system stack.
Architectural Tiers
Presentation Layer (Frontend Client): Built with React 18 SPA bundled via Vite. Handles client-side routing, local UI state management, context-driven session storage, and route guards that evaluate JWT payloads prior to component rendering.
Application Layer (API Gateway / Backend Services): Powered by an Express.js REST API server. Houses custom JWT authentication middleware, central request controllers, payload validation routines, and the role verification engine enforcing route permissions.
Data Persistence Layer (User Store): Centralized data repository storing user profile metadata, unique identifiers, bcrypt-hashed credentials, explicit role assignments, and account activation states (is_active).
End-to-End Request Flow Architecture
+-----------------------------------------------------------------------------------+

|                                PRESENTATION LAYER                                 |

|  [ React 18 SPA Client ] --( Submits Credentials / Bearer Token )                 |

+------------------------------------------|----------------------------------------+

                                           | HTTP / HTTPS

                                           v

+-----------------------------------------------------------------------------------+

|                                 APPLICATION LAYER                                 |

|  [ Reverse Proxy / CORS Policy ]                                                  |

|          |                                                                        |

|          v                                                                        |

|  [ Express.js Middleware ] ---> ( Sanitize Payload & Verify JWT Signature )       |

|          |                                                                        |

|          v                                                                        |

|  [ Auth / RBAC Controller ] ---> ( Process Login / Evaluate Authorization Rules ) |

+------------------------------------------|----------------------------------------+

                                           | Database Queries

                                           v

+-----------------------------------------------------------------------------------+

|                              DATA PERSISTENCE LAYER                               |

|  [ User Store Database ] <---> ( Retrieve Hashed Passwords, Roles & Active Status)|

+-----------------------------------------------------------------------------------+


2. Authentication & Authorization Sequence
The authentication flow validates incoming user credentials, checks current account eligibility, issues secure tokens, and controls subsequent protected interactions.

Credential Submission: The user inputs their email address and password into the login interface and submits the form.
Frontend Pre-Validation: Client-side JavaScript performs preliminary form validation, verifying email syntactical formatting and verifying that password input fields are non-empty.
Payload Ingestion: Express.js receives the incoming POST /api/v1/auth/login request and passes it through body-parsing middleware to validate structural integrity.
Identity Lookup & Hash Verification: The Auth Controller queries the User Store using the supplied email. If found, the stored bcrypt password hash is compared against the submitted plain-text password using asynchronous hashing routines.
Account Status Validation: The server evaluates the retrieved record's is_active boolean flag. If is_active evaluates to false, the request process terminates with an authorization failure.
JWT Minting: Upon successful credential matching and active status confirmation, a JSON Web Token (JWT) is generated containing essential user claims (id, email, role) with a signed expiration set to 8 hours.
Response Handling & Navigation: The backend returns the signed JWT token. The client stores this token in secure session storage and triggers conditional routing:
ADMIN role redirects to /admin/dashboard
HR role redirects to /hr/dashboard
EMPLOYEE role redirects to /employee/dashboard
Subsequent Request Processing: Every subsequent protected HTTP call transmits the token via the Authorization header (Bearer <token>). The Express jwtAuth middleware interceptor decodes and verifies the signature on each incoming request before delegating control to downstream controllers.


3. Role-Based Access Control (RBAC) Matrix
The system enforces strict access policies depending on the user's explicit authorization level. The table below outlines resource access capabilities across user roles.

Route / Resource Endpoint
Admin Permission
HR Permission
Employee Permission
Guest / Unauthenticated
/login
 Allowed (Redirects)
 Allowed (Redirects)
 Allowed (Redirects)
 Allowed (Access Granted)
/admin/dashboard
 Read / Write
 Denied (403)
 Denied (403)
 Denied (401)
/hr/dashboard
 Read / Write
 Read / Write
 Denied (403)
 Denied (401)
/employee/dashboard
 Read / Write
 Read / Write
 Read / Write
 Denied (401)
/api/v1/auth/me
 Execute (200 OK)
 Execute (200 OK)
 Execute (200 OK)
 Denied (401)
/api/v1/admin/stats
 Execute (200 OK)
 Denied (403)
 Denied (403)
 Denied (401)



4. API Interface Design & Data Contracts
4.1 Login Endpoint
Endpoint: POST /api/v1/auth/login
Description: Authenticates credentials and returns a signed access token.

Request Schema:{

  "email": "user@staffsync.com",

  "password": "SecurePassword123!"

}

Response Schemas:

200 OK (Successful Authentication):

{

  "success": true,

  "message": "Authentication successful",

  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",

  "user": {

    "id": "usr_99812",

    "email": "user@staffsync.com",

    "role": "ADMIN",

    "is_active": true

  }

}

400 Bad Request (Missing or Invalid Request Format):

{

  "success": false,

  "error": "BAD_REQUEST",

  "message": "Email and password are required fields"

}

401 Unauthorized (Invalid Credentials):

{

  "success": false,

  "error": "INVALID_CREDENTIALS",

  "message": "Invalid email address or password"

}

403 Forbidden (Account Deactivated):

{

  "success": false,

  "error": "ACCOUNT_DEACTIVATED",

  "message": "User account is currently inactive. Contact your administrator."

}


4.2 Current User Identity Endpoint
Endpoint: GET /api/v1/auth/me
Description: Returns profile metadata for the authenticated user session.

Request Headers:Authorization: Bearer <JWT_TOKEN>

Response Schema (200 OK):{

  "success": true,

  "user": {

    "id": "usr_99812",

    "email": "user@staffsync.com",

    "role": "ADMIN",

    "is_active": true,

    "created_at": "2024-01-15T08:30:00.000Z"

  }

}


4.3 Administrative Statistics Endpoint
Endpoint: GET /api/v1/admin/stats
Authorization Rule: Requires valid JWT containing role === "ADMIN".

Request Headers:Authorization: Bearer <JWT_TOKEN>

Response Schema (200 OK):{

  "success": true,

  "data": {

    "totalUsers": 1250,

    "activeSessions": 42,

    "pendingApprovals": 7,

    "systemHealth": "OPTIMAL"

  }

}


4.4 Session Termination Endpoint
Endpoint: POST /api/v1/auth/logout
Description: Invalidates client session state.

Request Headers:
Authorization: Bearer <JWT_TOKEN>

Response Schema (200 OK):


{

  "success": true,

  "message": "Successfully logged out"

}


5. Data Model & Schema Design
Entity Field Definitions: User
Field Name
Data Type
Constraints / Attributes
Description
id
 String / UUID
Primary Key, Unique, Auto-generated
System-wide unique identifier for the user account
email
 String
Unique, Indexed, Non-Nullable
User login identifier and primary notification address
password
 String
Non-Nullable
Encrypted hash computed using bcrypt
role
 Enum
Values: ADMIN, HR, EMPLOYEE
Access control tier assigned to the account
is_active
 Boolean
Default: true, Non-Nullable
Flag indicating whether the account is permitted to authenticate
created_at
 Timestamp
ISO 8601, Default: Current UTC
Timestamp indicating exact account creation date and time

Seeded Accounts Strategy
The database environment is populated with standard test accounts for system testing and integration validation:


User ID
Email Identifier
Assigned Role
Status (is_active)
Intended Verification Purpose
usr_99812
admin@staffsync.com
 ADMIN
true (Active)
Full privilege administration and user management testing
usr_99813
hr@staffsync.com
 HR
true (Active)
Personnel management and resource administration testing
usr_99814
employee@staffsync.com
 EMPLOYEE
true (Active)
Standard workforce self-service workflow testing
usr_99815
deactivated@staffsync.com
 EMPLOYEE
false (Inactive)
Verification of account lockouts and access restriction rules



6. Security & Session Management Architecture
Password Hashing Standards
All user credentials are stored encrypted at rest. Passwords are processed through bcrypt utilizing a salt complexity factor of 10 rounds. Plaintext passwords are never logged, stored, or returned in API payloads.
JSON Web Token (JWT) Specifications
Algorithm: HMAC SHA-256 (HS256).
Token Expiration: Hard fixed limit of 8 hours from issuance.
Token Payload (Claims): Contains minimal, non-sensitive operational identifier fields:

{

  "sub": "usr_99812",

  "email": "user@staffsync.com",

  "role": "ADMIN",

  "iat": 1710000000,

  "exp": 1710028800

}
Transport & Network Security
CORS Policy Enforcement: Requests are strictly constrained using explicit host origin whitelisting configured within express backend middleware.
Payload Size Limits: Express body parsers enforce a maximum request size threshold of 10kb to protect against request-based denial-of-service attempts.
Frontend Token Storage & Navigation Guards
Client Storage Location: Tokens are held in sessionStorage to isolate context across browser sessions while reducing persistent device exposure.
Route Guard Implementation: High-Order React Router wrappers intercept top-level navigation changes. Requests to protected paths inspect the current token validity and user payload; unauthenticated or unauthorized route changes immediately abort rendering and trigger a redirect to /login.


7. QA Architecture & Seeded Defect Specifications
To facilitate automated test suite validation and support SDET training scenarios, specific architectural flaws have been deliberately introduced into the service implementation.+-----------------------------------------------------------------------------------+

|                            SEEDED QA DEFECT LOCATIONS                             |

|                                                                                   |

|  [ Controller Layer ] -----------> DEFECT-001: Missing String Trimming / Case  |

|                                    Normalization on Email Input                   |

|                                                                                   |

|  [ Account Evaluation ] ---------> DEFECT-002: Unhandled Inactive User Error    |

|                                    Yields 500 Internal Error (Expected 403)       |

|                                                                                   |

|  [ Authorization Middleware ] ---> DEFECT-003: Missing Role Enforcer Rule on      |

|                                    /api/v1/admin/stats Endpoint                  |

+-----------------------------------------------------------------------------------+
DEFECT-001: Input Sanitization Failure
Component: Authentication Controller (POST /api/v1/auth/login)
Description: The application omits standard string sanitization procedures on incoming email parameters. Leading or trailing whitespace is not trimmed, and casing is not normalized before querying the datastore.
Expected Behavior: USER@staffsync.com  should match user@staffsync.com.
Actual Behavior: The system performs a raw database search, causing lookup failures for valid accounts due to case mismatch or whitespace variations.
Automation Verification Target: Assert authentication behavior with varying casing patterns and padded spaces.
DEFECT-002: Improper Exception Handling for Inactive Accounts
Component: Account Status Verification Logic
Description: When encountering an inactive user (is_active === false), the service raises an uncaught exception rather than handling the state gracefully within the request flow.
Expected Behavior: Return HTTP Status 403 Forbidden with body { "error": "ACCOUNT_DEACTIVATED" }.
Actual Behavior: The unhandled exception triggers global error processing, returning HTTP Status 500 Internal Server Error and revealing internal server stack details.
Automation Verification Target: Assert that deactivated account authentications return an explicit 403 Forbidden status code without server errors.
DEFECT-003: Authorization Bypass on Administrative Endpoint
Component: Router Access Control (GET /api/v1/admin/stats)
Description: The router attaches the generic authentication middleware (verifyToken) but fails to include the role validation middleware (requireRole('ADMIN')).
Expected Behavior: Returning 403 Forbidden when non-ADMIN roles attempt access.
Actual Behavior: Any valid JWT (including those belonging to EMPLOYEE or HR roles) grants full access to administrative statistics metrics.
Automation Verification Target: Execute authorization sweep across all roles against /api/v1/admin/stats, confirming non-admin calls are properly rejected with HTTP 403.

