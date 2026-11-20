package com.loaneligibility.repository;

import com.loaneligibility.entity.FinancialDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FinancialDetailsRepository extends JpaRepository<FinancialDetails, Long> {
    List<FinancialDetails> findByCustomerCustomerId(Long customerId);
    Optional<FinancialDetails> findFirstByCustomerCustomerIdOrderByCreatedAtDesc(Long customerId);
}
