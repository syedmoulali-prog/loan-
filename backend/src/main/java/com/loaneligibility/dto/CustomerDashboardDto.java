package com.loaneligibility.dto;

import java.util.List;

public class CustomerDashboardDto {
    private String customerName;
    private int profileCompletionPercentage;
    private long totalApplications;
    private long pendingApplications;
    private long eligibleApplications;
    private long requiresReviewApplications;
    private long approvedApplications;
    private LoanRepaymentDto activeRepayment;
    private List<LoanApplicationDto> recentApplications;

    public CustomerDashboardDto() {}

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public int getProfileCompletionPercentage() { return profileCompletionPercentage; }
    public void setProfileCompletionPercentage(int profileCompletionPercentage) { this.profileCompletionPercentage = profileCompletionPercentage; }

    public long getTotalApplications() { return totalApplications; }
    public void setTotalApplications(long totalApplications) { this.totalApplications = totalApplications; }

    public long getPendingApplications() { return pendingApplications; }
    public void setPendingApplications(long pendingApplications) { this.pendingApplications = pendingApplications; }

    public long getEligibleApplications() { return eligibleApplications; }
    public void setEligibleApplications(long eligibleApplications) { this.eligibleApplications = eligibleApplications; }

    public long getRequiresReviewApplications() { return requiresReviewApplications; }
    public void setRequiresReviewApplications(long requiresReviewApplications) { this.requiresReviewApplications = requiresReviewApplications; }

    public long getApprovedApplications() { return approvedApplications; }
    public void setApprovedApplications(long approvedApplications) { this.approvedApplications = approvedApplications; }

    public LoanRepaymentDto getActiveRepayment() { return activeRepayment; }
    public void setActiveRepayment(LoanRepaymentDto activeRepayment) { this.activeRepayment = activeRepayment; }

    public List<LoanApplicationDto> getRecentApplications() { return recentApplications; }
    public void setRecentApplications(List<LoanApplicationDto> recentApplications) { this.recentApplications = recentApplications; }
}
