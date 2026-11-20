package com.loaneligibility.repository;

import com.loaneligibility.entity.LoanRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LoanRuleRepository extends JpaRepository<LoanRule, Long> {
    List<LoanRule> findByActiveStatusTrue();
    Optional<LoanRule> findByRuleName(String ruleName);
}
