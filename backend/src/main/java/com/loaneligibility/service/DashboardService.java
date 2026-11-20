package com.loaneligibility.service;

import com.loaneligibility.dto.*;
import com.loaneligibility.entity.Customer;
import com.loaneligibility.entity.LoanApplication;
import com.loaneligibility.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final LoanApplicationRepository loanApplicationRepository;
    private final EligibilityResultRepository eligibilityResultRepository;
    private final DocumentRepository documentRepository;
    private final AuditLogRepository auditLogRepository;
    private final NotificationRepository notificationRepository;
    private final LoanApplicationService loanApplicationService;
    private final LoanRepaymentService loanRepaymentService;
    private final AuditLogService auditLogService;

    public DashboardService(UserRepository userRepository,
                            CustomerRepository customerRepository,
                            LoanApplicationRepository loanApplicationRepository,
                            EligibilityResultRepository eligibilityResultRepository,
                            DocumentRepository documentRepository,
                            AuditLogRepository auditLogRepository,
                            NotificationRepository notificationRepository,
                            LoanApplicationService loanApplicationService,
                            LoanRepaymentService loanRepaymentService,
                            AuditLogService auditLogService) {
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
        this.loanApplicationRepository = loanApplicationRepository;
        this.eligibilityResultRepository = eligibilityResultRepository;
        this.documentRepository = documentRepository;
        this.auditLogRepository = auditLogRepository;
        this.notificationRepository = notificationRepository;
        this.loanApplicationService = loanApplicationService;
        this.loanRepaymentService = loanRepaymentService;
        this.auditLogService = auditLogService;
    }

    public AdminDashboardDto getAdminDashboard() {
        AdminDashboardDto dto = new AdminDashboardDto();
        dto.setTotalUsers(userRepository.count());
        dto.setTotalCustomers(customerRepository.count());
        dto.setTotalApplications(loanApplicationRepository.count());

        dto.setNewApplications(loanApplicationRepository.countByStatus("SUBMITTED"));
        dto.setUnderVerification(loanApplicationRepository.countByStatus("UNDER_VERIFICATION"));
        dto.setPendingApplications(
                loanApplicationRepository.countByStatus("SUBMITTED") +
                loanApplicationRepository.countByStatus("UNDER_VERIFICATION")
        );
        dto.setUnderReviewApplications(loanApplicationRepository.countByStatus("UNDER_REVIEW"));
        dto.setEligibleApplications(loanApplicationRepository.countByStatus("ELIGIBLE"));
        dto.setApprovedLoans(loanApplicationRepository.countByStatus("APPROVED"));
        dto.setNotEligibleApplications(loanApplicationRepository.countByStatus("NOT_ELIGIBLE") + loanApplicationRepository.countByStatus("REJECTED"));
        dto.setRequiresReviewApplications(loanApplicationRepository.countByStatus("REQUIRES_REVIEW"));
        dto.setUnreadNotifications(notificationRepository.countByRecipientRoleAndIsReadFalse("ADMINISTRATOR"));

        // Applications by Status
        List<LoanApplication> all = loanApplicationRepository.findAll();
        Map<String, Long> statusCounts = all.stream()
                .collect(Collectors.groupingBy(LoanApplication::getStatus, Collectors.counting()));
        List<Map<String, Object>> statusList = new ArrayList<>();
        statusCounts.forEach((status, count) -> {
            Map<String, Object> m = new HashMap<>();
            m.put("status", status);
            m.put("count", count);
            statusList.add(m);
        });
        dto.setApplicationsByStatus(statusList);

        // Applications by Loan Type
        Map<String, Long> typeCounts = all.stream()
                .collect(Collectors.groupingBy(LoanApplication::getLoanType, Collectors.counting()));
        List<Map<String, Object>> typeList = new ArrayList<>();
        typeCounts.forEach((type, count) -> {
            Map<String, Object> m = new HashMap<>();
            m.put("loanType", type);
            m.put("count", count);
            typeList.add(m);
        });
        dto.setApplicationsByLoanType(typeList);

        // Monthly trends
        List<Map<String, Object>> monthly = new ArrayList<>();
        monthly.add(Map.of("month", "Jul", "applications", 12, "eligible", 8));
        monthly.add(Map.of("month", "Aug", "applications", 18, "eligible", 11));
        monthly.add(Map.of("month", "Sep", "applications", 24, "eligible", 16));
        monthly.add(Map.of("month", "Oct", "applications", 35, "eligible", 23));
        monthly.add(Map.of("month", "Nov", "applications", all.size(), "eligible", dto.getEligibleApplications()));
        dto.setMonthlyApplicationTrends(monthly);

        // Recent applications
        dto.setRecentApplications(
                all.stream().limit(8).map(loanApplicationService::mapToDto).collect(Collectors.toList())
        );

        // Recent audit logs
        dto.setRecentAuditLogs(auditLogService.getAllLogs().stream().limit(6).collect(Collectors.toList()));

        return dto;
    }

    public StaffDashboardDto getStaffDashboard() {
        StaffDashboardDto dto = new StaffDashboardDto();
        List<LoanApplication> all = loanApplicationRepository.findAllByOrderByCreatedAtDesc();
        dto.setTotalApplications(all.size());
        dto.setNewApplications(loanApplicationRepository.countByStatus("SUBMITTED"));
        dto.setUnderVerification(loanApplicationRepository.countByStatus("UNDER_VERIFICATION"));
        dto.setUnderReview(loanApplicationRepository.countByStatus("UNDER_REVIEW"));
        dto.setEligible(loanApplicationRepository.countByStatus("ELIGIBLE"));
        dto.setNotEligible(loanApplicationRepository.countByStatus("NOT_ELIGIBLE"));
        dto.setRequiresReview(loanApplicationRepository.countByStatus("REQUIRES_REVIEW"));
        dto.setApplications(all.stream().map(loanApplicationService::mapToDto).collect(Collectors.toList()));
        return dto;
    }

    public ReviewerDashboardDto getReviewerDashboard() {
        ReviewerDashboardDto dto = new ReviewerDashboardDto();
        List<LoanApplication> all = loanApplicationRepository.findAllByOrderByCreatedAtDesc();
        List<LoanApplication> toReview = all.stream()
                .filter(a -> "UNDER_REVIEW".equalsIgnoreCase(a.getStatus()) ||
                             "REQUIRES_REVIEW".equalsIgnoreCase(a.getStatus()) ||
                             "ELIGIBLE".equalsIgnoreCase(a.getStatus()))
                .collect(Collectors.toList());

        dto.setTotalToReview(toReview.size());
        dto.setPendingDecision(loanApplicationRepository.countByStatus("REQUIRES_REVIEW") + loanApplicationRepository.countByStatus("UNDER_REVIEW"));
        dto.setApprovedApplications(loanApplicationRepository.countByStatus("APPROVED"));
        dto.setRejectedApplications(loanApplicationRepository.countByStatus("REJECTED"));
        dto.setApplicationsForReview(all.stream().map(loanApplicationService::mapToDto).collect(Collectors.toList()));
        return dto;
    }

    public CustomerDashboardDto getCustomerDashboard(Long customerId) {
        CustomerDashboardDto dto = new CustomerDashboardDto();
        Customer customer = customerRepository.findById(customerId).orElse(null);
        if (customer != null) {
            dto.setCustomerName(customer.getName());
            int completion = 60;
            if (customer.getPhone() != null && !customer.getPhone().isBlank()) completion += 10;
            if (customer.getAddress() != null && !customer.getAddress().isBlank()) completion += 15;
            if (customer.getEmploymentType() != null && !customer.getEmploymentType().isBlank()) completion += 15;
            dto.setProfileCompletionPercentage(Math.min(100, completion));
        } else {
            dto.setCustomerName("Customer");
            dto.setProfileCompletionPercentage(80);
        }

        List<LoanApplication> customerApps = loanApplicationRepository.findByCustomerCustomerIdOrderByCreatedAtDesc(customerId);
        dto.setTotalApplications(customerApps.size());
        dto.setPendingApplications(customerApps.stream()
                .filter(a -> "SUBMITTED".equalsIgnoreCase(a.getStatus()) || "UNDER_VERIFICATION".equalsIgnoreCase(a.getStatus()) || "UNDER_REVIEW".equalsIgnoreCase(a.getStatus()))
                .count());
        dto.setEligibleApplications(customerApps.stream()
                .filter(a -> "ELIGIBLE".equalsIgnoreCase(a.getStatus()))
                .count());
        dto.setApprovedApplications(customerApps.stream()
                .filter(a -> "APPROVED".equalsIgnoreCase(a.getStatus()))
                .count());
        dto.setRequiresReviewApplications(customerApps.stream()
                .filter(a -> "REQUIRES_REVIEW".equalsIgnoreCase(a.getStatus()))
                .count());

        // Find active repayment schedule if any application is approved
        customerApps.stream()
                .filter(a -> "APPROVED".equalsIgnoreCase(a.getStatus()) && a.getRepayment() != null)
                .findFirst()
                .ifPresent(a -> dto.setActiveRepayment(loanRepaymentService.mapToDto(a.getRepayment())));

        dto.setRecentApplications(customerApps.stream().map(loanApplicationService::mapToDto).collect(Collectors.toList()));

        return dto;
    }
}
