package com.loaneligibility.controller;

import com.loaneligibility.dto.*;
import com.loaneligibility.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<AdminDashboardDto> getAdminDashboard() {
        return ResponseEntity.ok(dashboardService.getAdminDashboard());
    }

    @GetMapping("/staff")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'STAFF')")
    public ResponseEntity<StaffDashboardDto> getStaffDashboard() {
        return ResponseEntity.ok(dashboardService.getStaffDashboard());
    }

    @GetMapping("/reviewer")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'REVIEWER')")
    public ResponseEntity<ReviewerDashboardDto> getReviewerDashboard() {
        return ResponseEntity.ok(dashboardService.getReviewerDashboard());
    }

    @GetMapping("/customer/{customerId}")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'CUSTOMER')")
    public ResponseEntity<CustomerDashboardDto> getCustomerDashboard(@PathVariable Long customerId) {
        return ResponseEntity.ok(dashboardService.getCustomerDashboard(customerId));
    }
}
