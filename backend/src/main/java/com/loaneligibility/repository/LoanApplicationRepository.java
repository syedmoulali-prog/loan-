package com.loaneligibility.repository;

import com.loaneligibility.entity.LoanApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface LoanApplicationRepository extends JpaRepository<LoanApplication, Long> {
    List<LoanApplication> findByCustomerCustomerId(Long customerId);
    List<LoanApplication> findByCustomerCustomerIdOrderByCreatedAtDesc(Long customerId);
    List<LoanApplication> findAllByOrderByCreatedAtDesc();
    List<LoanApplication> findByStatus(String status);
    long countByStatus(String status);

    @Query("SELECT l.status AS status, COUNT(l) AS count FROM LoanApplication l GROUP BY l.status")
    List<Map<String, Object>> countApplicationsByStatus();

    @Query("SELECT l.loanType AS loanType, COUNT(l) AS count FROM LoanApplication l GROUP BY l.loanType")
    List<Map<String, Object>> countApplicationsByLoanType();
}
