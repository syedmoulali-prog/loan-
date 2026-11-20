package com.loaneligibility.controller;

import com.loaneligibility.dto.FinancialDetailsDto;
import com.loaneligibility.entity.User;
import com.loaneligibility.repository.UserRepository;
import com.loaneligibility.service.FinancialDetailsService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers/{customerId}/financial")
public class FinancialDetailsController {

    private final FinancialDetailsService financialDetailsService;
    private final UserRepository userRepository;

    public FinancialDetailsController(FinancialDetailsService financialDetailsService, UserRepository userRepository) {
        this.financialDetailsService = financialDetailsService;
        this.userRepository = userRepository;
    }

    private Long getCurrentUserId(Authentication auth) {
        if (auth == null) return null;
        return userRepository.findByEmail(auth.getName())
                .map(User::getUserId)
                .orElse(null);
    }

    @GetMapping
    public ResponseEntity<FinancialDetailsDto> getFinancialDetails(@PathVariable Long customerId) {
        FinancialDetailsDto details = financialDetailsService.getLatestFinancialDetails(customerId);
        if (details == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(details);
    }

    @GetMapping("/history")
    public ResponseEntity<List<FinancialDetailsDto>> getFinancialHistory(@PathVariable Long customerId) {
        return ResponseEntity.ok(financialDetailsService.getFinancialDetailsByCustomer(customerId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'STAFF', 'CUSTOMER')")
    public ResponseEntity<FinancialDetailsDto> saveFinancialDetails(
            @PathVariable Long customerId,
            @Valid @RequestBody FinancialDetailsDto dto,
            Authentication authentication) {
        FinancialDetailsDto saved = financialDetailsService.saveFinancialDetails(customerId, dto, getCurrentUserId(authentication));
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @PutMapping
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'STAFF', 'CUSTOMER')")
    public ResponseEntity<FinancialDetailsDto> updateFinancialDetails(
            @PathVariable Long customerId,
            @Valid @RequestBody FinancialDetailsDto dto,
            Authentication authentication) {
        FinancialDetailsDto saved = financialDetailsService.saveFinancialDetails(customerId, dto, getCurrentUserId(authentication));
        return ResponseEntity.ok(saved);
    }
}
