package com.loaneligibility.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class LoanRuleDto {

    private Long ruleId;

    @NotBlank(message = "Rule name is required")
    private String ruleName;

    @NotBlank(message = "Rule description is required")
    private String ruleDescription;

    @NotBlank(message = "Rule threshold value is required")
    private String ruleValue;

    @NotNull(message = "Active status is required")
    private Boolean activeStatus;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public LoanRuleDto() {}

    public Long getRuleId() { return ruleId; }
    public void setRuleId(Long ruleId) { this.ruleId = ruleId; }

    public String getRuleName() { return ruleName; }
    public void setRuleName(String ruleName) { this.ruleName = ruleName; }

    public String getRuleDescription() { return ruleDescription; }
    public void setRuleDescription(String ruleDescription) { this.ruleDescription = ruleDescription; }

    public String getRuleValue() { return ruleValue; }
    public void setRuleValue(String ruleValue) { this.ruleValue = ruleValue; }

    public Boolean getActiveStatus() { return activeStatus; }
    public void setActiveStatus(Boolean activeStatus) { this.activeStatus = activeStatus; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
