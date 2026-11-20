package com.loaneligibility.repository;

import com.loaneligibility.entity.EligibilityResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EligibilityResultRepository extends JpaRepository<EligibilityResult, Long> {
    Optional<EligibilityResult> findByApplicationApplicationId(Long applicationId);
    long countByEligibilityStatus(String eligibilityStatus);
}
