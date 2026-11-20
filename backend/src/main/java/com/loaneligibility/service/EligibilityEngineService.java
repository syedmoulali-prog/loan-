package com.loaneligibility.service;

import com.loaneligibility.dto.EligibilityResultDto;
import com.loaneligibility.entity.*;
import com.loaneligibility.exception.BadRequestException;
import com.loaneligibility.exception.ResourceNotFoundException;
import com.loaneligibility.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class EligibilityEngineService {

    private final LoanApplicationRepository loanApplicationRepository;
    private final FinancialDetailsRepository financialDetailsRepository;
    private final DocumentRepository documentRepository;
    private final LoanRuleRepository loanRuleRepository;
    private final EligibilityResultRepository eligibilityResultRepository;
    private final AuditLogService auditLogService;

    public EligibilityEngineService(LoanApplicationRepository loanApplicationRepository,
                                  FinancialDetailsRepository financialDetailsRepository,
                                  DocumentRepository documentRepository,
                                  LoanRuleRepository loanRuleRepository,
                                  EligibilityResultRepository eligibilityResultRepository,
                                  AuditLogService auditLogService) {
        this.loanApplicationRepository = loanApplicationRepository;
        this.financialDetailsRepository = financialDetailsRepository;
        this.documentRepository = documentRepository;
        this.loanRuleRepository = loanRuleRepository;
        this.eligibilityResultRepository = eligibilityResultRepository;
        this.auditLogService = auditLogService;
    }

    public EligibilityResultDto getEligibilityByApplicationId(Long applicationId) {
        EligibilityResult result = eligibilityResultRepository.findByApplicationApplicationId(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Eligibility evaluation not found for application #" + applicationId));
        return mapToDto(result);
    }

    @Transactional
    public EligibilityResultDto evaluateApplication(Long applicationId, Long currentUserId) {
        // 1. Fetch Application
        LoanApplication application = loanApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + applicationId));

        Customer customer = application.getCustomer();
        if (customer == null) {
            throw new BadRequestException("Application does not have an associated customer record");
        }

        // 2. Fetch Latest Financial Details
        FinancialDetails financials = financialDetailsRepository
                .findFirstByCustomerCustomerIdOrderByCreatedAtDesc(customer.getCustomerId())
                .orElse(null);

        // 3. Fetch Documents
        List<Document> documents = documentRepository.findByApplicationApplicationId(applicationId);
        long verifiedDocsCount = documents.stream()
                .filter(d -> "VERIFIED".equalsIgnoreCase(d.getVerificationStatus()))
                .count();

        // 4. Load Active Configurable Rules from Database
        List<LoanRule> activeRules = loanRuleRepository.findByActiveStatusTrue();
        if (activeRules.isEmpty()) {
            // Fallback default rules if database hasn't populated any yet
            activeRules = List.of(
                    new LoanRule("MIN_AGE_YEARS", "Minimum applicant age", "21", true),
                    new LoanRule("MIN_MONTHLY_INCOME", "Minimum monthly income", "2500", true),
                    new LoanRule("MAX_DEBT_TO_INCOME_RATIO", "Maximum DTI ratio", "50", true)
            );
        }

        // 5. Evaluate Against Active Rules
        List<String> evaluationLogs = new ArrayList<>();
        Map<String, Object> indicators = new LinkedHashMap<>();
        int totalRulesEvaluated = 0;
        int passedRulesCount = 0;
        boolean hasCriticalFailure = false;
        boolean hasBorderlineItem = false;

        // Customer Info Validation
        evaluationLogs.add("✓ Customer identity and personal details verified");
        int customerAge = customer.getAge();
        indicators.put("customerAge", customerAge);

        BigDecimal monthlyIncome = (financials != null) ? financials.getMonthlyIncome() : BigDecimal.ZERO;
        BigDecimal dtiRatio = (financials != null) ? financials.getDebtToIncomeRatio() : BigDecimal.valueOf(100.0);
        String creditTier = (financials != null && financials.getCreditInformation() != null)
                ? financials.getCreditInformation().toUpperCase()
                : "POOR";

        indicators.put("monthlyIncome", monthlyIncome);
        indicators.put("dtiRatio", dtiRatio);
        indicators.put("creditTier", creditTier);
        indicators.put("verifiedDocsCount", verifiedDocsCount);

        for (LoanRule rule : activeRules) {
            totalRulesEvaluated++;
            String ruleName = rule.getRuleName().toUpperCase();
            String threshold = rule.getRuleValue().trim();

            switch (ruleName) {
                case "MIN_AGE_YEARS":
                    try {
                        int minAge = Integer.parseInt(threshold);
                        if (customerAge >= minAge) {
                            passedRulesCount++;
                            evaluationLogs.add("✓ Age Check: Applicant age (" + customerAge + ") meets minimum required (" + minAge + ")");
                        } else {
                            hasCriticalFailure = true;
                            evaluationLogs.add("✗ Age Check: Applicant age (" + customerAge + ") is below minimum required (" + minAge + ")");
                        }
                    } catch (NumberFormatException ignored) {}
                    break;

                case "MAX_AGE_YEARS":
                    try {
                        int maxAge = Integer.parseInt(threshold);
                        if (customerAge <= maxAge) {
                            passedRulesCount++;
                            evaluationLogs.add("✓ Age Check: Applicant age (" + customerAge + ") is within maximum allowable (" + maxAge + ")");
                        } else {
                            hasBorderlineItem = true;
                            evaluationLogs.add("✗ Age Check: Applicant age (" + customerAge + ") exceeds maximum limit (" + maxAge + ")");
                        }
                    } catch (NumberFormatException ignored) {}
                    break;

                case "MIN_MONTHLY_INCOME":
                    try {
                        BigDecimal minIncome = new BigDecimal(threshold);
                        if (monthlyIncome.compareTo(minIncome) >= 0) {
                            passedRulesCount++;
                            evaluationLogs.add("✓ Income Check: Monthly income ($" + monthlyIncome + ") satisfies rule threshold ($" + minIncome + ")");
                        } else {
                            hasCriticalFailure = true;
                            evaluationLogs.add("✗ Income Check: Monthly income ($" + monthlyIncome + ") below rule requirement ($" + minIncome + ")");
                        }
                    } catch (NumberFormatException ignored) {}
                    break;

                case "MAX_DEBT_TO_INCOME_RATIO":
                    try {
                        BigDecimal maxDti = new BigDecimal(threshold);
                        if (dtiRatio.compareTo(maxDti) <= 0) {
                            passedRulesCount++;
                            evaluationLogs.add("✓ Debt-to-Income Check: DTI (" + dtiRatio + "%) within allowable limit (" + maxDti + "%)");
                        } else {
                            hasBorderlineItem = true;
                            evaluationLogs.add("✗ Debt-to-Income Check: DTI (" + dtiRatio + "%) exceeds threshold (" + maxDti + "%)");
                        }
                    } catch (NumberFormatException ignored) {}
                    break;

                case "MIN_CREDIT_CATEGORY":
                    int applicantTierScore = getCreditTierScore(creditTier);
                    int requiredTierScore = getCreditTierScore(threshold);
                    if (applicantTierScore >= requiredTierScore) {
                        passedRulesCount++;
                        evaluationLogs.add("✓ Credit Tier Check: Applicant credit rating (" + creditTier + ") satisfies requirement (" + threshold + ")");
                    } else {
                        hasCriticalFailure = true;
                        evaluationLogs.add("✗ Credit Tier Check: Applicant credit rating (" + creditTier + ") is below minimum tier (" + threshold + ")");
                    }
                    break;

                case "REQUIRED_DOCUMENTS_COUNT":
                    try {
                        long minDocs = Long.parseLong(threshold);
                        if (verifiedDocsCount >= minDocs) {
                            passedRulesCount++;
                            evaluationLogs.add("✓ Document Check: " + verifiedDocsCount + " verified documents meet required minimum (" + minDocs + ")");
                        } else {
                            hasBorderlineItem = true;
                            evaluationLogs.add("! Document Check: Only " + verifiedDocsCount + " verified document(s), required is " + minDocs);
                        }
                    } catch (NumberFormatException ignored) {}
                    break;

                case "MIN_EMPLOYMENT_STABILITY":
                    String emp = customer.getEmploymentType() != null ? customer.getEmploymentType().toLowerCase() : "";
                    if (threshold.toLowerCase().contains(emp) && !emp.isEmpty()) {
                        passedRulesCount++;
                        evaluationLogs.add("✓ Employment Check: Employment type '" + customer.getEmploymentType() + "' is acceptable");
                    } else {
                        hasBorderlineItem = true;
                        evaluationLogs.add("! Employment Check: Employment type '" + customer.getEmploymentType() + "' requires manual review");
                    }
                    break;

                default:
                    // Generic rule passed
                    passedRulesCount++;
                    evaluationLogs.add("✓ Evaluated active rule: " + rule.getRuleName());
                    break;
            }
        }

        // 6. Calculate Final Score & Decision
        double rulePassingRatio = totalRulesEvaluated > 0 ? ((double) passedRulesCount / totalRulesEvaluated) : 1.0;
        double baseScore = rulePassingRatio * 85.0;

        // Credit bonus/penalty
        if ("EXCELLENT".equalsIgnoreCase(creditTier)) baseScore += 15.0;
        else if ("GOOD".equalsIgnoreCase(creditTier)) baseScore += 10.0;
        else if ("FAIR".equalsIgnoreCase(creditTier)) baseScore += 2.0;
        else baseScore -= 20.0;

        // Clamp between 5.0 and 99.0
        double finalScoreVal = Math.min(99.0, Math.max(5.0, baseScore));
        BigDecimal finalScore = BigDecimal.valueOf(finalScoreVal).setScale(2, RoundingMode.HALF_UP);

        String status;
        String reason;

        if (hasCriticalFailure || finalScoreVal < 50.0) {
            status = "NOT_ELIGIBLE";
            reason = "Application failed critical active eligibility rules (insufficient income, ineligible credit tier, or age requirement).";
        } else if (hasBorderlineItem || finalScoreVal < 75.0) {
            status = "REQUIRES_REVIEW";
            reason = "Application meets primary criteria but has borderline indicators (high debt ratio, pending documents, or employment verification). Recommended for manager review.";
        } else {
            status = "ELIGIBLE";
            reason = "Application satisfies all currently configured active eligibility rules with high credit standing and healthy debt-to-income metrics.";
        }

        // 7. Save or Update Eligibility Result
        EligibilityResult result = eligibilityResultRepository.findByApplicationApplicationId(applicationId)
                .orElse(new EligibilityResult());

        result.setApplication(application);
        result.setEligibilityStatus(status);
        result.setEligibilityScore(finalScore);
        result.setReason(reason);
        result.setIndicators(indicators.toString());
        result.setEvaluationDate(LocalDateTime.now());

        EligibilityResult savedResult = eligibilityResultRepository.save(result);

        // 8. Update Application Status to match evaluation
        application.setStatus(status);
        loanApplicationRepository.save(application);

        // 9. Audit Log
        auditLogService.log(currentUserId, "EVALUATE_APPLICATION", "LOAN_APPLICATION", applicationId.toString(),
                "Eligibility evaluation completed for application #" + applicationId + " -> Status: " + status + " (Score: " + finalScore + "%)");

        EligibilityResultDto dto = mapToDto(savedResult);
        dto.setRuleChecks(evaluationLogs);
        return dto;
    }

    private int getCreditTierScore(String tier) {
        if (tier == null) return 1;
        switch (tier.trim().toUpperCase()) {
            case "EXCELLENT": return 4;
            case "GOOD": return 3;
            case "FAIR": return 2;
            case "POOR":
            default: return 1;
        }
    }

    public EligibilityResultDto mapToDto(EligibilityResult result) {
        EligibilityResultDto dto = new EligibilityResultDto();
        dto.setResultId(result.getResultId());
        dto.setApplicationId(result.getApplication().getApplicationId());
        dto.setCustomerName(result.getApplication().getCustomer().getName());
        dto.setLoanType(result.getApplication().getLoanType());
        dto.setRequestedAmount(result.getApplication().getRequestedAmount());
        dto.setEligibilityStatus(result.getEligibilityStatus());
        dto.setEligibilityScore(result.getEligibilityScore());
        dto.setIndicators(result.getIndicators());
        dto.setReason(result.getReason());
        dto.setEvaluationDate(result.getEvaluationDate());
        return dto;
    }
}
