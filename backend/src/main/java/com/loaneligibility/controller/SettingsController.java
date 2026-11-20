package com.loaneligibility.controller;

import com.loaneligibility.dto.SettingDto;
import com.loaneligibility.entity.User;
import com.loaneligibility.repository.UserRepository;
import com.loaneligibility.service.SettingsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/settings")
@PreAuthorize("hasRole('ADMINISTRATOR')")
public class SettingsController {

    private final SettingsService settingsService;
    private final UserRepository userRepository;

    public SettingsController(SettingsService settingsService, UserRepository userRepository) {
        this.settingsService = settingsService;
        this.userRepository = userRepository;
    }

    private Long getCurrentUserId(Authentication auth) {
        if (auth == null) return null;
        return userRepository.findByEmail(auth.getName())
                .map(User::getUserId)
                .orElse(null);
    }

    @GetMapping
    public ResponseEntity<List<SettingDto>> getAllSettings() {
        return ResponseEntity.ok(settingsService.getAllSettings());
    }

    @PostMapping
    public ResponseEntity<SettingDto> saveSetting(
            @RequestBody SettingDto dto,
            Authentication authentication) {
        SettingDto saved = settingsService.saveSetting(dto, getCurrentUserId(authentication));
        return ResponseEntity.ok(saved);
    }
}
