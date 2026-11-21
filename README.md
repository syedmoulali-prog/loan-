# Customer Loan Eligibility System

An enterprise-grade, full-stack credit evaluation and loan underwriter management platform. The system provides real-time automated loan eligibility scoring based on administrator-configurable active rules, document verification pipelines, role-based access control (RBAC), and comprehensive audit compliance.

---

## 1. Technology Stack

- **Frontend**:
  - React.js 18 with Vite
  - React Router DOM 6
  - Tailwind CSS 3 (Custom Blue / White / Indigo Fintech Palette)
  - Recharts (Interactive Status, Loan Type & Volume Trend Charts)
  - Lucide React Icons
  - Axios with JWT Interceptors
- **Backend**:
  - Java 21 (LTS)
  - Spring Boot 3.3.5
  - Spring Security 6 & JJWT 0.12.5 (Stateless Bearer Tokens)
  - Spring Data JPA & Hibernate ORM
  - Bean Validation (`jakarta.validation`)
  - Apache Maven
- **Database**:
  - MySQL 8.0+ (Normalized relational schema, foreign keys, indexes, timestamps)
  - In-memory H2 (for instant zero-configuration test suite and standalone execution)

---

## 2. Project Folder Structure

```
SE1/
├── database/
│   ├── schema.sql             # Full DDL: tables, foreign keys, indexes
│   └── seed.sql               # Seed data: admin, rules, applications, audit
├── backend/
│   ├── pom.xml                # Maven project descriptor
│   └── src/
│       ├── main/
│       │   ├── java/com/loaneligibility/
│       │   │   ├── controller/ # 12 REST API Controllers
│       │   │   ├── dto/        # Request/Response Data Transfer Objects
│       │   │   ├── entity/     # 9 JPA Entities (User, Customer, LoanApp, etc.)
│       │   │   ├── exception/  # GlobalExceptionHandler & Custom Exceptions
│       │   │   ├── repository/ # 9 Spring Data JPA Repositories
│       │   │   ├── security/   # JwtTokenProvider, Filter, SecurityConfig
│       │   │   ├── service/    # EligibilityEngine, Auth, Application, etc.
│       │   │   └── LoanEligibilityApplication.java
│       │   └── resources/
│       │       ├── application.properties    # MySQL production configuration
│       │       └── application-h2.properties # H2 dev/standalone fallback
│       └── test/
│           ├── java/com/loaneligibility/
│           │   └── LoanEligibilityApplicationTests.java # TC01 to TC08 tests
│           └── resources/
│               └── application.properties    # Test DB profile
├── frontend/
│   ├── package.json           # Dependencies and build scripts
│   ├── vite.config.js         # Vite configuration with proxy to port 8080
│   ├── tailwind.config.js     # Tailwind styling configuration
│   ├── index.html             # HTML5 entry
│   └── src/
│       ├── api/               # Axios client instance with auth interceptor
│       ├── components/        # Navbar, Sidebar, StatCard, StatusBadge, Charts
│       ├── context/           # AuthContext, ThemeContext, ToastContext
│       ├── pages/             # 16 Responsive Portal Pages
│       ├── App.jsx            # Routing and RBAC Protected Routes
│       └── main.jsx           # Root bootstrap
└── docs/
    ├── ARCHITECTURE.md        # Architecture, diagrams, and RBAC matrix
    ├── API_DOCUMENTATION.md   # Complete REST API reference
    └── TESTING_GUIDE.md       # Test scenarios TC01-TC08 verification
```

---

## 3. Demo Login Credentials

The database and application seeder come pre-populated with realistic demo accounts across all user roles:

| Role | Email Address | Password | Landing Page Dashboard |
| :--- | :--- | :--- | :--- |
| **Administrator** | `syedmoulali318@gmail.com` | `123456789` | Admin Dashboard (Full governance & rules) |
| **Staff / Loan Officer** | `staff@loaneligibility.com` | `123456789` | Staff Dashboard (Verification queue) |
| **Reviewer / Manager** | `manager@loaneligibility.com` | `123456789` | Reviewer Dashboard (Decisions & approvals) |
| **Customer** | `customer@example.com` | `123456789` | Customer Dashboard (Applications & profile) |

> **Note**: For privacy and security, credentials are never exposed on the public login screen. Enter your registered email and password to log in.

---

## 4. End-to-End Workflow: Registration → Notification → Loan Approval → EMI Repayment

The system implements the complete institutional lifecycle:

1. **Customer Registration**:
   - Customer enters: Full Name, Email, Password, Phone, Date of Birth, Gender, Residential Address, and Employment Type.
   - Form and backend validate all inputs, hash the password using BCrypt, prevent duplicate emails, and atomically create both `USER` and `CUSTOMER` records in MySQL.
   - Triggers real-time administrator notification: `New customer registered` with borrower details and a direct link to the profile.

2. **Customer Login**:
   - Customer enters registered email and password.
   - Verified via Spring Security + BCrypt hash, issuing a signed stateless JWT token.
   - Redirects to Customer Dashboard with personalized greeting: `WELCOME BACK, [CUSTOMER NAME]`.

3. **Multi-Step Loan Application (`+ APPLY FOR LOAN`)**:
   - **Step 1 — Loan Information**: Loan Type (Personal Loan, Education Loan, Home Loan, Vehicle Loan), Requested Amount, Tenure (Months), Application Date.
   - **Step 2 — Financial Information**: Monthly Income, Monthly Expenses, Existing Obligations, Credit Information (with live DTI calculation).
   - **Step 3 — Documents**: Document Type selection (Identity Document, Address Proof, Income Proof, Supporting) with backend multipart upload.
   - **Step 4 — Review & Submit**: Comprehensive review of applicant details, loan info, financials, and attached documents before final submission.

4. **Submission & Administrator Notification**:
   - Generates formatted Application ID (`LA-100xx`).
   - Sets status to `SUBMITTED`.
   - Triggers administrator notification `New Loan Application Received` with loan details and direct review link.
   - Administrator top navigation notification bell (`🔔`) displays live unread counter badge.

5. **Administrator Review & Underwriting**:
   - Admin/Staff verifies or rejects individual uploaded documents.
   - Views automated eligibility result (Score, Passed Rules, Recommendations).
   - Records final decision: `APPROVE` or `REJECT`.

6. **Approval & Monthly EMI Calculation**:
   - When approved, backend calculates the exact monthly payment using the standard banking EMI formula:
     $$\text{EMI} = \frac{P \times r \times (1+r)^n}{(1+r)^n - 1}$$
     *(e.g., ₹5,00,000 at 10% annual interest for 60 months produces EMI = ₹10,623.52, Total Payable = ₹6,37,411.20, Total Interest = ₹1,37,411.20).*
   - Persists repayment schedule in `loan_repayments` table.
   - Sends approval notification to the customer with repayment terms.

7. **Customer Dashboard Active Loan Display**:
   - Prominently displays the **YOUR ACTIVE LOAN** card with read-only backend figures:
     - Status: `APPROVED`
     - Monthly EMI Payment
     - Approved Amount
     - Interest Rate
     - Tenure (Months)
     - Next Payment Date
     - Remaining Balance
     - Payments Completed (`0 / 60`)
   - 6-stage lifecycle progress timeline tracking each milestone.

---

## 5. How to Set Up & Run

### Prerequisites
- Java 21 JDK installed
- Apache Maven 3.8+ installed
- Node.js (v18+) and npm installed
- MySQL 8.0+ (Optional; in-memory fallback enabled automatically for testing)

### Step 1: Database Setup (MySQL)
1. Start your local MySQL server.
2. Run the SQL scripts in order:
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

### Step 2: Backend Setup & Launch
1. Open a terminal in the `backend/` directory:
```bash
cd backend
mvn clean test
mvn spring-boot:run
```
The Spring Boot backend will start on `http://localhost:8080`.
If MySQL is not currently running locally, run with the in-memory H2 profile:
```bash
mvn spring-boot:run -Dspring-boot.run.profiles=h2
```

### Step 3: Frontend Setup & Launch
1. Open another terminal in the `frontend/` directory:
```bash
cd frontend
npm install
npm run dev
```
The React development server will start on `http://localhost:5173`. Open your browser and navigate to `http://localhost:5173`.

---

## 5. Environment Variables Configuration

Backend (`backend/src/main/resources/application.properties`):
| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `DB_HOST` | `localhost` | MySQL host address |
| `DB_PORT` | `3306` | MySQL port |
| `DB_NAME` | `customer_loan_system` | Database name |
| `DB_USERNAME` | `root` | Database username |
| `DB_PASSWORD` | *(empty)* | Database password |
| `JWT_SECRET` | *(256-bit secure key)* | Secret key used for signing JWT tokens |

Frontend (`frontend/.env`):
| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `http://localhost:8080/api` | REST API base endpoint |

---

## 6. Configurable Eligibility Evaluation Engine

The core evaluation logic loads **active rules** from the database (`loan_rules`):
- `MIN_AGE_YEARS`: Ensures borrower is at least 21 years old.
- `MAX_AGE_YEARS`: Restricts borrower age ceiling.
- `MIN_MONTHLY_INCOME`: Verifies minimum verifiable income ($2,500).
- `MAX_DEBT_TO_INCOME_RATIO`: Caps debt-to-income ratio at 50.00%.
- `MIN_CREDIT_CATEGORY`: Enforces credit standing (FAIR, GOOD, EXCELLENT).
- `REQUIRED_DOCUMENTS_COUNT`: Confirms verified supporting documents.

Administrators can activate, deactivate, update threshold values, or create new rules directly via the UI at `/rules`.

---

## 7. Automated Test Suite (TC01 - TC14)

All 14 comprehensive test cases are implemented and verified in `LoanEligibilityApplicationTests.java`:
- **TC01**: Valid Registration and JWT issuance
- **TC02**: Duplicate email conflict rejection
- **TC03**: Invalid numeric financial value handling
- **TC04**: Complete application evaluation (`ELIGIBLE`)
- **TC05**: Ineligible income evaluation (`NOT_ELIGIBLE`)
- **TC06**: Search loan application by ID
- **TC07**: Underwriter update application status
- **TC08**: Generate loan application summary report
- **TC09**: Customer profile photo upload, retrieval, and removal
- **TC10**: Customer registration triggers administrator notification
- **TC11**: Loan application submission sets status `SUBMITTED` and triggers admin notification
- **TC12**: Admin application approval calculates banking EMI and persists repayment schedule
- **TC13**: Notification toggle mark as read and unread counter queries
- **TC14**: Complete end-to-end institutional workflow: Customer Registration → Admin Notification → Multi-step Loan Submission → Admin Document Verification & Approval → Monthly EMI Calculation → Customer Active Loan Card

Run tests:
```bash
cd backend
mvn test
```
Result: **14 Tests Run, 0 Failures, 0 Errors, 0 Skipped (100% Passed)**.
