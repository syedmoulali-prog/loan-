package com.loaneligibility.repository;

import com.loaneligibility.entity.LoanRepayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LoanRepaymentRepository extends JpaRepository<LoanRepayment, Long> {
    Optional<LoanRepayment> findByApplicationApplicationId(Long applicationId);
    boolean existsByApplicationApplicationId(Long applicationId);
}
