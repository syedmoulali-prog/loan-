package com.loaneligibility.dto;

import jakarta.validation.constraints.NotBlank;

public class LoanStatusUpdateDto {

    @NotBlank(message = "Status is required")
    private String status;

    private String remarks;

    public LoanStatusUpdateDto() {}

    public LoanStatusUpdateDto(String status, String remarks) {
        this.status = status;
        this.remarks = remarks;
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}
