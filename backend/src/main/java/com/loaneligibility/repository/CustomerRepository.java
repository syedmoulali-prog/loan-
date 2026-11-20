package com.loaneligibility.repository;

import com.loaneligibility.entity.Customer;
import com.loaneligibility.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByUser(User user);
    Optional<Customer> findByEmail(String email);
    Optional<Customer> findByUserUserId(Long userId);
}
