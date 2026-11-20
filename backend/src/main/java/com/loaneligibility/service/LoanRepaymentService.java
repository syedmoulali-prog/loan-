package com.loaneligibility.service;

import com.loaneligibility.dto.LoanRepaymentDto;
import com.loaneligibility.entity.LoanApplication;
import com.loaneligibility.entity.LoanRepayment;
import com.loaneligibility.exception.ResourceNotFoundException;
import com.loaneligibility.repository.LoanRepaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;

@Service
@Transactional(readOnly = true)
public class LoanRepaymentService {

    private final LoanRepaymentRepository repaymentRepository;

    public LoanRepaymentService(LoanRepaymentRepository repaymentRepository) {
        this.repaymentRepository = repaymentRepository;
    }

    /**
     * Standard EMI Formula:
     * EMI = P * r * (1 + r)^n / ((1 + r)^n - 1)
     * where:
     * P = approved principal amount
     * r = monthly interest rate = annualRate / 12 / 100
     * n = tenure in months
     */
    public BigDecimal calculateMonthlyPayment(BigDecimal principal, BigDecimal annualInterestRate, int tenureMonths) {
        if (principal == null || principal.compareTo(BigDecimal.ZERO) <= 0 || tenureMonths <= 0) {
            return BigDecimal.ZERO;
        }

        if (annualInterestRate == null || annualInterestRate.compareTo(BigDecimal.ZERO) <= 0) {
            return principal.divide(BigDecimal.valueOf(tenureMonths), 2, RoundingMode.HALF_UP);
        }

        double p = principal.doubleValue();
        double r = annualInterestRate.doubleValue() / 1200.0; // monthly rate
        int n = tenureMonths;

        double factor = Math.pow(1.0 + r, n);
        double emi = (p * r * factor) / (factor - 1.0);

        return BigDecimal.valueOf(emi).setScale(2, RoundingMode.HALF_UP);
    }

    @Transactional
    public LoanRepayment calculateAndSaveRepayment(LoanApplication application, BigDecimal annualInterestRate) {
        if (annualInterestRate == null || annualInterestRate.compareTo(BigDecimal.ZERO) <= 0) {
            annualInterestRate = BigDecimal.valueOf(10.00); // 10% default
        }

        BigDecimal principal = application.getRequestedAmount();
        int tenure = application.getTenure() != null && application.getTenure() > 0 ? application.getTenure() : 12;

        BigDecimal emi = calculateMonthlyPayment(principal, annualInterestRate, tenure);
        BigDecimal totalPayable = emi.multiply(BigDecimal.valueOf(tenure)).setScale(2, RoundingMode.HALF_UP);

        LoanRepayment repayment = repaymentRepository.findByApplicationApplicationId(application.getApplicationId())
                .orElse(new LoanRepayment());

        repayment.setApplication(application);
        repayment.setApprovedAmount(principal);
        repayment.setInterestRate(annualInterestRate);
        repayment.setTenureMonths(tenure);
        repayment.setMonthlyPayment(emi);
        repayment.setTotalPayable(totalPayable);
        repayment.setRemainingBalance(totalPayable);
        repayment.setPaymentsCompleted(0);
        repayment.setNextPaymentDate(LocalDate.now().plusMonths(1));

        return repaymentRepository.save(repayment);
    }

    public LoanRepaymentDto getRepaymentByApplicationId(Long applicationId) {
        LoanRepayment repayment = repaymentRepository.findByApplicationApplicationId(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Repayment schedule not found for application id: " + applicationId));
        return mapToDto(repayment);
    }

    public LoanRepaymentDto mapToDto(LoanRepayment entity) {
        LoanRepaymentDto dto = new LoanRepaymentDto();
        dto.setRepaymentId(entity.getRepaymentId());
        dto.setApplicationId(entity.getApplication() != null ? entity.getApplication().getApplicationId() : null);
        dto.setApprovedAmount(entity.getApprovedAmount());
        dto.setInterestRate(entity.getInterestRate());
        dto.setTenureMonths(entity.getTenureMonths());
        dto.setMonthlyPayment(entity.getMonthlyPayment());
        dto.setTotalPayable(entity.getTotalPayable());
        dto.setRemainingBalance(entity.getRemainingBalance());
        dto.setPaymentsCompleted(entity.getPaymentsCompleted());
        dto.setNextPaymentDate(entity.getNextPaymentDate());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }
}
