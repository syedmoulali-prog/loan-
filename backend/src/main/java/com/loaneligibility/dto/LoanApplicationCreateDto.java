package com.loaneligibility.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public class LoanApplicationCreateDto {

    private Long customerId;

    @NotBlank(message = "Loan type is required")
    private String loanType; // Personal Loan, Home Loan, Education Loan, Vehicle Loan

    @NotNull(message = "Requested loan amount is required")
    @DecimalMin(value = "500.0", message = "Requested loan amount must be at least 500")
    private BigDecimal requestedAmount;

    @NotNull(message = "Tenure is required")
    @Min(value = 6, message = "Tenure must be at least 6 months")
    private Integer tenure;

    private LocalDate applicationDate;
    private String remarks;

    // Optional inline financial details during multi-step submission
    private BigDecimal monthlyIncome;
    private BigDecimal monthlyExpenses;
    private BigDecimal existingObligations;
    private String creditInformation;

    public LoanApplicationCreateDto() {}

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public String getLoanType() { return loanType; }
    public void setLoanType(String loanType) { this.loanType = loanType; }

    public BigDecimal getRequestedAmount() { return requestedAmount; }
    public void setRequestedAmount(BigDecimal requestedAmount) { this.requestedAmount = requestedAmount; }

    public Integer getTenure() { return tenure; }
    public void setTenure(Integer tenure) { this.tenure = tenure; }

    public LocalDate getApplicationDate() { return applicationDate; }
    public void setApplicationDate(LocalDate applicationDate) { this.applicationDate = applicationDate; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public BigDecimal getMonthlyIncome() { return monthlyIncome; }
    public void setMonthlyIncome(BigDecimal monthlyIncome) { this.monthlyIncome = monthlyIncome; }

    public BigDecimal getMonthlyExpenses() { return monthlyExpenses; }
    public void setMonthlyExpenses(BigDecimal monthlyExpenses) { this.monthlyExpenses = monthlyExpenses; }

    public BigDecimal getExistingObligations() { return existingObligations; }
    public void setExistingObligations(BigDecimal existingObligations) { this.existingObligations = existingObligations; }

    public String getCreditInformation() { return creditInformation; }
    public void setCreditInformation(String creditInformation) { this.creditInformation = creditInformation; }
}
