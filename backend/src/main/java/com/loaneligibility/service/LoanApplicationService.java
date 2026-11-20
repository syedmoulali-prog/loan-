package com.loaneligibility.service;

import com.loaneligibility.dto.LoanApplicationCreateDto;
import com.loaneligibility.dto.LoanApplicationDto;
import com.loaneligibility.dto.LoanRepaymentDto;
import com.loaneligibility.dto.LoanStatusUpdateDto;
import com.loaneligibility.entity.Customer;
import com.loaneligibility.entity.FinancialDetails;
import com.loaneligibility.entity.LoanApplication;
import com.loaneligibility.entity.LoanRepayment;
import com.loaneligibility.exception.ResourceNotFoundException;
import com.loaneligibility.repository.CustomerRepository;
import com.loaneligibility.repository.DocumentRepository;
import com.loaneligibility.repository.FinancialDetailsRepository;
import com.loaneligibility.repository.LoanApplicationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class LoanApplicationService {

    private final LoanApplicationRepository loanApplicationRepository;
    private final CustomerRepository customerRepository;
    private final FinancialDetailsRepository financialDetailsRepository;
    private final DocumentRepository documentRepository;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;
    private final LoanRepaymentService loanRepaymentService;
    private final EligibilityEngineService eligibilityEngineService;

    public LoanApplicationService(LoanApplicationRepository loanApplicationRepository,
                                  CustomerRepository customerRepository,
                                  FinancialDetailsRepository financialDetailsRepository,
                                  DocumentRepository documentRepository,
                                  AuditLogService auditLogService,
                                  NotificationService notificationService,
                                  LoanRepaymentService loanRepaymentService,
                                  EligibilityEngineService eligibilityEngineService) {
        this.loanApplicationRepository = loanApplicationRepository;
        this.customerRepository = customerRepository;
        this.financialDetailsRepository = financialDetailsRepository;
        this.documentRepository = documentRepository;
        this.auditLogService = auditLogService;
        this.notificationService = notificationService;
        this.loanRepaymentService = loanRepaymentService;
        this.eligibilityEngineService = eligibilityEngineService;
    }

    public List<LoanApplicationDto> getAllApplications() {
        return loanApplicationRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<LoanApplicationDto> getApplicationsByStatus(String status) {
        return loanApplicationRepository.findByStatus(status).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public LoanApplicationDto getApplicationById(Long id) {
        LoanApplication application = loanApplicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Loan application not found with id: " + id));
        return mapToDto(application);
    }

    public List<LoanApplicationDto> getApplicationsByCustomer(Long customerId) {
        return loanApplicationRepository.findByCustomerCustomerIdOrderByCreatedAtDesc(customerId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public LoanApplicationDto createApplication(LoanApplicationCreateDto dto, Long currentUserId) {
        Customer customer = customerRepository.findById(dto.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + dto.getCustomerId()));

        // Save inline financial details if provided during multi-step flow
        if (dto.getMonthlyIncome() != null && dto.getMonthlyIncome().compareTo(BigDecimal.ZERO) > 0) {
            FinancialDetails fin = new FinancialDetails();
            fin.setCustomer(customer);
            fin.setMonthlyIncome(dto.getMonthlyIncome());
            fin.setMonthlyExpenses(dto.getMonthlyExpenses() != null ? dto.getMonthlyExpenses() : BigDecimal.ZERO);
            fin.setExistingObligations(dto.getExistingObligations() != null ? dto.getExistingObligations() : BigDecimal.ZERO);
            fin.setCreditInformation(dto.getCreditInformation() != null ? dto.getCreditInformation() : "FAIR");
            financialDetailsRepository.save(fin);
        }

        LoanApplication application = new LoanApplication();
        application.setCustomer(customer);
        application.setLoanType(dto.getLoanType());
        application.setRequestedAmount(dto.getRequestedAmount());
        application.setTenure(dto.getTenure());
        application.setApplicationDate(dto.getApplicationDate() != null ? dto.getApplicationDate() : LocalDate.now());
        application.setStatus("SUBMITTED");
        application.setRemarks(dto.getRemarks());

        LoanApplication saved = loanApplicationRepository.save(application);

        // 1. Initial Eligibility Evaluation
        try {
            eligibilityEngineService.evaluateApplication(saved.getApplicationId(), currentUserId);
            // Ensure application status remains SUBMITTED for administrative workflow
            saved.setStatus("SUBMITTED");
            saved = loanApplicationRepository.save(saved);
        } catch (Exception ignored) {}

        // 2. Trigger Administrator Notification for new loan application
        notificationService.notifyAdminLoanApplicationSubmitted(saved);

        auditLogService.log(currentUserId, "CREATE_APPLICATION", "LOAN_APPLICATION", saved.getApplicationId().toString(),
                "Customer " + customer.getName() + " submitted application #" + saved.getApplicationId() + " for " + saved.getLoanType() + " ($" + saved.getRequestedAmount() + ")");

        return mapToDto(saved);
    }

    @Transactional
    public LoanApplicationDto approveApplication(Long id, BigDecimal interestRate, String remarks, Long currentUserId) {
        LoanApplication application = loanApplicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + id));

        application.setStatus("APPROVED");
        if (remarks != null && !remarks.isBlank()) {
            application.setRemarks(remarks);
        }

        LoanApplication saved = loanApplicationRepository.save(application);

        // Calculate and persist monthly payment repayment schedule using backend EMI formula
        LoanRepayment repayment = loanRepaymentService.calculateAndSaveRepayment(saved, interestRate);
        saved.setRepayment(repayment);

        // Notify customer of loan approval with monthly payment details
        notificationService.notifyCustomerLoanDecision(saved, true, repayment.getMonthlyPayment(), remarks);

        // Audit log
        String appIdStr = "LA-" + (10000 + id);
        auditLogService.log(currentUserId, "APPROVED_LOAN_APPLICATION", "LOAN_APPLICATION", appIdStr,
                "Administrator approved loan application #" + id + " for $" + saved.getRequestedAmount() + " with monthly payment $" + repayment.getMonthlyPayment());

        return mapToDto(saved);
    }

    @Transactional
    public LoanApplicationDto rejectApplication(Long id, String remarks, Long currentUserId) {
        LoanApplication application = loanApplicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + id));

        application.setStatus("NOT_ELIGIBLE");
        if (remarks != null && !remarks.isBlank()) {
            application.setRemarks(remarks);
        }

        LoanApplication saved = loanApplicationRepository.save(application);

        // Notify customer of decision with reason
        notificationService.notifyCustomerLoanDecision(saved, false, null, remarks);

        // Audit log
        String appIdStr = "LA-" + (10000 + id);
        auditLogService.log(currentUserId, "REJECTED_LOAN_APPLICATION", "LOAN_APPLICATION", appIdStr,
                "Administrator marked loan application #" + id + " as not approved. Reason: " + remarks);

        return mapToDto(saved);
    }

    @Transactional
    public LoanApplicationDto updateStatus(Long id, LoanStatusUpdateDto dto, Long currentUserId) {
        LoanApplication application = loanApplicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + id));

        String oldStatus = application.getStatus();
        application.setStatus(dto.getStatus().toUpperCase());
        if (dto.getRemarks() != null && !dto.getRemarks().isBlank()) {
            application.setRemarks(dto.getRemarks());
        }

        LoanApplication updated = loanApplicationRepository.save(application);

        auditLogService.log(currentUserId, "UPDATE_APPLICATION_STATUS", "LOAN_APPLICATION", id.toString(),
                "Updated application #" + id + " status from " + oldStatus + " to " + updated.getStatus() + (dto.getRemarks() != null ? " (Remarks: " + dto.getRemarks() + ")" : ""));

        return mapToDto(updated);
    }

    @Transactional
    public void deleteApplication(Long id, Long currentUserId) {
        LoanApplication application = loanApplicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + id));
        loanApplicationRepository.delete(application);

        auditLogService.log(currentUserId, "DELETE_APPLICATION", "LOAN_APPLICATION", id.toString(),
                "Deleted loan application #" + id);
    }

    public LoanApplicationDto mapToDto(LoanApplication app) {
        LoanApplicationDto dto = new LoanApplicationDto();
        dto.setApplicationId(app.getApplicationId());
        if (app.getCustomer() != null) {
            dto.setCustomerId(app.getCustomer().getCustomerId());
            dto.setCustomerName(app.getCustomer().getName());
            dto.setCustomerEmail(app.getCustomer().getEmail());
            dto.setCustomerPhone(app.getCustomer().getPhone());
            dto.setEmploymentType(app.getCustomer().getEmploymentType());
            dto.setCustomerAge(app.getCustomer().getAge());
        }
        dto.setLoanType(app.getLoanType());
        dto.setRequestedAmount(app.getRequestedAmount());
        dto.setTenure(app.getTenure());
        dto.setApplicationDate(app.getApplicationDate());
        dto.setStatus(app.getStatus());
        dto.setRemarks(app.getRemarks());
        dto.setCreatedAt(app.getCreatedAt());
        dto.setUpdatedAt(app.getUpdatedAt());

        // Count documents
        dto.setDocumentsCount(app.getDocuments() != null ? app.getDocuments().size() : 0);

        // Eligibility Result
        if (app.getEligibilityResult() != null) {
            dto.setEligibilityStatus(app.getEligibilityResult().getEligibilityStatus());
            dto.setEligibilityScore(app.getEligibilityResult().getEligibilityScore());
        }

        // Repayment schedule if approved
        if (app.getRepayment() != null) {
            dto.setRepayment(loanRepaymentService.mapToDto(app.getRepayment()));
        }

        return dto;
    }
}
