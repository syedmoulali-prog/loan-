-- ====================================================
-- CUSTOMER LOAN ELIGIBILITY SYSTEM - DATABASE SCHEMA
-- Target Database: MySQL 8.0+
-- Database Name: customer_loan_system
-- ====================================================

CREATE DATABASE IF NOT EXISTS customer_loan_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE customer_loan_system;

-- Drop tables if existing (in reverse dependency order)
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS system_settings;
DROP TABLE IF EXISTS eligibility_results;
DROP TABLE IF EXISTS documents;
DROP TABLE IF EXISTS loan_applications;
DROP TABLE IF EXISTS financial_details;
DROP TABLE IF EXISTS loan_rules;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS users;

-- 1. USERS TABLE
CREATE TABLE users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- ADMINISTRATOR, STAFF, REVIEWER, CUSTOMER
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE, SUSPENDED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. CUSTOMERS TABLE
CREATE TABLE customers (
    customer_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNIQUE,
    name VARCHAR(150) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(150) NOT NULL,
    address VARCHAR(255) NOT NULL,
    employment_type VARCHAR(50) NOT NULL, -- Salaried, Self-Employed, Business, Professional, Student, Retired
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_customers_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_customers_email (email),
    INDEX idx_customers_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. FINANCIAL DETAILS TABLE
CREATE TABLE financial_details (
    financial_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    monthly_income DECIMAL(15, 2) NOT NULL,
    monthly_expenses DECIMAL(15, 2) NOT NULL,
    existing_obligations DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    credit_information VARCHAR(100) NOT NULL, -- EXCELLENT (750+), GOOD (700-749), FAIR (650-699), POOR (<650)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_financial_customer FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE,
    INDEX idx_financial_customer (customer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. LOAN APPLICATIONS TABLE
CREATE TABLE loan_applications (
    application_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    loan_type VARCHAR(50) NOT NULL, -- Personal Loan, Home Loan, Education Loan, Vehicle Loan
    requested_amount DECIMAL(15, 2) NOT NULL,
    tenure INT NOT NULL, -- Duration in months
    application_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT', 
    -- DRAFT, SUBMITTED, UNDER_VERIFICATION, UNDER_REVIEW, ELIGIBLE, NOT_ELIGIBLE, REQUIRES_REVIEW, APPROVED, COMPLETED, REJECTED
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_application_customer FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE,
    INDEX idx_application_customer (customer_id),
    INDEX idx_application_status (status),
    INDEX idx_application_date (application_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. DOCUMENTS TABLE
CREATE TABLE documents (
    document_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT NOT NULL,
    document_type VARCHAR(100) NOT NULL, -- Identity Proof, Address Proof, Income Proof, Bank Statement, Tax Return, Property Document
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),
    file_path VARCHAR(500),
    submission_status VARCHAR(50) NOT NULL DEFAULT 'SUBMITTED', -- PENDING, SUBMITTED
    verification_status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING, VERIFIED, REJECTED
    remarks VARCHAR(255),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP NULL,
    CONSTRAINT fk_documents_application FOREIGN KEY (application_id) REFERENCES loan_applications(application_id) ON DELETE CASCADE,
    INDEX idx_documents_app (application_id),
    INDEX idx_documents_status (verification_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. ELIGIBILITY RESULTS TABLE
CREATE TABLE eligibility_results (
    result_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT NOT NULL UNIQUE,
    eligibility_status VARCHAR(50) NOT NULL, -- ELIGIBLE, NOT_ELIGIBLE, REQUIRES_REVIEW
    eligibility_score DECIMAL(5, 2) NOT NULL, -- Score from 0.00 to 100.00
    indicators TEXT, -- JSON or serialized indicators evaluated
    reason TEXT NOT NULL,
    evaluation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_result_application FOREIGN KEY (application_id) REFERENCES loan_applications(application_id) ON DELETE CASCADE,
    INDEX idx_result_app (application_id),
    INDEX idx_result_status (eligibility_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. LOAN RULES TABLE (Configurable by Administrator)
CREATE TABLE loan_rules (
    rule_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    rule_name VARCHAR(100) NOT NULL UNIQUE,
    rule_description VARCHAR(255) NOT NULL,
    rule_value VARCHAR(100) NOT NULL, -- Stored as numeric threshold or expression string
    active_status BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_rules_active (active_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. AUDIT LOGS TABLE
CREATE TABLE audit_logs (
    audit_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100),
    description TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_audit_user (user_id),
    INDEX idx_audit_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. SYSTEM SETTINGS TABLE
CREATE TABLE system_settings (
    setting_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. NOTIFICATIONS TABLE
CREATE TABLE notifications (
    notification_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NULL,
    recipient_role VARCHAR(50) NULL, -- ADMINISTRATOR, STAFF, REVIEWER, CUSTOMER
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    related_entity_type VARCHAR(50) NULL,
    related_entity_id VARCHAR(100) NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_notifications_user (user_id),
    INDEX idx_notifications_role (recipient_role),
    INDEX idx_notifications_read (is_read),
    INDEX idx_notifications_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. LOAN REPAYMENTS TABLE (EMI & INSTALLMENTS)
CREATE TABLE loan_repayments (
    repayment_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT UNIQUE NOT NULL,
    approved_amount DECIMAL(15,2) NOT NULL,
    interest_rate DECIMAL(5,2) NOT NULL,
    tenure_months INT NOT NULL,
    monthly_payment DECIMAL(15,2) NOT NULL,
    total_payable DECIMAL(15,2) NOT NULL,
    remaining_balance DECIMAL(15,2) NOT NULL,
    payments_completed INT NOT NULL DEFAULT 0,
    next_payment_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_repayments_application FOREIGN KEY (application_id) REFERENCES loan_applications(application_id) ON DELETE CASCADE,
    INDEX idx_repayments_app (application_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
