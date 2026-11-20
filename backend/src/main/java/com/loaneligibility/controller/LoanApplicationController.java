package com.loaneligibility.controller;

import com.loaneligibility.dto.LoanApplicationCreateDto;
import com.loaneligibility.dto.LoanApplicationDto;
import com.loaneligibility.dto.LoanRepaymentDto;
import com.loaneligibility.dto.LoanStatusUpdateDto;
import com.loaneligibility.entity.Customer;
import com.loaneligibility.entity.User;
import com.loaneligibility.repository.CustomerRepository;
import com.loaneligibility.repository.UserRepository;
import com.loaneligibility.service.LoanApplicationService;
import com.loaneligibility.service.LoanRepaymentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/applications", "/api/admin/applications"})
public class LoanApplicationController {

    private final LoanApplicationService loanApplicationService;
    private final LoanRepaymentService loanRepaymentService;
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;

    public LoanApplicationController(LoanApplicationService loanApplicationService,
                                   LoanRepaymentService loanRepaymentService,
                                   UserRepository userRepository,
                                   CustomerRepository customerRepository) {
        this.loanApplicationService = loanApplicationService;
        this.loanRepaymentService = loanRepaymentService;
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
    }

    private User getCurrentUser(Authentication auth) {
        if (auth == null) return null;
        return userRepository.findByEmail(auth.getName()).orElse(null);
    }

    private Long getCurrentUserId(Authentication auth) {
        User user = getCurrentUser(auth);
        return user != null ? user.getUserId() : null;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'STAFF', 'REVIEWER')")
    public ResponseEntity<List<LoanApplicationDto>> getAllApplications(
            @RequestParam(required = false) String status) {
        if (status != null && !status.isBlank()) {
            return ResponseEntity.ok(loanApplicationService.getApplicationsByStatus(status));
        }
        return ResponseEntity.ok(loanApplicationService.getAllApplications());
    }

    @GetMapping("/my")
    public ResponseEntity<List<LoanApplicationDto>> getMyApplications(Authentication authentication) {
        User user = getCurrentUser(authentication);
        if (user == null) {
            return ResponseEntity.ok(List.of());
        }
        Customer customer = customerRepository.findByUserUserId(user.getUserId()).orElse(null);
        if (customer == null) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(loanApplicationService.getApplicationsByCustomer(customer.getCustomerId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LoanApplicationDto> getApplicationById(
            @PathVariable Long id,
            Authentication authentication) {
        LoanApplicationDto app = loanApplicationService.getApplicationById(id);
        User user = getCurrentUser(authentication);

        // Security: Prevent Customer A from viewing Customer B's application
        if (user != null && "CUSTOMER".equalsIgnoreCase(user.getRole())) {
            Customer customer = customerRepository.findByUserUserId(user.getUserId()).orElse(null);
            if (customer == null || !customer.getCustomerId().equals(app.getCustomerId())) {
                throw new AccessDeniedException("You are not authorized to view this loan application.");
            }
        }

        return ResponseEntity.ok(app);
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<LoanApplicationDto>> getApplicationsByCustomer(
            @PathVariable Long customerId,
            Authentication authentication) {
        User user = getCurrentUser(authentication);

        // Security check
        if (user != null && "CUSTOMER".equalsIgnoreCase(user.getRole())) {
            Customer customer = customerRepository.findByUserUserId(user.getUserId()).orElse(null);
            if (customer == null || !customer.getCustomerId().equals(customerId)) {
                throw new AccessDeniedException("You are not authorized to view another customer's applications.");
            }
        }

        return ResponseEntity.ok(loanApplicationService.getApplicationsByCustomer(customerId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'CUSTOMER')")
    public ResponseEntity<LoanApplicationDto> createApplication(
            @Valid @RequestBody LoanApplicationCreateDto dto,
            Authentication authentication) {
        User user = getCurrentUser(authentication);

        // If customer, enforce their own customer ID
        if (user != null && "CUSTOMER".equalsIgnoreCase(user.getRole())) {
            Customer customer = customerRepository.findByUserUserId(user.getUserId()).orElse(null);
            if (customer != null) {
                dto.setCustomerId(customer.getCustomerId());
            }
        }

        LoanApplicationDto created = loanApplicationService.createApplication(dto, getCurrentUserId(authentication));
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<LoanApplicationDto> submitApplication(
            @PathVariable Long id,
            Authentication authentication) {
        LoanStatusUpdateDto statusUpdate = new LoanStatusUpdateDto("SUBMITTED", "Application submitted by customer.");
        LoanApplicationDto updated = loanApplicationService.updateStatus(id, statusUpdate, getCurrentUserId(authentication));
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'STAFF', 'REVIEWER')")
    public ResponseEntity<LoanApplicationDto> patchStatus(
            @PathVariable Long id,
            @RequestBody LoanStatusUpdateDto dto,
            Authentication authentication) {
        LoanApplicationDto updated = loanApplicationService.updateStatus(id, dto, getCurrentUserId(authentication));
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'STAFF', 'REVIEWER')")
    public ResponseEntity<LoanApplicationDto> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody LoanStatusUpdateDto dto,
            Authentication authentication) {
        LoanApplicationDto updated = loanApplicationService.updateStatus(id, dto, getCurrentUserId(authentication));
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'REVIEWER')")
    public ResponseEntity<LoanApplicationDto> approveApplication(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, Object> body,
            Authentication authentication) {
        BigDecimal interestRate = BigDecimal.valueOf(10.00); // Default 10% annual
        String remarks = "Application approved by Underwriting Administrator.";

        if (body != null) {
            if (body.containsKey("interestRate") && body.get("interestRate") != null) {
                try {
                    interestRate = new BigDecimal(body.get("interestRate").toString());
                } catch (Exception ignored) {}
            }
            if (body.containsKey("remarks") && body.get("remarks") != null) {
                remarks = body.get("remarks").toString();
            }
        }

        LoanApplicationDto approved = loanApplicationService.approveApplication(id, interestRate, remarks, getCurrentUserId(authentication));
        return ResponseEntity.ok(approved);
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'REVIEWER')")
    public ResponseEntity<LoanApplicationDto> rejectApplication(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, Object> body,
            Authentication authentication) {
        String remarks = "Application did not satisfy credit and policy guidelines.";
        if (body != null && body.containsKey("remarks") && body.get("remarks") != null) {
            remarks = body.get("remarks").toString();
        }

        LoanApplicationDto rejected = loanApplicationService.rejectApplication(id, remarks, getCurrentUserId(authentication));
        return ResponseEntity.ok(rejected);
    }

    @GetMapping("/{id}/repayment")
    public ResponseEntity<LoanRepaymentDto> getRepayment(
            @PathVariable Long id,
            Authentication authentication) {
        LoanApplicationDto app = loanApplicationService.getApplicationById(id);
        User user = getCurrentUser(authentication);

        // Security check
        if (user != null && "CUSTOMER".equalsIgnoreCase(user.getRole())) {
            Customer customer = customerRepository.findByUserUserId(user.getUserId()).orElse(null);
            if (customer == null || !customer.getCustomerId().equals(app.getCustomerId())) {
                throw new AccessDeniedException("You are not authorized to view this loan's repayment schedule.");
            }
        }

        return ResponseEntity.ok(loanRepaymentService.getRepaymentByApplicationId(id));
    }

    @PostMapping("/{id}/calculate-repayment")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'REVIEWER')")
    public ResponseEntity<LoanRepaymentDto> calculateRepayment(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, Object> body) {
        BigDecimal interestRate = BigDecimal.valueOf(10.00);
        if (body != null && body.containsKey("interestRate") && body.get("interestRate") != null) {
            try {
                interestRate = new BigDecimal(body.get("interestRate").toString());
            } catch (Exception ignored) {}
        }
        var app = loanApplicationService.getApplicationById(id);
        var entity = new com.loaneligibility.entity.LoanApplication();
        entity.setApplicationId(app.getApplicationId());
        entity.setRequestedAmount(app.getRequestedAmount());
        entity.setTenure(app.getTenure());
        var rep = loanRepaymentService.calculateAndSaveRepayment(entity, interestRate);
        return ResponseEntity.ok(loanRepaymentService.mapToDto(rep));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<Map<String, String>> deleteApplication(
            @PathVariable Long id,
            Authentication authentication) {
        loanApplicationService.deleteApplication(id, getCurrentUserId(authentication));
        return ResponseEntity.ok(Map.of("message", "Application deleted successfully"));
    }
}
