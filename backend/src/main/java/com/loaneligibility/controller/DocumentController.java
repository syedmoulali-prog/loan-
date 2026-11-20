package com.loaneligibility.controller;

import com.loaneligibility.dto.DocumentDto;
import com.loaneligibility.dto.DocumentVerifyDto;
import com.loaneligibility.entity.User;
import com.loaneligibility.repository.UserRepository;
import com.loaneligibility.service.DocumentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api")
public class DocumentController {

    private final DocumentService documentService;
    private final UserRepository userRepository;

    public DocumentController(DocumentService documentService, UserRepository userRepository) {
        this.documentService = documentService;
        this.userRepository = userRepository;
    }

    private Long getCurrentUserId(Authentication auth) {
        if (auth == null) return null;
        return userRepository.findByEmail(auth.getName())
                .map(User::getUserId)
                .orElse(null);
    }

    @GetMapping("/applications/{applicationId}/documents")
    public ResponseEntity<List<DocumentDto>> getDocumentsByApplication(@PathVariable Long applicationId) {
        return ResponseEntity.ok(documentService.getDocumentsByApplication(applicationId));
    }

    @PostMapping(value = "/applications/{applicationId}/documents", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE, MediaType.APPLICATION_JSON_VALUE})
    public ResponseEntity<DocumentDto> uploadDocument(
            @PathVariable Long applicationId,
            @RequestParam("documentType") String documentType,
            @RequestPart(value = "file", required = false) MultipartFile file,
            Authentication authentication) {
        DocumentDto uploaded = documentService.uploadDocument(applicationId, documentType, file, getCurrentUserId(authentication));
        return new ResponseEntity<>(uploaded, HttpStatus.CREATED);
    }

    @PutMapping("/documents/{id}/verify")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'STAFF')")
    public ResponseEntity<DocumentDto> verifyDocument(
            @PathVariable Long id,
            @Valid @RequestBody DocumentVerifyDto dto,
            Authentication authentication) {
        DocumentDto verified = documentService.verifyDocument(id, dto, getCurrentUserId(authentication));
        return ResponseEntity.ok(verified);
    }
}
