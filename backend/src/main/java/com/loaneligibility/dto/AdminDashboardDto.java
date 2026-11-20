package com.loaneligibility.dto;

import java.util.List;
import java.util.Map;

public class AdminDashboardDto {
    private long totalUsers;
    private long totalCustomers;
    private long totalApplications;
    private long newApplications;
    private long underVerification;
    private long pendingApplications;
    private long underReviewApplications;
    private long eligibleApplications;
    private long notEligibleApplications;
    private long requiresReviewApplications;
    private long approvedLoans;
    private long unreadNotifications;

    private List<Map<String, Object>> applicationsByStatus;
    private List<Map<String, Object>> applicationsByLoanType;
    private List<Map<String, Object>> monthlyApplicationTrends;
    private List<LoanApplicationDto> recentApplications;
    private List<AuditLogDto> recentAuditLogs;

    public AdminDashboardDto() {}

    public long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }

    public long getTotalCustomers() { return totalCustomers; }
    public void setTotalCustomers(long totalCustomers) { this.totalCustomers = totalCustomers; }

    public long getTotalApplications() { return totalApplications; }
    public void setTotalApplications(long totalApplications) { this.totalApplications = totalApplications; }

    public long getPendingApplications() { return pendingApplications; }
    public void setPendingApplications(long pendingApplications) { this.pendingApplications = pendingApplications; }

    public long getUnderReviewApplications() { return underReviewApplications; }
    public void setUnderReviewApplications(long underReviewApplications) { this.underReviewApplications = underReviewApplications; }

    public long getEligibleApplications() { return eligibleApplications; }
    public void setEligibleApplications(long eligibleApplications) { this.eligibleApplications = eligibleApplications; }

    public long getNotEligibleApplications() { return notEligibleApplications; }
    public void setNotEligibleApplications(long notEligibleApplications) { this.notEligibleApplications = notEligibleApplications; }

    public long getRequiresReviewApplications() { return requiresReviewApplications; }
    public void setRequiresReviewApplications(long requiresReviewApplications) { this.requiresReviewApplications = requiresReviewApplications; }

    public long getNewApplications() { return newApplications; }
    public void setNewApplications(long newApplications) { this.newApplications = newApplications; }

    public long getUnderVerification() { return underVerification; }
    public void setUnderVerification(long underVerification) { this.underVerification = underVerification; }

    public long getApprovedLoans() { return approvedLoans; }
    public void setApprovedLoans(long approvedLoans) { this.approvedLoans = approvedLoans; }

    public long getUnreadNotifications() { return unreadNotifications; }
    public void setUnreadNotifications(long unreadNotifications) { this.unreadNotifications = unreadNotifications; }

    public List<Map<String, Object>> getApplicationsByStatus() { return applicationsByStatus; }
    public void setApplicationsByStatus(List<Map<String, Object>> applicationsByStatus) { this.applicationsByStatus = applicationsByStatus; }

    public List<Map<String, Object>> getApplicationsByLoanType() { return applicationsByLoanType; }
    public void setApplicationsByLoanType(List<Map<String, Object>> applicationsByLoanType) { this.applicationsByLoanType = applicationsByLoanType; }

    public List<Map<String, Object>> getMonthlyApplicationTrends() { return monthlyApplicationTrends; }
    public void setMonthlyApplicationTrends(List<Map<String, Object>> monthlyApplicationTrends) { this.monthlyApplicationTrends = monthlyApplicationTrends; }

    public List<LoanApplicationDto> getRecentApplications() { return recentApplications; }
    public void setRecentApplications(List<LoanApplicationDto> recentApplications) { this.recentApplications = recentApplications; }

    public List<AuditLogDto> getRecentAuditLogs() { return recentAuditLogs; }
    public void setRecentAuditLogs(List<AuditLogDto> recentAuditLogs) { this.recentAuditLogs = recentAuditLogs; }
}
