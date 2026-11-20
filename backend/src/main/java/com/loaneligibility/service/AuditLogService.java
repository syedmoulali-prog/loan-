package com.loaneligibility.service;

import com.loaneligibility.dto.AuditLogDto;
import com.loaneligibility.entity.AuditLog;
import com.loaneligibility.entity.User;
import com.loaneligibility.repository.AuditLogRepository;
import com.loaneligibility.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public AuditLogService(AuditLogRepository auditLogRepository, UserRepository userRepository) {
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
    }

    public void log(Long userId, String action, String entityType, String entityId, String description) {
        AuditLog auditLog = new AuditLog(userId, action, entityType, entityId, description);
        auditLogRepository.save(auditLog);
    }

    public List<AuditLogDto> getAllLogs() {
        return auditLogRepository.findTop50ByOrderByTimestampDesc().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<AuditLogDto> getLogsByEntity(String entityType) {
        return auditLogRepository.findByEntityTypeOrderByTimestampDesc(entityType).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private AuditLogDto mapToDto(AuditLog log) {
        AuditLogDto dto = new AuditLogDto();
        dto.setAuditId(log.getAuditId());
        dto.setUserId(log.getUserId());
        dto.setAction(log.getAction());
        dto.setEntityType(log.getEntityType());
        dto.setEntityId(log.getEntityId());
        dto.setDescription(log.getDescription());
        dto.setTimestamp(log.getTimestamp());

        if (log.getUserId() != null) {
            userRepository.findById(log.getUserId()).ifPresent(user -> dto.setUserName(user.getName()));
        } else {
            dto.setUserName("System");
        }
        return dto;
    }
}
