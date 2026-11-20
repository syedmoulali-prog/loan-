package com.loaneligibility.repository;

import com.loaneligibility.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByApplicationApplicationId(Long applicationId);
    long countByApplicationApplicationIdAndVerificationStatus(Long applicationId, String verificationStatus);
    long countByVerificationStatus(String verificationStatus);
}
