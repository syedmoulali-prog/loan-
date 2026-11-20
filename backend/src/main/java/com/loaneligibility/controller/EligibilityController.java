package com.loaneligibility.controller;

import com.loaneligibility.dto.EligibilityResultDto;
import com.loaneligibility.entity.User;
import com.loaneligibility.repository.UserRepository;
import com.loaneligibility.service.EligibilityEngineService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/applications/{applicationId}")
public class EligibilityController {

    private final EligibilityEngineService eligibilityEngineService;
    private final UserRepository userRepository;

    public EligibilityController(EligibilityEngineService eligibilityEngineService, UserRepository userRepository) {
        this.eligibilityEngineService = eligibilityEngineService;
        this.userRepository = userRepository;
    }

    private Long getCurrentUserId(Authentication auth) {
        if (auth == null) return null;
        return userRepository.findByEmail(auth.getName())
                .map(User::getUserId)
                .orElse(null);
    }

    @PostMapping("/evaluate")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'STAFF', 'REVIEWER')")
    public ResponseEntity<EligibilityResultDto> evaluateApplication(
            @PathVariable Long applicationId,
            Authentication authentication) {
        EligibilityResultDto result = eligibilityEngineService.evaluateApplication(applicationId, getCurrentUserId(authentication));
        return ResponseEntity.ok(result);
    }

    @GetMapping("/eligibility")
    public ResponseEntity<EligibilityResultDto> getEligibilityResult(@PathVariable Long applicationId) {
        EligibilityResultDto result = eligibilityEngineService.getEligibilityByApplicationId(applicationId);
        return ResponseEntity.ok(result);
    }
}
