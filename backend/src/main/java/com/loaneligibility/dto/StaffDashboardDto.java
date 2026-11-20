package com.loaneligibility.dto;

import java.util.List;

public class StaffDashboardDto {
    private long totalApplications;
    private long newApplications;
    private long underVerification;
    private long underReview;
    private long eligible;
    private long notEligible;
    private long requiresReview;
    private List<LoanApplicationDto> applications;

    public StaffDashboardDto() {}

    public long getTotalApplications() { return totalApplications; }
    public void setTotalApplications(long totalApplications) { this.totalApplications = totalApplications; }

    public long getNewApplications() { return newApplications; }
    public void setNewApplications(long newApplications) { this.newApplications = newApplications; }

    public long getUnderVerification() { return underVerification; }
    public void setUnderVerification(long underVerification) { this.underVerification = underVerification; }

    public long getUnderReview() { return underReview; }
    public void setUnderReview(long underReview) { this.underReview = underReview; }

    public long getEligible() { return eligible; }
    public void setEligible(long eligible) { this.eligible = eligible; }

    public long getNotEligible() { return notEligible; }
    public void setNotEligible(long notEligible) { this.notEligible = notEligible; }

    public long getRequiresReview() { return requiresReview; }
    public void setRequiresReview(long requiresReview) { this.requiresReview = requiresReview; }

    public List<LoanApplicationDto> getApplications() { return applications; }
    public void setApplications(List<LoanApplicationDto> applications) { this.applications = applications; }
}
