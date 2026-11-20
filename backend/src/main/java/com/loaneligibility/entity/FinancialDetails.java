package com.loaneligibility.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "financial_details")
public class FinancialDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "financial_id")
    private Long financialId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(name = "monthly_income", nullable = false, precision = 15, scale = 2)
    private BigDecimal monthlyIncome;

    @Column(name = "monthly_expenses", nullable = false, precision = 15, scale = 2)
    private BigDecimal monthlyExpenses;

    @Column(name = "existing_obligations", nullable = false, precision = 15, scale = 2)
    private BigDecimal existingObligations = BigDecimal.ZERO;

    @Column(name = "credit_information", nullable = false, length = 100)
    private String creditInformation; // EXCELLENT, GOOD, FAIR, POOR

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public FinancialDetails() {}

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public BigDecimal getDebtToIncomeRatio() {
        if (monthlyIncome == null || monthlyIncome.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.valueOf(100.0);
        }
        BigDecimal totalObligations = (existingObligations != null ? existingObligations : BigDecimal.ZERO)
                .add(monthlyExpenses != null ? monthlyExpenses : BigDecimal.ZERO);
        return totalObligations.multiply(BigDecimal.valueOf(100))
                .divide(monthlyIncome, 2, java.math.RoundingMode.HALF_UP);
    }

    public Long getFinancialId() { return financialId; }
    public void setFinancialId(Long financialId) { this.financialId = financialId; }

    public Customer getCustomer() { return customer; }
    public void setCustomer(Customer customer) { this.customer = customer; }

    public BigDecimal getMonthlyIncome() { return monthlyIncome; }
    public void setMonthlyIncome(BigDecimal monthlyIncome) { this.monthlyIncome = monthlyIncome; }

    public BigDecimal getMonthlyExpenses() { return monthlyExpenses; }
    public void setMonthlyExpenses(BigDecimal monthlyExpenses) { this.monthlyExpenses = monthlyExpenses; }

    public BigDecimal getExistingObligations() { return existingObligations; }
    public void setExistingObligations(BigDecimal existingObligations) { this.existingObligations = existingObligations; }

    public String getCreditInformation() { return creditInformation; }
    public void setCreditInformation(String creditInformation) { this.creditInformation = creditInformation; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
