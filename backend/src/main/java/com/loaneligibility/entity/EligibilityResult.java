package com.loaneligibility.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "eligibility_results")
public class EligibilityResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "result_id")
    private Long resultId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false, unique = true)
    private LoanApplication application;

    @Column(name = "eligibility_status", nullable = false, length = 50)
    private String eligibilityStatus; // ELIGIBLE, NOT_ELIGIBLE, REQUIRES_REVIEW

    @Column(name = "eligibility_score", nullable = false, precision = 5, scale = 2)
    private BigDecimal eligibilityScore;

    @Column(columnDefinition = "TEXT")
    private String indicators; // JSON array or string of indicators

    @Column(nullable = false, columnDefinition = "TEXT")
    private String reason;

    @Column(name = "evaluation_date")
    private LocalDateTime evaluationDate = LocalDateTime.now();

    public EligibilityResult() {}

    @PrePersist
    protected void onCreate() {
        if (evaluationDate == null) evaluationDate = LocalDateTime.now();
    }

    public Long getResultId() { return resultId; }
    public void setResultId(Long resultId) { this.resultId = resultId; }

    public LoanApplication getApplication() { return application; }
    public void setApplication(LoanApplication application) { this.application = application; }

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
}
