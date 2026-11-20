package com.loaneligibility.repository;

import com.loaneligibility.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findAllByOrderByTimestampDesc();
    List<AuditLog> findTop50ByOrderByTimestampDesc();
    List<AuditLog> findByEntityTypeOrderByTimestampDesc(String entityType);
}
