package com.loaneligibility.service;

import com.loaneligibility.dto.FinancialDetailsDto;
import com.loaneligibility.entity.Customer;
import com.loaneligibility.entity.FinancialDetails;
import com.loaneligibility.exception.ResourceNotFoundException;
import com.loaneligibility.repository.CustomerRepository;
import com.loaneligibility.repository.FinancialDetailsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FinancialDetailsService {

    private final FinancialDetailsRepository financialDetailsRepository;
    private final CustomerRepository customerRepository;
    private final AuditLogService auditLogService;

    public FinancialDetailsService(FinancialDetailsRepository financialDetailsRepository,
                                  CustomerRepository customerRepository,
                                  AuditLogService auditLogService) {
        this.financialDetailsRepository = financialDetailsRepository;
        this.customerRepository = customerRepository;
        this.auditLogService = auditLogService;
    }

    public List<FinancialDetailsDto> getFinancialDetailsByCustomer(Long customerId) {
        return financialDetailsRepository.findByCustomerCustomerId(customerId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public FinancialDetailsDto getLatestFinancialDetails(Long customerId) {
        FinancialDetails details = financialDetailsRepository.findFirstByCustomerCustomerIdOrderByCreatedAtDesc(customerId)
                .orElse(null);
        return details != null ? mapToDto(details) : null;
    }

    @Transactional
    public FinancialDetailsDto saveFinancialDetails(Long customerId, FinancialDetailsDto dto, Long currentUserId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + customerId));

        FinancialDetails entity = new FinancialDetails();
        entity.setCustomer(customer);
        entity.setMonthlyIncome(dto.getMonthlyIncome());
        entity.setMonthlyExpenses(dto.getMonthlyExpenses());
        entity.setExistingObligations(dto.getExistingObligations() != null ? dto.getExistingObligations() : BigDecimal.ZERO);
        entity.setCreditInformation(dto.getCreditInformation());

        FinancialDetails saved = financialDetailsRepository.save(entity);

        auditLogService.log(currentUserId, "SAVE_FINANCIAL_DETAILS", "FINANCIAL_DETAILS", saved.getFinancialId().toString(),
                "Saved financial information for customer " + customer.getName() + " with income $" + saved.getMonthlyIncome());

        return mapToDto(saved);
    }

    public FinancialDetailsDto mapToDto(FinancialDetails details) {
        FinancialDetailsDto dto = new FinancialDetailsDto();
        dto.setFinancialId(details.getFinancialId());
        dto.setCustomerId(details.getCustomer().getCustomerId());
        dto.setMonthlyIncome(details.getMonthlyIncome());
        dto.setMonthlyExpenses(details.getMonthlyExpenses());
        dto.setExistingObligations(details.getExistingObligations());
        dto.setCreditInformation(details.getCreditInformation());
        dto.setDebtToIncomeRatio(details.getDebtToIncomeRatio());
        dto.setCreatedAt(details.getCreatedAt());
        return dto;
    }
}
