-- ====================================================
-- CUSTOMER LOAN ELIGIBILITY SYSTEM - SEED DATA
-- Target Database: MySQL 8.0+
-- Database Name: customer_loan_system
-- ====================================================

USE customer_loan_system;

-- 1. SEED SYSTEM SETTINGS
INSERT INTO system_settings (setting_key, setting_value, category) VALUES
('SYSTEM_NAME', 'Customer Loan Eligibility System', 'GENERAL'),
('SYSTEM_DESCRIPTION', 'Enterprise Credit & Loan Evaluation Platform', 'GENERAL'),
('DEFAULT_CURRENCY', 'USD', 'FINANCIAL'),
('MAX_LOAN_AMOUNT', '500000', 'FINANCIAL'),
('MIN_LOAN_AMOUNT', '1000', 'FINANCIAL'),
('ENABLE_AUDIT_LOGS', 'true', 'SECURITY'),
('JWT_EXPIRATION_HOURS', '24', 'SECURITY'),
('NOTIFICATION_EMAIL_ENABLED', 'true', 'NOTIFICATION');

-- 2. SEED ACTIVE LOAN ELIGIBILITY RULES
-- Configurable rules used by the Eligibility Evaluation Engine
INSERT INTO loan_rules (rule_name, rule_description, rule_value, active_status) VALUES
('MIN_AGE_YEARS', 'Applicant must be at least 21 years of age', '21', TRUE),
('MAX_AGE_YEARS', 'Applicant must not exceed 65 years of age at maturity', '65', TRUE),
('MIN_MONTHLY_INCOME', 'Minimum required verifiable monthly income', '2500.00', TRUE),
('MAX_DEBT_TO_INCOME_RATIO', 'Maximum allowable Debt-to-Income (DTI) ratio percentage', '50.00', TRUE),
('MIN_CREDIT_CATEGORY', 'Minimum allowable credit tier (FAIR, GOOD, EXCELLENT)', 'FAIR', TRUE),
('MAX_LOAN_AMOUNT_SALARIED', 'Maximum loan multiplier against annual income for salaried applicants', '10.0', TRUE),
('MIN_EMPLOYMENT_STABILITY', 'Applicant must have declared verified employment type', 'Salaried,Self-Employed,Business,Professional', TRUE),
('REQUIRED_DOCUMENTS_COUNT', 'Minimum number of verified documents for approval', '2', TRUE);

-- 3. SEED USERS
-- All passwords hashed with BCrypt for '123456789':
-- $2a$10$e886Q0K4z4p9F.jRz83z2Oq1HwFomQZqO8z7W2o6eZ4mZ4l/b9Siu
INSERT INTO users (user_id, name, email, password_hash, role, status) VALUES
(1, 'Syed Moulali', 'syedmoulali318@gmail.com', '$2a$10$e886Q0K4z4p9F.jRz83z2Oq1HwFomQZqO8z7W2o6eZ4mZ4l/b9Siu', 'ADMINISTRATOR', 'ACTIVE'),
(2, 'Sarah Jenkins', 'staff@loaneligibility.com', '$2a$10$e886Q0K4z4p9F.jRz83z2Oq1HwFomQZqO8z7W2o6eZ4mZ4l/b9Siu', 'STAFF', 'ACTIVE'),
(3, 'Michael Chang', 'manager@loaneligibility.com', '$2a$10$e886Q0K4z4p9F.jRz83z2Oq1HwFomQZqO8z7W2o6eZ4mZ4l/b9Siu', 'REVIEWER', 'ACTIVE'),
(4, 'John Doe', 'customer@example.com', '$2a$10$e886Q0K4z4p9F.jRz83z2Oq1HwFomQZqO8z7W2o6eZ4mZ4l/b9Siu', 'CUSTOMER', 'ACTIVE'),
(5, 'Emily Watson', 'emily.watson@example.com', '$2a$10$e886Q0K4z4p9F.jRz83z2Oq1HwFomQZqO8z7W2o6eZ4mZ4l/b9Siu', 'CUSTOMER', 'ACTIVE'),
(6, 'David Miller', 'david.miller@example.com', '$2a$10$e886Q0K4z4p9F.jRz83z2Oq1HwFomQZqO8z7W2o6eZ4mZ4l/b9Siu', 'CUSTOMER', 'ACTIVE'),
(7, 'Priya Sharma', 'priya.sharma@example.com', '$2a$10$e886Q0K4z4p9F.jRz83z2Oq1HwFomQZqO8z7W2o6eZ4mZ4l/b9Siu', 'CUSTOMER', 'ACTIVE'),
(8, 'Carlos Rodriguez', 'carlos.rodriguez@example.com', '$2a$10$e886Q0K4z4p9F.jRz83z2Oq1HwFomQZqO8z7W2o6eZ4mZ4l/b9Siu', 'CUSTOMER', 'ACTIVE');

-- 4. SEED CUSTOMERS
INSERT INTO customers (customer_id, user_id, name, date_of_birth, gender, phone, email, address, employment_type) VALUES
(1, 4, 'John Doe', '1990-05-15', 'Male', '+1-555-0101', 'customer@example.com', '742 Evergreen Terrace, Springfield, IL', 'Salaried'),
(2, 5, 'Emily Watson', '1988-11-23', 'Female', '+1-555-0102', 'emily.watson@example.com', '124 Conch Street, Pacific Grove, CA', 'Self-Employed'),
(3, 6, 'David Miller', '1995-02-10', 'Male', '+1-555-0103', 'david.miller@example.com', '432 Park Avenue, New York, NY', 'Salaried'),
(4, 7, 'Priya Sharma', '1992-08-30', 'Female', '+1-555-0104', 'priya.sharma@example.com', '888 Grand Central, Austin, TX', 'Professional'),
(5, 8, 'Carlos Rodriguez', '2005-09-01', 'Male', '+1-555-0105', 'carlos.rodriguez@example.com', '120 Ocean Drive, Miami, FL', 'Student');

-- 5. SEED FINANCIAL DETAILS
INSERT INTO financial_details (financial_id, customer_id, monthly_income, monthly_expenses, existing_obligations, credit_information) VALUES
(1, 1, 6500.00, 2200.00, 600.00, 'EXCELLENT'),
(2, 2, 8500.00, 3100.00, 1200.00, 'GOOD'),
(3, 3, 3200.00, 1800.00, 900.00, 'FAIR'),
(4, 4, 11000.00, 3500.00, 1500.00, 'EXCELLENT'),
(5, 5, 1200.00, 950.00, 400.00, 'POOR');

-- 6. SEED LOAN APPLICATIONS
INSERT INTO loan_applications (application_id, customer_id, loan_type, requested_amount, tenure, application_date, status, remarks) VALUES
(1, 1, 'Home Loan', 250000.00, 240, '2026-10-15', 'ELIGIBLE', 'Strong financial profile, high credit score, low DTI.'),
(2, 1, 'Personal Loan', 15000.00, 36, '2026-11-01', 'APPROVED', 'Verification completed and loan disbursed.'),
(3, 2, 'Vehicle Loan', 45000.00, 60, '2026-11-05', 'ELIGIBLE', 'Approved based on stable business revenue and good credit.'),
(4, 3, 'Personal Loan', 25000.00, 48, '2026-11-10', 'REQUIRES_REVIEW', 'High debt-to-income ratio (DTI near 50%). Additional verification required.'),
(5, 4, 'Home Loan', 450000.00, 300, '2026-11-12', 'ELIGIBLE', 'High income earner with zero default history.'),
(6, 5, 'Education Loan', 35000.00, 60, '2026-11-14', 'NOT_ELIGIBLE', 'Applicant income is below minimum threshold and credit tier is POOR.'),
(7, 1, 'Personal Loan', 10000.00, 24, '2026-11-18', 'UNDER_VERIFICATION', 'Awaiting document verification by loan officer.'),
(8, 2, 'Personal Loan', 20000.00, 36, '2026-11-19', 'SUBMITTED', 'Fresh application submitted by customer.');

-- 7. SEED DOCUMENTS
INSERT INTO documents (document_id, application_id, document_type, file_name, file_type, file_path, submission_status, verification_status, remarks, submitted_at, verified_at) VALUES
(1, 1, 'Identity Proof', 'passport_john_doe.pdf', 'application/pdf', '/uploads/passport_john_doe.pdf', 'SUBMITTED', 'VERIFIED', 'Government ID verified successfully', '2026-10-15 10:30:00', '2026-10-16 11:20:00'),
(2, 1, 'Income Proof', 'paystub_oct_john_doe.pdf', 'application/pdf', '/uploads/paystub_oct_john_doe.pdf', 'SUBMITTED', 'VERIFIED', 'Salary slips for 3 months matched bank statement', '2026-10-15 10:32:00', '2026-10-16 11:22:00'),
(3, 1, 'Bank Statement', 'bank_statement_q3.pdf', 'application/pdf', '/uploads/bank_statement_q3.pdf', 'SUBMITTED', 'VERIFIED', 'Average monthly balance > $12,000', '2026-10-15 10:35:00', '2026-10-16 11:25:00'),
(4, 3, 'Identity Proof', 'driving_license_emily.pdf', 'application/pdf', '/uploads/driving_license_emily.pdf', 'SUBMITTED', 'VERIFIED', 'Verified against DMV database', '2026-11-05 14:10:00', '2026-11-06 09:30:00'),
(5, 3, 'Tax Return', 'tax_return_2025_emily.pdf', 'application/pdf', '/uploads/tax_return_2025_emily.pdf', 'SUBMITTED', 'VERIFIED', 'Audited returns verified', '2026-11-05 14:15:00', '2026-11-06 09:35:00'),
(6, 4, 'Income Proof', 'david_salary_slip.pdf', 'application/pdf', '/uploads/david_salary_slip.pdf', 'SUBMITTED', 'PENDING', 'Awaiting HR verification confirmation', '2026-11-10 16:00:00', NULL),
(7, 6, 'Identity Proof', 'student_id_carlos.pdf', 'application/pdf', '/uploads/student_id_carlos.pdf', 'SUBMITTED', 'VERIFIED', 'Student ID verified', '2026-11-14 11:00:00', '2026-11-14 12:00:00'),
(8, 7, 'Address Proof', 'utility_bill_john.pdf', 'application/pdf', '/uploads/utility_bill_john.pdf', 'SUBMITTED', 'PENDING', 'Under staff verification queue', '2026-11-18 15:45:00', NULL);

-- 8. SEED ELIGIBILITY RESULTS
INSERT INTO eligibility_results (result_id, application_id, eligibility_status, eligibility_score, indicators, reason, evaluation_date) VALUES
(1, 1, 'ELIGIBLE', 92.50, '{"ageValid":true,"incomeValid":true,"dtiRatio":18.46,"creditTier":"EXCELLENT","docsVerified":3}', 'Applicant satisfies all active loan eligibility criteria with excellent credit profile and low debt ratio.', '2026-10-16 12:00:00'),
(2, 2, 'ELIGIBLE', 95.00, '{"ageValid":true,"incomeValid":true,"dtiRatio":15.00,"creditTier":"EXCELLENT","docsVerified":3}', 'Low requested amount against high disposable monthly income.', '2026-11-02 09:15:00'),
(3, 3, 'ELIGIBLE', 84.00, '{"ageValid":true,"incomeValid":true,"dtiRatio":28.24,"creditTier":"GOOD","docsVerified":2}', 'Self-employed profile satisfies income threshold and credit parameters.', '2026-11-06 10:45:00'),
(4, 4, 'REQUIRES_REVIEW', 62.00, '{"ageValid":true,"incomeValid":true,"dtiRatio":48.50,"creditTier":"FAIR","docsVerified":1}', 'Debt-to-Income ratio (48.50%) is near maximum threshold (50.00%). Senior underwriter review required.', '2026-11-10 17:30:00'),
(5, 5, 'ELIGIBLE', 96.00, '{"ageValid":true,"incomeValid":true,"dtiRatio":22.73,"creditTier":"EXCELLENT","docsVerified":2}', 'High net worth professional with outstanding credit history.', '2026-11-12 11:00:00'),
(6, 6, 'NOT_ELIGIBLE', 28.00, '{"ageValid":false,"incomeValid":false,"dtiRatio":79.17,"creditTier":"POOR","docsVerified":1}', 'Applicant income ($1,200.00) is below minimum rule ($2,500.00) and credit tier is POOR.', '2026-11-14 13:00:00');

-- 9. SEED AUDIT LOGS
INSERT INTO audit_logs (audit_id, user_id, action, entity_type, entity_id, description, timestamp) VALUES
(1, 1, 'USER_LOGIN', 'USER', '1', 'Administrator Syed Moulali logged into management console', '2026-11-20 08:30:00'),
(2, 1, 'UPDATE_RULE', 'LOAN_RULE', '4', 'Updated MAX_DEBT_TO_INCOME_RATIO to 50.00%', '2026-11-20 08:45:00'),
(3, 4, 'CREATE_APPLICATION', 'LOAN_APPLICATION', '8', 'Customer John Doe created loan application #8 for $20,000.00', '2026-11-19 16:30:00'),
(4, 2, 'VERIFY_DOCUMENT', 'DOCUMENT', '5', 'Staff Sarah Jenkins verified tax return document for application #3', '2026-11-06 09:35:00'),
(5, 3, 'RECORD_DECISION', 'LOAN_APPLICATION', '2', 'Reviewer Michael Chang recorded APPROVED decision for application #2', '2026-11-02 10:00:00'),
(6, 2, 'EVALUATE_APPLICATION', 'LOAN_APPLICATION', '4', 'Eligibility engine evaluated application #4 -> Result: REQUIRES_REVIEW (Score: 62.00%)', '2026-11-10 17:30:00');
