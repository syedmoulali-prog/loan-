package com.loaneligibility.service;

import com.loaneligibility.entity.*;
import com.loaneligibility.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class DataSeederService implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeederService.class);

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final FinancialDetailsRepository financialDetailsRepository;
    private final LoanApplicationRepository loanApplicationRepository;
    private final DocumentRepository documentRepository;
    private final EligibilityResultRepository eligibilityResultRepository;
    private final LoanRuleRepository loanRuleRepository;
    private final AuditLogRepository auditLogRepository;
    private final SystemSettingsRepository settingsRepository;
    private final NotificationRepository notificationRepository;
    private final LoanRepaymentRepository repaymentRepository;
    private final LoanRepaymentService repaymentService;
    private final PasswordEncoder passwordEncoder;

    public DataSeederService(UserRepository userRepository,
                             CustomerRepository customerRepository,
                             FinancialDetailsRepository financialDetailsRepository,
                             LoanApplicationRepository loanApplicationRepository,
                             DocumentRepository documentRepository,
                             EligibilityResultRepository eligibilityResultRepository,
                             LoanRuleRepository loanRuleRepository,
                             AuditLogRepository auditLogRepository,
                             SystemSettingsRepository settingsRepository,
                             NotificationRepository notificationRepository,
                             LoanRepaymentRepository repaymentRepository,
                             LoanRepaymentService repaymentService,
                             PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
        this.financialDetailsRepository = financialDetailsRepository;
        this.loanApplicationRepository = loanApplicationRepository;
        this.documentRepository = documentRepository;
        this.eligibilityResultRepository = eligibilityResultRepository;
        this.loanRuleRepository = loanRuleRepository;
        this.auditLogRepository = auditLogRepository;
        this.settingsRepository = settingsRepository;
        this.notificationRepository = notificationRepository;
        this.repaymentRepository = repaymentRepository;
        this.repaymentService = repaymentService;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Checking initial system database seeding...");

        // 1. Seed System Settings
        if (settingsRepository.count() == 0) {
            settingsRepository.saveAll(List.of(
                    new SystemSettings("SYSTEM_NAME", "Customer Loan Eligibility System", "GENERAL"),
                    new SystemSettings("SYSTEM_DESCRIPTION", "Enterprise Credit & Loan Evaluation Platform", "GENERAL"),
                    new SystemSettings("DEFAULT_CURRENCY", "USD", "FINANCIAL"),
                    new SystemSettings("MAX_LOAN_AMOUNT", "500000", "FINANCIAL"),
                    new SystemSettings("MIN_LOAN_AMOUNT", "1000", "FINANCIAL"),
                    new SystemSettings("ENABLE_AUDIT_LOGS", "true", "SECURITY"),
                    new SystemSettings("JWT_EXPIRATION_HOURS", "24", "SECURITY"),
                    new SystemSettings("NOTIFICATION_EMAIL_ENABLED", "true", "NOTIFICATION")
            ));
            log.info("System settings seeded.");
        }

        // 2. Seed Active Loan Rules
        if (loanRuleRepository.count() == 0) {
            loanRuleRepository.saveAll(List.of(
                    new LoanRule("MIN_AGE_YEARS", "Applicant must be at least 21 years of age", "21", true),
                    new LoanRule("MAX_AGE_YEARS", "Applicant must not exceed 65 years of age", "65", true),
                    new LoanRule("MIN_MONTHLY_INCOME", "Minimum required verifiable monthly income", "2500.00", true),
                    new LoanRule("MAX_DEBT_TO_INCOME_RATIO", "Maximum allowable Debt-to-Income (DTI) ratio percentage", "50.00", true),
                    new LoanRule("MIN_CREDIT_CATEGORY", "Minimum allowable credit tier (FAIR, GOOD, EXCELLENT)", "FAIR", true),
                    new LoanRule("MIN_EMPLOYMENT_STABILITY", "Applicant must have declared verified employment type", "Salaried,Self-Employed,Business,Professional", true),
                    new LoanRule("REQUIRED_DOCUMENTS_COUNT", "Minimum number of verified documents for approval", "2", true)
            ));
            log.info("Active loan rules seeded.");
        }

        // 3. Seed Users & Demo Accounts
        if (userRepository.count() == 0) {
            String defaultHash = passwordEncoder.encode("123456789");

            // Required Demo Administrator
            User admin = new User(null, "Syed Moulali", "syedmoulali318@gmail.com", defaultHash, "ADMINISTRATOR", "ACTIVE");
            User staff = new User(null, "Sarah Jenkins", "staff@loaneligibility.com", defaultHash, "STAFF", "ACTIVE");
            User reviewer = new User(null, "Michael Chang", "manager@loaneligibility.com", defaultHash, "REVIEWER", "ACTIVE");
            User customerUser1 = new User(null, "John Doe", "customer@example.com", defaultHash, "CUSTOMER", "ACTIVE");
            User customerUser2 = new User(null, "Emily Watson", "emily.watson@example.com", defaultHash, "CUSTOMER", "ACTIVE");
            User customerUser3 = new User(null, "David Miller", "david.miller@example.com", defaultHash, "CUSTOMER", "ACTIVE");
            User customerUser4 = new User(null, "Priya Sharma", "priya.sharma@example.com", defaultHash, "CUSTOMER", "ACTIVE");
            User customerUser5 = new User(null, "Carlos Rodriguez", "carlos.rodriguez@example.com", defaultHash, "CUSTOMER", "ACTIVE");

            userRepository.saveAll(List.of(admin, staff, reviewer, customerUser1, customerUser2, customerUser3, customerUser4, customerUser5));
            log.info("Demo users seeded.");

            // 4. Seed Customers
            Customer c1 = createCustomer(customerUser1, "John Doe", LocalDate.of(1990, 5, 15), "Male", "+1-555-0101", "customer@example.com", "742 Evergreen Terrace, Springfield, IL", "Salaried");
            Customer c2 = createCustomer(customerUser2, "Emily Watson", LocalDate.of(1988, 11, 23), "Female", "+1-555-0102", "emily.watson@example.com", "124 Conch Street, Pacific Grove, CA", "Self-Employed");
            Customer c3 = createCustomer(customerUser3, "David Miller", LocalDate.of(1995, 2, 10), "Male", "+1-555-0103", "david.miller@example.com", "432 Park Avenue, New York, NY", "Salaried");
            Customer c4 = createCustomer(customerUser4, "Priya Sharma", LocalDate.of(1992, 8, 30), "Female", "+1-555-0104", "priya.sharma@example.com", "888 Grand Central, Austin, TX", "Professional");
            Customer c5 = createCustomer(customerUser5, "Carlos Rodriguez", LocalDate.of(2005, 9, 1), "Male", "+1-555-0105", "carlos.rodriguez@example.com", "120 Ocean Drive, Miami, FL", "Student");

            customerRepository.saveAll(List.of(c1, c2, c3, c4, c5));
            log.info("Demo customers seeded.");

            // 5. Seed Financial Details
            FinancialDetails f1 = createFinancial(c1, new BigDecimal("6500.00"), new BigDecimal("2200.00"), new BigDecimal("600.00"), "EXCELLENT");
            FinancialDetails f2 = createFinancial(c2, new BigDecimal("8500.00"), new BigDecimal("3100.00"), new BigDecimal("1200.00"), "GOOD");
            FinancialDetails f3 = createFinancial(c3, new BigDecimal("3200.00"), new BigDecimal("1800.00"), new BigDecimal("900.00"), "FAIR");
            FinancialDetails f4 = createFinancial(c4, new BigDecimal("11000.00"), new BigDecimal("3500.00"), new BigDecimal("1500.00"), "EXCELLENT");
            FinancialDetails f5 = createFinancial(c5, new BigDecimal("1200.00"), new BigDecimal("950.00"), new BigDecimal("400.00"), "POOR");

            financialDetailsRepository.saveAll(List.of(f1, f2, f3, f4, f5));

            // 6. Seed Loan Applications
            LoanApplication a1 = createApplication(c1, "Home Loan", new BigDecimal("250000.00"), 240, LocalDate.now().minusDays(30), "ELIGIBLE", "Strong financial profile, high credit score, low DTI.");
            LoanApplication a2 = createApplication(c1, "Personal Loan", new BigDecimal("15000.00"), 36, LocalDate.now().minusDays(18), "APPROVED", "Verification completed and loan approved.");
            LoanApplication a3 = createApplication(c2, "Vehicle Loan", new BigDecimal("45000.00"), 60, LocalDate.now().minusDays(14), "ELIGIBLE", "Approved based on stable business revenue and good credit.");
            LoanApplication a4 = createApplication(c3, "Personal Loan", new BigDecimal("25000.00"), 48, LocalDate.now().minusDays(10), "REQUIRES_REVIEW", "High debt-to-income ratio (DTI near 50%). Additional verification required.");
            LoanApplication a5 = createApplication(c4, "Home Loan", new BigDecimal("450000.00"), 300, LocalDate.now().minusDays(7), "ELIGIBLE", "High income earner with zero default history.");
            LoanApplication a6 = createApplication(c5, "Education Loan", new BigDecimal("35000.00"), 60, LocalDate.now().minusDays(5), "NOT_ELIGIBLE", "Applicant income is below minimum threshold and credit tier is POOR.");
            LoanApplication a7 = createApplication(c1, "Personal Loan", new BigDecimal("10000.00"), 24, LocalDate.now().minusDays(2), "UNDER_VERIFICATION", "Awaiting document verification by loan officer.");
            LoanApplication a8 = createApplication(c2, "Personal Loan", new BigDecimal("20000.00"), 36, LocalDate.now().minusDays(1), "SUBMITTED", "Fresh application submitted by customer.");

            loanApplicationRepository.saveAll(List.of(a1, a2, a3, a4, a5, a6, a7, a8));
            log.info("Demo loan applications seeded.");

            // 7. Seed Documents
            Document d1 = createDocument(a1, "Identity Proof", "passport_john_doe.pdf", "VERIFIED");
            Document d2 = createDocument(a1, "Income Proof", "paystub_oct_john_doe.pdf", "VERIFIED");
            Document d3 = createDocument(a1, "Bank Statement", "bank_statement_q3.pdf", "VERIFIED");
            Document d4 = createDocument(a3, "Identity Proof", "driving_license_emily.pdf", "VERIFIED");
            Document d5 = createDocument(a3, "Tax Return", "tax_return_2025_emily.pdf", "VERIFIED");
            Document d6 = createDocument(a4, "Income Proof", "david_salary_slip.pdf", "PENDING");
            Document d7 = createDocument(a6, "Identity Proof", "student_id_carlos.pdf", "VERIFIED");
            Document d8 = createDocument(a7, "Address Proof", "utility_bill_john.pdf", "PENDING");

            documentRepository.saveAll(List.of(d1, d2, d3, d4, d5, d6, d7, d8));

            // 8. Seed Eligibility Results
            EligibilityResult r1 = createResult(a1, "ELIGIBLE", new BigDecimal("92.50"), "Applicant satisfies all active loan eligibility criteria with excellent credit profile and low debt ratio.");
            EligibilityResult r2 = createResult(a2, "ELIGIBLE", new BigDecimal("95.00"), "Low requested amount against high disposable monthly income.");
            EligibilityResult r3 = createResult(a3, "ELIGIBLE", new BigDecimal("84.00"), "Self-employed profile satisfies income threshold and credit parameters.");
            EligibilityResult r4 = createResult(a4, "REQUIRES_REVIEW", new BigDecimal("62.00"), "Debt-to-Income ratio is near maximum threshold. Underwriter manual review required.");
            EligibilityResult r5 = createResult(a5, "ELIGIBLE", new BigDecimal("96.00"), "High net worth professional with outstanding credit history.");
            EligibilityResult r6 = createResult(a6, "NOT_ELIGIBLE", new BigDecimal("28.00"), "Applicant income ($1,200.00) is below minimum rule ($2,500.00) and credit tier is POOR.");

            eligibilityResultRepository.saveAll(List.of(r1, r2, r3, r4, r5, r6));

            // 9. Seed Audit Logs
            auditLogRepository.saveAll(List.of(
                    new AuditLog(admin.getUserId(), "USER_LOGIN", "USER", admin.getUserId().toString(), "Administrator Syed Moulali logged into management console"),
                    new AuditLog(admin.getUserId(), "UPDATE_RULE", "LOAN_RULE", "4", "Updated MAX_DEBT_TO_INCOME_RATIO to 50.00%"),
                    new AuditLog(customerUser1.getUserId(), "CREATE_APPLICATION", "LOAN_APPLICATION", a8.getApplicationId().toString(), "Customer John Doe created loan application for $20,000.00"),
                    new AuditLog(staff.getUserId(), "VERIFY_DOCUMENT", "DOCUMENT", d5.getDocumentId().toString(), "Staff Sarah Jenkins verified tax return document for application #" + a3.getApplicationId()),
                    new AuditLog(reviewer.getUserId(), "RECORD_DECISION", "LOAN_APPLICATION", a2.getApplicationId().toString(), "Reviewer Michael Chang recorded APPROVED decision for application #" + a2.getApplicationId()),
                    new AuditLog(staff.getUserId(), "EVALUATE_APPLICATION", "LOAN_APPLICATION", a4.getApplicationId().toString(), "Eligibility engine evaluated application #" + a4.getApplicationId() + " -> Result: REQUIRES_REVIEW (Score: 62.00%)")
            ));

            log.info("Database seeding complete! Demo admin syedmoulali318@gmail.com is ready.");
        }

        // 10. Seed Initial Repayment Schedule for Approved Applications
        if (repaymentRepository.count() == 0) {
            List<LoanApplication> approvedApps = loanApplicationRepository.findByStatus("APPROVED");
            for (LoanApplication app : approvedApps) {
                repaymentService.calculateAndSaveRepayment(app, BigDecimal.valueOf(10.00));
            }
            log.info("Initial loan repayment schedules seeded.");
        }

        // 11. Seed Administrator & Customer Notifications
        if (notificationRepository.count() == 0) {
            Notification n1 = new Notification();
            n1.setRecipientRole("ADMINISTRATOR");
            n1.setTitle("New customer registered");
            n1.setMessage("Rahul Kumar registered an account.\nEmail: rahul@example.com\nPhone: 9876543210");
            n1.setNotificationType("CUSTOMER_REGISTERED");
            n1.setRelatedEntityType("CUSTOMER");
            n1.setRelatedEntityId("1");
            n1.setIsRead(false);

            Notification n2 = new Notification();
            n2.setRecipientRole("ADMINISTRATOR");
            n2.setTitle("New loan application");
            n2.setMessage("LA-10025 submitted by Rahul Kumar.\nLoan Type: Personal Loan\nRequested Amount: ₹5,00,000\nTenure: 60 months");
            n2.setNotificationType("LOAN_APPLICATION_SUBMITTED");
            n2.setRelatedEntityType("LOAN_APPLICATION");
            n2.setRelatedEntityId("1");
            n2.setIsRead(false);

            Notification n3 = new Notification();
            n3.setRecipientRole("ADMINISTRATOR");
            n3.setTitle("Document verification required");
            n3.setMessage("LA-10025 has documents waiting for verification.");
            n3.setNotificationType("DOCUMENT_VERIFICATION");
            n3.setRelatedEntityType("LOAN_APPLICATION");
            n3.setRelatedEntityId("1");
            n3.setIsRead(false);

            notificationRepository.saveAll(List.of(n1, n2, n3));
            log.info("Initial notifications seeded.");
        }
    }

    private Customer createCustomer(User user, String name, LocalDate dob, String gender, String phone, String email, String address, String emp) {
        Customer c = new Customer();
        c.setUser(user);
        c.setName(name);
        c.setDateOfBirth(dob);
        c.setGender(gender);
        c.setPhone(phone);
        c.setEmail(email);
        c.setAddress(address);
        c.setEmploymentType(emp);
        return c;
    }

    private FinancialDetails createFinancial(Customer customer, BigDecimal income, BigDecimal expenses, BigDecimal obligations, String credit) {
        FinancialDetails f = new FinancialDetails();
        f.setCustomer(customer);
        f.setMonthlyIncome(income);
        f.setMonthlyExpenses(expenses);
        f.setExistingObligations(obligations);
        f.setCreditInformation(credit);
        return f;
    }

    private LoanApplication createApplication(Customer customer, String loanType, BigDecimal amount, int tenure, LocalDate date, String status, String remarks) {
        LoanApplication a = new LoanApplication();
        a.setCustomer(customer);
        a.setLoanType(loanType);
        a.setRequestedAmount(amount);
        a.setTenure(tenure);
        a.setApplicationDate(date);
        a.setStatus(status);
        a.setRemarks(remarks);
        return a;
    }

    private Document createDocument(LoanApplication app, String type, String name, String status) {
        Document d = new Document();
        d.setApplication(app);
        d.setDocumentType(type);
        d.setFileName(name);
        d.setFileType("application/pdf");
        d.setFilePath("/uploads/" + name);
        d.setSubmissionStatus("SUBMITTED");
        d.setVerificationStatus(status);
        d.setSubmittedAt(LocalDateTime.now().minusDays(2));
        if ("VERIFIED".equalsIgnoreCase(status)) {
            d.setVerifiedAt(LocalDateTime.now().minusDays(1));
            d.setRemarks("Document verified");
        }
        return d;
    }

    private EligibilityResult createResult(LoanApplication app, String status, BigDecimal score, String reason) {
        EligibilityResult r = new EligibilityResult();
        r.setApplication(app);
        r.setEligibilityStatus(status);
        r.setEligibilityScore(score);
        r.setReason(reason);
        r.setIndicators("{\"evaluated\":true}");
        r.setEvaluationDate(LocalDateTime.now());
        return r;
    }
}
