package com.loaneligibility.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.loaneligibility.entity.*;
import com.loaneligibility.repository.*;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class BackupService {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final LoanApplicationRepository loanApplicationRepository;
    private final FinancialDetailsRepository financialDetailsRepository;
    private final LoanRuleRepository loanRuleRepository;
    private final DocumentRepository documentRepository;
    private final LoanRepaymentRepository loanRepaymentRepository;
    private final NotificationRepository notificationRepository;
    private final AuditLogRepository auditLogRepository;
    private final SystemSettingsRepository systemSettingsRepository;
    private final ObjectMapper objectMapper;
    private final Path backupDirectory;

    public BackupService(UserRepository userRepository,
                         CustomerRepository customerRepository,
                         LoanApplicationRepository loanApplicationRepository,
                         FinancialDetailsRepository financialDetailsRepository,
                         LoanRuleRepository loanRuleRepository,
                         DocumentRepository documentRepository,
                         LoanRepaymentRepository loanRepaymentRepository,
                         NotificationRepository notificationRepository,
                         AuditLogRepository auditLogRepository,
                         SystemSettingsRepository systemSettingsRepository) {
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
        this.loanApplicationRepository = loanApplicationRepository;
        this.financialDetailsRepository = financialDetailsRepository;
        this.loanRuleRepository = loanRuleRepository;
        this.documentRepository = documentRepository;
        this.loanRepaymentRepository = loanRepaymentRepository;
        this.notificationRepository = notificationRepository;
        this.auditLogRepository = auditLogRepository;
        this.systemSettingsRepository = systemSettingsRepository;

        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
        this.objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        this.backupDirectory = Paths.get("./data/backups").toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.backupDirectory);
        } catch (IOException ignored) {}
    }

    public Map<String, Object> getBackupStatus() {
        Map<String, Object> statusMap = new LinkedHashMap<>();
        statusMap.put("status", "HEALTHY");
        statusMap.put("databaseType", "H2 / MySQL Compatible");
        statusMap.put("storagePath", "./data/customer_loan_system.mv.db");

        File dbFile = new File("./data/customer_loan_system.mv.db");
        long dbSizeBytes = dbFile.exists() ? dbFile.length() : 0L;
        statusMap.put("dbSizeBytes", dbSizeBytes);
        statusMap.put("dbSizeFormatted", String.format("%.2f KB", dbSizeBytes / 1024.0));

        Map<String, Long> recordCounts = new LinkedHashMap<>();
        recordCounts.put("users", userRepository.count());
        recordCounts.put("customers", customerRepository.count());
        recordCounts.put("loanApplications", loanApplicationRepository.count());
        recordCounts.put("loanRepayments", loanRepaymentRepository.count());
        recordCounts.put("loanRules", loanRuleRepository.count());
        recordCounts.put("documents", documentRepository.count());
        recordCounts.put("notifications", notificationRepository.count());
        recordCounts.put("financialDetails", financialDetailsRepository.count());
        recordCounts.put("auditLogs", auditLogRepository.count());
        recordCounts.put("systemSettings", systemSettingsRepository.count());
        statusMap.put("recordCounts", recordCounts);

        File[] backupFiles = backupDirectory.toFile().listFiles((dir, name) -> name.endsWith(".json"));
        List<Map<String, Object>> backupsList = new ArrayList<>();
        if (backupFiles != null) {
            Arrays.sort(backupFiles, Comparator.comparingLong(File::lastModified).reversed());
            for (File bf : backupFiles) {
                Map<String, Object> item = new LinkedHashMap<>();
                item.put("filename", bf.getName());
                item.put("sizeBytes", bf.length());
                item.put("sizeFormatted", String.format("%.2f KB", bf.length() / 1024.0));
                item.put("lastModified", new Date(bf.lastModified()));
                backupsList.add(item);
            }
        }
        statusMap.put("backupCount", backupsList.size());
        statusMap.put("backups", backupsList);

        return statusMap;
    }

    public byte[] createBackupData() throws IOException {
        Map<String, Object> backup = new LinkedHashMap<>();
        backup.put("system", "CUSTOMER LOAN ELIGIBILITY SYSTEM");
        backup.put("version", "1.0.0");
        backup.put("createdAt", LocalDateTime.now());

        // Users
        List<Map<String, Object>> usersList = new ArrayList<>();
        for (User u : userRepository.findAll()) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("userId", u.getUserId());
            m.put("name", u.getName());
            m.put("email", u.getEmail());
            m.put("role", u.getRole());
            m.put("status", u.getStatus());
            m.put("createdAt", u.getCreatedAt());
            usersList.add(m);
        }
        backup.put("users", usersList);

        // Customers
        List<Map<String, Object>> customersList = new ArrayList<>();
        for (Customer c : customerRepository.findAll()) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("customerId", c.getCustomerId());
            m.put("name", c.getName());
            m.put("email", c.getEmail());
            m.put("phone", c.getPhone());
            m.put("dateOfBirth", c.getDateOfBirth());
            m.put("gender", c.getGender());
            m.put("address", c.getAddress());
            m.put("employmentType", c.getEmploymentType());
            m.put("createdAt", c.getCreatedAt());
            customersList.add(m);
        }
        backup.put("customers", customersList);

        // Applications
        List<Map<String, Object>> appsList = new ArrayList<>();
        for (LoanApplication a : loanApplicationRepository.findAll()) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("applicationId", a.getApplicationId());
            m.put("customerId", a.getCustomer() != null ? a.getCustomer().getCustomerId() : null);
            m.put("loanType", a.getLoanType());
            m.put("requestedAmount", a.getRequestedAmount());
            m.put("tenure", a.getTenure());
            m.put("status", a.getStatus());
            m.put("applicationDate", a.getApplicationDate());
            m.put("remarks", a.getRemarks());
            m.put("createdAt", a.getCreatedAt());
            appsList.add(m);
        }
        backup.put("loanApplications", appsList);

        // Repayments
        List<Map<String, Object>> repaymentsList = new ArrayList<>();
        for (LoanRepayment r : loanRepaymentRepository.findAll()) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("repaymentId", r.getRepaymentId());
            m.put("applicationId", r.getApplication() != null ? r.getApplication().getApplicationId() : null);
            m.put("approvedAmount", r.getApprovedAmount());
            m.put("interestRate", r.getInterestRate());
            m.put("tenureMonths", r.getTenureMonths());
            m.put("monthlyPayment", r.getMonthlyPayment());
            m.put("totalPayable", r.getTotalPayable());
            m.put("remainingBalance", r.getRemainingBalance());
            m.put("paymentsCompleted", r.getPaymentsCompleted());
            m.put("nextPaymentDate", r.getNextPaymentDate());
            m.put("createdAt", r.getCreatedAt());
            repaymentsList.add(m);
        }
        backup.put("loanRepayments", repaymentsList);

        // Loan Rules
        backup.put("loanRules", loanRuleRepository.findAll());

        // Notifications
        List<Map<String, Object>> notifsList = new ArrayList<>();
        for (Notification n : notificationRepository.findAll()) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("notificationId", n.getNotificationId());
            m.put("recipientRole", n.getRecipientRole());
            m.put("title", n.getTitle());
            m.put("message", n.getMessage());
            m.put("notificationType", n.getNotificationType());
            m.put("isRead", n.getIsRead());
            m.put("createdAt", n.getCreatedAt());
            notifsList.add(m);
        }
        backup.put("notifications", notifsList);

        // Financial Details
        backup.put("financialDetails", financialDetailsRepository.findAll());

        // Audit Logs
        backup.put("auditLogs", auditLogRepository.findAll());

        // System Settings
        backup.put("systemSettings", systemSettingsRepository.findAll());

        byte[] jsonBytes = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsBytes(backup);

        String filename = "loan_system_backup_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".json";
        Path targetPath = backupDirectory.resolve(filename);
        Files.write(targetPath, jsonBytes);

        return jsonBytes;
    }
}
