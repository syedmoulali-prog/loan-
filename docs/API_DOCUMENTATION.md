# REST API Documentation
## Customer Loan Eligibility System

Base API URL: `http://localhost:8080/api`

### 1. Authentication Endpoints (`/api/auth`)
- `POST /api/auth/register`: Register new customer user.
- `POST /api/auth/login`: Authenticate credentials, returns JWT Bearer token and user roles.
- `POST /api/auth/logout`: Invalidate user session.
- `GET /api/auth/me`: Retrieve currently authenticated user context.
- `POST /api/auth/reset-password`: Self password modification.

### 2. Customers (`/api/customers`)
- `GET /api/customers`: List all customer borrower profiles (Admin/Staff/Reviewer).
- `GET /api/customers/{id}`: Get customer profile by ID.
- `GET /api/customers/user/{userId}`: Fetch customer profile linked to user account.
- `POST /api/customers`: Create customer profile.
- `PUT /api/customers/{id}`: Update customer profile.
- `DELETE /api/customers/{id}`: Delete profile (Admin only).

### 3. Financial Details (`/api/customers/{customerId}/financial`)
- `GET /api/customers/{customerId}/financial`: Fetch latest income, expenses, obligations, and DTI ratio.
- `POST /api/customers/{customerId}/financial`: Submit or update verified financial details.

### 4. Loan Applications (`/api/applications`)
- `GET /api/applications`: Get all loan applications (with optional `?status=` query filter).
- `GET /api/applications/{id}`: Retrieve application by ID with customer, financial, and eligibility data.
- `GET /api/applications/customer/{customerId}`: Retrieve all applications belonging to a specific customer.
- `POST /api/applications`: Create new loan application (supports multi-step payload with inline financials).
- `PUT /api/applications/{id}/status`: Update loan status (Approved, Rejected, Under Review) with remarks.
- `DELETE /api/applications/{id}`: Remove application (Admin only).

### 5. Document Management (`/api`)
- `GET /api/applications/{applicationId}/documents`: List submitted documents for an application.
- `POST /api/applications/{applicationId}/documents`: Upload supporting document (Identity, Income, Bank Statement).
- `PUT /api/documents/{id}/verify`: Verify or reject document (`VERIFIED` / `REJECTED`) with staff remarks.

### 6. Eligibility Evaluation Engine (`/api/applications/{applicationId}`)
- `POST /api/applications/{applicationId}/evaluate`: Execute real-time credit rules evaluation against active rules in `loan_rules`. Stores score, status (`ELIGIBLE`, `NOT_ELIGIBLE`, `REQUIRES_REVIEW`), reason, and checklist in `eligibility_results`.
- `GET /api/applications/{applicationId}/eligibility`: Retrieve existing evaluation result.

### 7. Configurable Loan Rules (`/api/rules`)
- `GET /api/rules`: List all loan rules.
- `GET /api/rules/active`: List only active rules used by the engine.
- `POST /api/rules`: Create new eligibility rule (Admin only).
- `PUT /api/rules/{id}`: Modify rule threshold value or description (Admin only).
- `PATCH /api/rules/{id}/status`: Toggle active status of a rule (Admin only).
- `DELETE /api/rules/{id}`: Delete rule (Admin only).

### 8. Analytics & Dashboards (`/api/dashboard`)
- `GET /api/dashboard/admin`: Real-time aggregated statistics, status counts, loan type breakdowns, monthly trends, and recent audit logs.
- `GET /api/dashboard/staff`: Queue metrics (new, under verification, under review, eligible).
- `GET /api/dashboard/reviewer`: Underwriter decision queue.
- `GET /api/dashboard/customer/{customerId}`: Customer application status and profile completion stats.

### 9. Reports (`/api/reports`)
- `GET /api/reports/applications`: Filter applications by status, loan type, and date range.
- `GET /api/reports/summary`: Aggregate KPIs summary.
- `GET /api/reports/export/csv`: Stream download of application report in CSV format.

### 10. Audit Logs & User Control
- `GET /api/audit-logs`: Chronological security audit logs.
- `GET /api/users`: List system accounts.
- `PUT /api/users/{id}`: Modify user role or active status.
- `PUT /api/users/{id}/reset-password`: Administrator password reset.
- `GET /api/settings` & `POST /api/settings`: System settings configuration.
