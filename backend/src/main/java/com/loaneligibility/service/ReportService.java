package com.loaneligibility.service;

import com.loaneligibility.dto.LoanApplicationDto;
import com.loaneligibility.dto.ReportFilterDto;
import com.loaneligibility.entity.LoanApplication;
import com.loaneligibility.repository.CustomerRepository;
import com.loaneligibility.repository.DocumentRepository;
import com.loaneligibility.repository.LoanApplicationRepository;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final LoanApplicationRepository loanApplicationRepository;
    private final CustomerRepository customerRepository;
    private final DocumentRepository documentRepository;
    private final LoanApplicationService loanApplicationService;

    public ReportService(LoanApplicationRepository loanApplicationRepository,
                         CustomerRepository customerRepository,
                         DocumentRepository documentRepository,
                         LoanApplicationService loanApplicationService) {
        this.loanApplicationRepository = loanApplicationRepository;
        this.customerRepository = customerRepository;
        this.documentRepository = documentRepository;
        this.loanApplicationService = loanApplicationService;
    }

    public List<LoanApplicationDto> getApplicationReport(ReportFilterDto filter) {
        List<LoanApplication> list = loanApplicationRepository.findAllByOrderByCreatedAtDesc();

        return list.stream()
                .filter(a -> filter.getStatus() == null || filter.getStatus().isBlank() || a.getStatus().equalsIgnoreCase(filter.getStatus()))
                .filter(a -> filter.getLoanType() == null || filter.getLoanType().isBlank() || a.getLoanType().equalsIgnoreCase(filter.getLoanType()))
                .filter(a -> filter.getStartDate() == null || !a.getApplicationDate().isBefore(filter.getStartDate()))
                .filter(a -> filter.getEndDate() == null || !a.getApplicationDate().isAfter(filter.getEndDate()))
                .filter(a -> filter.getMinAmount() == null || a.getRequestedAmount().compareTo(filter.getMinAmount()) >= 0)
                .filter(a -> filter.getMaxAmount() == null || a.getRequestedAmount().compareTo(filter.getMaxAmount()) <= 0)
                .map(loanApplicationService::mapToDto)
                .collect(Collectors.toList());
    }

    public Map<String, Object> getReportSummary() {
        Map<String, Object> summary = new HashMap<>();
        long totalApps = loanApplicationRepository.count();
        long eligible = loanApplicationRepository.countByStatus("ELIGIBLE") + loanApplicationRepository.countByStatus("APPROVED");
        long notEligible = loanApplicationRepository.countByStatus("NOT_ELIGIBLE") + loanApplicationRepository.countByStatus("REJECTED");
        long review = loanApplicationRepository.countByStatus("REQUIRES_REVIEW");
        long pending = loanApplicationRepository.countByStatus("SUBMITTED") + loanApplicationRepository.countByStatus("UNDER_VERIFICATION");

        summary.put("totalApplications", totalApps);
        summary.put("eligibleApplications", eligible);
        summary.put("notEligibleApplications", notEligible);
        summary.put("requiresReviewApplications", review);
        summary.put("pendingApplications", pending);
        summary.put("totalCustomers", customerRepository.count());
        summary.put("verifiedDocuments", documentRepository.countByVerificationStatus("VERIFIED"));
        summary.put("pendingDocuments", documentRepository.countByVerificationStatus("PENDING"));

        return summary;
    }

    public ByteArrayInputStream exportApplicationsToCsv(ReportFilterDto filter) {
        List<LoanApplicationDto> data = getApplicationReport(filter);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (PrintWriter writer = new PrintWriter(out, true, StandardCharsets.UTF_8)) {
            writer.println("Application ID,Customer Name,Customer Email,Loan Type,Requested Amount,Tenure (Months),Application Date,Status,Eligibility Result,Eligibility Score");

            for (LoanApplicationDto app : data) {
                writer.printf("%d,\"%s\",\"%s\",\"%s\",%.2f,%d,%s,%s,%s,%s%n",
                        app.getApplicationId(),
                        app.getCustomerName() != null ? app.getCustomerName().replace("\"", "\"\"") : "",
                        app.getCustomerEmail() != null ? app.getCustomerEmail().replace("\"", "\"\"") : "",
                        app.getLoanType(),
                        app.getRequestedAmount(),
                        app.getTenure(),
                        app.getApplicationDate(),
                        app.getStatus(),
                        app.getEligibilityStatus() != null ? app.getEligibilityStatus() : "N/A",
                        app.getEligibilityScore() != null ? app.getEligibilityScore() + "%" : "N/A"
                );
            }
            writer.flush();
        }
        return new ByteArrayInputStream(out.toByteArray());
    }
}
