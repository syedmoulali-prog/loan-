package com.loaneligibility.service;

import com.loaneligibility.dto.LoanRuleDto;
import com.loaneligibility.entity.LoanRule;
import com.loaneligibility.exception.ResourceNotFoundException;
import com.loaneligibility.repository.LoanRuleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class LoanRuleService {

    private final LoanRuleRepository loanRuleRepository;
    private final AuditLogService auditLogService;

    public LoanRuleService(LoanRuleRepository loanRuleRepository, AuditLogService auditLogService) {
        this.loanRuleRepository = loanRuleRepository;
        this.auditLogService = auditLogService;
    }

    public List<LoanRuleDto> getAllRules() {
        return loanRuleRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<LoanRuleDto> getActiveRules() {
        return loanRuleRepository.findByActiveStatusTrue().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public LoanRuleDto getRuleById(Long id) {
        LoanRule rule = loanRuleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rule not found with id: " + id));
        return mapToDto(rule);
    }

    @Transactional
    public LoanRuleDto createRule(LoanRuleDto dto, Long currentUserId) {
        LoanRule rule = new LoanRule(
                dto.getRuleName(),
                dto.getRuleDescription(),
                dto.getRuleValue(),
                dto.getActiveStatus() != null ? dto.getActiveStatus() : true
        );
        LoanRule saved = loanRuleRepository.save(rule);

        auditLogService.log(currentUserId, "CREATE_RULE", "LOAN_RULE", saved.getRuleId().toString(),
                "Created new loan eligibility rule: " + saved.getRuleName() + " (" + saved.getRuleValue() + ")");

        return mapToDto(saved);
    }

    @Transactional
    public LoanRuleDto updateRule(Long id, LoanRuleDto dto, Long currentUserId) {
        LoanRule rule = loanRuleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rule not found with id: " + id));

        rule.setRuleName(dto.getRuleName());
        rule.setRuleDescription(dto.getRuleDescription());
        rule.setRuleValue(dto.getRuleValue());
        if (dto.getActiveStatus() != null) {
            rule.setActiveStatus(dto.getActiveStatus());
        }

        LoanRule updated = loanRuleRepository.save(rule);

        auditLogService.log(currentUserId, "UPDATE_RULE", "LOAN_RULE", id.toString(),
                "Updated loan eligibility rule: " + updated.getRuleName() + " -> " + updated.getRuleValue() + " (Active: " + updated.getActiveStatus() + ")");

        return mapToDto(updated);
    }

    @Transactional
    public LoanRuleDto toggleRuleStatus(Long id, Long currentUserId) {
        LoanRule rule = loanRuleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rule not found with id: " + id));

        rule.setActiveStatus(!rule.getActiveStatus());
        LoanRule updated = loanRuleRepository.save(rule);

        auditLogService.log(currentUserId, "TOGGLE_RULE_STATUS", "LOAN_RULE", id.toString(),
                "Toggled rule " + updated.getRuleName() + " active status to " + updated.getActiveStatus());

        return mapToDto(updated);
    }

    @Transactional
    public void deleteRule(Long id, Long currentUserId) {
        LoanRule rule = loanRuleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rule not found with id: " + id));
        loanRuleRepository.delete(rule);

        auditLogService.log(currentUserId, "DELETE_RULE", "LOAN_RULE", id.toString(),
                "Deleted loan eligibility rule: " + rule.getRuleName());
    }

    public LoanRuleDto mapToDto(LoanRule rule) {
        LoanRuleDto dto = new LoanRuleDto();
        dto.setRuleId(rule.getRuleId());
        dto.setRuleName(rule.getRuleName());
        dto.setRuleDescription(rule.getRuleDescription());
        dto.setRuleValue(rule.getRuleValue());
        dto.setActiveStatus(rule.getActiveStatus());
        dto.setCreatedAt(rule.getCreatedAt());
        dto.setUpdatedAt(rule.getUpdatedAt());
        return dto;
    }
}
