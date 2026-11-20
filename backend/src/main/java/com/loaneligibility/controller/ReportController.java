package com.loaneligibility.controller;

import com.loaneligibility.dto.LoanApplicationDto;
import com.loaneligibility.dto.ReportFilterDto;
import com.loaneligibility.service.ReportService;
import org.springframework.core.io.InputStreamResource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@PreAuthorize("hasAnyRole('ADMINISTRATOR', 'REVIEWER')")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/applications")
    public ResponseEntity<List<LoanApplicationDto>> getApplicationReport(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String loanType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) BigDecimal minAmount,
            @RequestParam(required = false) BigDecimal maxAmount) {

        ReportFilterDto filter = new ReportFilterDto();
        filter.setStatus(status);
        filter.setLoanType(loanType);
        filter.setStartDate(startDate);
        filter.setEndDate(endDate);
        filter.setMinAmount(minAmount);
        filter.setMaxAmount(maxAmount);

        return ResponseEntity.ok(reportService.getApplicationReport(filter));
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getReportSummary() {
        return ResponseEntity.ok(reportService.getReportSummary());
    }

    @GetMapping("/export/csv")
    public ResponseEntity<InputStreamResource> exportCsv(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String loanType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        ReportFilterDto filter = new ReportFilterDto();
        filter.setStatus(status);
        filter.setLoanType(loanType);
        filter.setStartDate(startDate);
        filter.setEndDate(endDate);

        ByteArrayInputStream in = reportService.exportApplicationsToCsv(filter);
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=loan_applications_report.csv");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(new InputStreamResource(in));
    }
}
