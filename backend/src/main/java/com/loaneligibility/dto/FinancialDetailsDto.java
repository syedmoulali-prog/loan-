package com.loaneligibility.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class FinancialDetailsDto {

    private Long financialId;
    private Long customerId;

    @NotNull(message = "Monthly income is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Monthly income must be greater than zero")
    private BigDecimal monthlyIncome;

    @NotNull(message = "Monthly expenses are required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Monthly expenses cannot be negative")
    private BigDecimal monthlyExpenses;

    @NotNull(message = "Existing obligations are required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Existing obligations cannot be negative")
    private BigDecimal existingObligations;

    @NotBlank(message = "Credit information category is required")
    private String creditInformation; // EXCELLENT, GOOD, FAIR, POOR

    private BigDecimal debtToIncomeRatio;
    private LocalDateTime createdAt;

    public FinancialDetailsDto() {}

    public Long getFinancialId() { return financialId; }
    public void setFinancialId(Long financialId) { this.financialId = financialId; }

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public BigDecimal getMonthlyIncome() { return monthlyIncome; }
    public void setMonthlyIncome(BigDecimal monthlyIncome) { this.monthlyIncome = monthlyIncome; }

    public BigDecimal getMonthlyExpenses() { return monthlyExpenses; }
    public void setMonthlyExpenses(BigDecimal monthlyExpenses) { this.monthlyExpenses = monthlyExpenses; }

    public BigDecimal getExistingObligations() { return existingObligations; }
    public void setExistingObligations(BigDecimal existingObligations) { this.existingObligations = existingObligations; }

    public String getCreditInformation() { return creditInformation; }
    public void setCreditInformation(String creditInformation) { this.creditInformation = creditInformation; }

    public BigDecimal getDebtToIncomeRatio() { return debtToIncomeRatio; }
    public void setDebtToIncomeRatio(BigDecimal debtToIncomeRatio) { this.debtToIncomeRatio = debtToIncomeRatio; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
