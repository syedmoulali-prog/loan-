package com.loaneligibility.controller;

import com.loaneligibility.dto.LoanRuleDto;
import com.loaneligibility.entity.User;
import com.loaneligibility.repository.UserRepository;
import com.loaneligibility.service.LoanRuleService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rules")
public class LoanRuleController {

    private final LoanRuleService loanRuleService;
    private final UserRepository userRepository;

    public LoanRuleController(LoanRuleService loanRuleService, UserRepository userRepository) {
        this.loanRuleService = loanRuleService;
        this.userRepository = userRepository;
    }

    private Long getCurrentUserId(Authentication auth) {
        if (auth == null) return null;
        return userRepository.findByEmail(auth.getName())
                .map(User::getUserId)
                .orElse(null);
    }

    @GetMapping
    public ResponseEntity<List<LoanRuleDto>> getAllRules() {
        return ResponseEntity.ok(loanRuleService.getAllRules());
    }

    @GetMapping("/active")
    public ResponseEntity<List<LoanRuleDto>> getActiveRules() {
        return ResponseEntity.ok(loanRuleService.getActiveRules());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LoanRuleDto> getRuleById(@PathVariable Long id) {
        return ResponseEntity.ok(loanRuleService.getRuleById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<LoanRuleDto> createRule(
            @Valid @RequestBody LoanRuleDto dto,
            Authentication authentication) {
        LoanRuleDto created = loanRuleService.createRule(dto, getCurrentUserId(authentication));
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<LoanRuleDto> updateRule(
            @PathVariable Long id,
            @Valid @RequestBody LoanRuleDto dto,
            Authentication authentication) {
        LoanRuleDto updated = loanRuleService.updateRule(id, dto, getCurrentUserId(authentication));
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<LoanRuleDto> toggleRuleStatus(
            @PathVariable Long id,
            Authentication authentication) {
        LoanRuleDto updated = loanRuleService.toggleRuleStatus(id, getCurrentUserId(authentication));
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<Map<String, String>> deleteRule(
            @PathVariable Long id,
            Authentication authentication) {
        loanRuleService.deleteRule(id, getCurrentUserId(authentication));
        return ResponseEntity.ok(Map.of("message", "Rule deleted successfully"));
    }
}
