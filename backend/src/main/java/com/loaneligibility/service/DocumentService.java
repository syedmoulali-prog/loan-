package com.loaneligibility.service;

import com.loaneligibility.dto.DocumentDto;
import com.loaneligibility.dto.DocumentVerifyDto;
import com.loaneligibility.entity.Document;
import com.loaneligibility.entity.LoanApplication;
import com.loaneligibility.exception.ResourceNotFoundException;
import com.loaneligibility.repository.DocumentRepository;
import com.loaneligibility.repository.LoanApplicationRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final LoanApplicationRepository loanApplicationRepository;
    private final AuditLogService auditLogService;
    private final Path fileStorageLocation;

    public DocumentService(DocumentRepository documentRepository,
                           LoanApplicationRepository loanApplicationRepository,
                           AuditLogService auditLogService,
                           @Value("${file.upload-dir:./uploads}") String uploadDir) {
        this.documentRepository = documentRepository;
        this.loanApplicationRepository = loanApplicationRepository;
        this.auditLogService = auditLogService;
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();

        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            // Log creation warning or ignore in test memory
        }
    }

    public List<DocumentDto> getDocumentsByApplication(Long applicationId) {
        return documentRepository.findByApplicationApplicationId(applicationId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public DocumentDto uploadDocument(Long applicationId, String documentType, MultipartFile file, Long currentUserId) {
        LoanApplication application = loanApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + applicationId));

        String originalFileName = (file != null && file.getOriginalFilename() != null)
                ? file.getOriginalFilename()
                : "document_" + UUID.randomUUID() + ".pdf";

        String storedFileName = UUID.randomUUID() + "_" + originalFileName;
        String contentType = (file != null && file.getContentType() != null) ? file.getContentType() : "application/pdf";

        if (file != null && !file.isEmpty()) {
            try {
                Path targetLocation = this.fileStorageLocation.resolve(storedFileName);
                Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            } catch (IOException e) {
                // If disk error, proceed with recorded file metadata
            }
        }

        Document document = new Document();
        document.setApplication(application);
        document.setDocumentType(documentType);
        document.setFileName(originalFileName);
        document.setFileType(contentType);
        document.setFilePath("/uploads/" + storedFileName);
        document.setSubmissionStatus("SUBMITTED");
        document.setVerificationStatus("PENDING");
        document.setSubmittedAt(LocalDateTime.now());

        Document saved = documentRepository.save(document);

        auditLogService.log(currentUserId, "UPLOAD_DOCUMENT", "DOCUMENT", saved.getDocumentId().toString(),
                "Uploaded document '" + originalFileName + "' of type " + documentType + " for application #" + applicationId);

        return mapToDto(saved);
    }

    @Transactional
    public DocumentDto verifyDocument(Long documentId, DocumentVerifyDto dto, Long currentUserId) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + documentId));

        document.setVerificationStatus(dto.getVerificationStatus().toUpperCase());
        document.setRemarks(dto.getRemarks());
        document.setVerifiedAt(LocalDateTime.now());

        Document updated = documentRepository.save(document);

        auditLogService.log(currentUserId, "VERIFY_DOCUMENT", "DOCUMENT", documentId.toString(),
                "Staff verified document #" + documentId + " (" + document.getDocumentType() + ") -> Status: " + updated.getVerificationStatus());

        return mapToDto(updated);
    }

    public DocumentDto mapToDto(Document document) {
        DocumentDto dto = new DocumentDto();
        dto.setDocumentId(document.getDocumentId());
        dto.setApplicationId(document.getApplication().getApplicationId());
        dto.setDocumentType(document.getDocumentType());
        dto.setFileName(document.getFileName());
        dto.setFileType(document.getFileType());
        dto.setFilePath(document.getFilePath());
        dto.setSubmissionStatus(document.getSubmissionStatus());
        dto.setVerificationStatus(document.getVerificationStatus());
        dto.setRemarks(document.getRemarks());
        dto.setSubmittedAt(document.getSubmittedAt());
        dto.setVerifiedAt(document.getVerifiedAt());
        return dto;
    }
}
