package com.loaneligibility.service;

import com.loaneligibility.dto.SettingDto;
import com.loaneligibility.entity.SystemSettings;
import com.loaneligibility.repository.SystemSettingsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SettingsService {

    private final SystemSettingsRepository settingsRepository;
    private final AuditLogService auditLogService;

    public SettingsService(SystemSettingsRepository settingsRepository, AuditLogService auditLogService) {
        this.settingsRepository = settingsRepository;
        this.auditLogService = auditLogService;
    }

    public List<SettingDto> getAllSettings() {
        return settingsRepository.findAll().stream()
                .map(s -> new SettingDto(s.getSettingKey(), s.getSettingValue(), s.getCategory()))
                .collect(Collectors.toList());
    }

    public String getSettingValue(String key, String defaultValue) {
        return settingsRepository.findBySettingKey(key)
                .map(SystemSettings::getSettingValue)
                .orElse(defaultValue);
    }

    @Transactional
    public SettingDto saveSetting(SettingDto dto, Long currentUserId) {
        SystemSettings setting = settingsRepository.findBySettingKey(dto.getKey())
                .orElse(new SystemSettings());

        setting.setSettingKey(dto.getKey());
        setting.setSettingValue(dto.getValue());
        setting.setCategory(dto.getCategory() != null ? dto.getCategory() : "GENERAL");

        SystemSettings saved = settingsRepository.save(setting);

        auditLogService.log(currentUserId, "UPDATE_SETTING", "SYSTEM_SETTING", saved.getSettingKey(),
                "Updated setting " + saved.getSettingKey() + " = " + saved.getSettingValue());

        return new SettingDto(saved.getSettingKey(), saved.getSettingValue(), saved.getCategory());
    }
}
