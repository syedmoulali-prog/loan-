package com.loaneligibility.controller;

import com.loaneligibility.service.BackupService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/backup")
@PreAuthorize("hasRole('ADMINISTRATOR')")
public class BackupController {

    private final BackupService backupService;

    public BackupController(BackupService backupService) {
        this.backupService = backupService;
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus() {
        return ResponseEntity.ok(backupService.getBackupStatus());
    }

    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createBackup() throws IOException {
        backupService.createBackupData();
        return ResponseEntity.ok(Map.of(
                "status", "SUCCESS",
                "message", "Database backup created successfully"
        ));
    }

    @GetMapping("/download")
    public ResponseEntity<byte[]> downloadBackup() throws IOException {
        byte[] data = backupService.createBackupData();
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String filename = "loan_eligibility_backup_" + timestamp + ".json";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_JSON)
                .body(data);
    }
}
