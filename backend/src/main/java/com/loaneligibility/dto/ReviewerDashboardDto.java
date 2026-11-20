package com.loaneligibility.dto;

import java.util.List;

public class ReviewerDashboardDto {
    private long totalToReview;
    private long pendingDecision;
    private long approvedApplications;
    private long rejectedApplications;
    private List<LoanApplicationDto> applicationsForReview;

    public ReviewerDashboardDto() {}

    public long getTotalToReview() { return totalToReview; }
    public void setTotalToReview(long totalToReview) { this.totalToReview = totalToReview; }

    public long getPendingDecision() { return pendingDecision; }
    public void setPendingDecision(long pendingDecision) { this.pendingDecision = pendingDecision; }

    public long getApprovedApplications() { return approvedApplications; }
    public void setApprovedApplications(long approvedApplications) { this.approvedApplications = approvedApplications; }

    public long getRejectedApplications() { return rejectedApplications; }
    public void setRejectedApplications(long rejectedApplications) { this.rejectedApplications = rejectedApplications; }

    public List<LoanApplicationDto> getApplicationsForReview() { return applicationsForReview; }
    public void setApplicationsForReview(List<LoanApplicationDto> applicationsForReview) { this.applicationsForReview = applicationsForReview; }
}
