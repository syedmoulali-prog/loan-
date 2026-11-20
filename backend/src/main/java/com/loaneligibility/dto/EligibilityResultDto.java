package com.loaneligibility.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class EligibilityResultDto {
    private Long resultId;
    private Long applicationId;
    private String customerName;
    private String loanType;
    private BigDecimal requestedAmount;
    private String eligibilityStatus; // ELIGIBLE, NOT_ELIGIBLE, REQUIRES_REVIEW
    private BigDecimal eligibilityScore;
    private String indicators;
    private String reason;
    private LocalDateTime evaluationDate;
    private List<String> ruleChecks;

    public EligibilityResultDto() {}

    public Long getResultId() { return resultId; }
    public void setResultId(Long resultId) { this.resultId = resultId; }

    public Long getApplicationId() { return applicationId; }
    public void setApplicationId(Long applicationId) { this.applicationId = applicationId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getLoanType() { return loanType; }
    public void setLoanType(String loanType) { this.loanType = loanType; }

    public BigDecimal getRequestedAmount() { return requestedAmount; }
    public void setRequestedAmount(BigDecimal requestedAmount) { this.requestedAmount = requestedAmount; }

    public String getEligibilityStatus() { return eligibilityStatus; }
    public void setEligibilityStatus(String eligibilityStatus) { this.eligibilityStatus = eligibilityStatus; }

    public BigDecimal getEligibilityScore() { return eligibilityScore; }
    public void setEligibilityScore(BigDecimal eligibilityScore) { this.eligibilityScore = eligibilityScore; }

    public String getIndicators() { return indicators; }
    public void setIndicators(String indicators) { this.indicators = indicators; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public LocalDateTime getEvaluationDate() { return evaluationDate; }
    public void setEvaluationDate(LocalDateTime evaluationDate) { this.evaluationDate = evaluationDate; }

    public List<String> getRuleChecks() { return ruleChecks; }
    public void setRuleChecks(List<String> ruleChecks) { this.ruleChecks = ruleChecks; }
}
