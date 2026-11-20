# Testing Guide & Verification Suite
## Customer Loan Eligibility System

### 1. Test Suite Summary
The backend includes a comprehensive automated Spring Boot integration test suite in `src/test/java/com/loaneligibility/LoanEligibilityApplicationTests.java`.

Execution command:
```bash
cd backend
mvn test
```

### 2. Test Cases Specification (TC01 - TC08)

| Test ID | Test Scenario | Input / Conditions | Expected Outcome | Verification Status |
| :--- | :--- | :--- | :--- | :---: |
| **TC01** | Valid Registration | Unique email, password, customer details | Status 200, JWT token returned, customer profile created | **PASSED** |
| **TC02** | Duplicate Email Rejection | Pre-existing email `syedmoulali318@gmail.com` | ConflictException thrown, registration rejected | **PASSED** |
| **TC03** | Invalid Numeric Financial Value | Negative requested loan amount (-$5,000) | Validation rule triggered, rejected | **PASSED** |
| **TC04** | Complete Application Evaluation | Application #1 with high income and verified documents | Engine returns `ELIGIBLE`, Score >= 75%, reason logged | **PASSED** |
| **TC05** | Ineligible Income Evaluation | Application #6 with income below rule threshold ($1,200 < $2,500) | Engine returns `NOT_ELIGIBLE`, Score < 50% | **PASSED** |
| **TC06** | Search Application by ID | Query Application #1 | Successfully returns matching loan application record | **PASSED** |
| **TC07** | Update Application Status | Change status to `APPROVED` with underwriter remarks | Status updated in database and audit logged | **PASSED** |
| **TC08** | Generate Application Report | Query report summary API | Returns aggregate metrics and valid application counts | **PASSED** |
