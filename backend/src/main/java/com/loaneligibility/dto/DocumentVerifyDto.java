package com.loaneligibility.dto;

import jakarta.validation.constraints.NotBlank;

public class DocumentVerifyDto {

    @NotBlank(message = "Verification status is required (VERIFIED or REJECTED)")
    private String verificationStatus;

    private String remarks;

    public DocumentVerifyDto() {}

    public DocumentVerifyDto(String verificationStatus, String remarks) {
        this.verificationStatus = verificationStatus;
        this.remarks = remarks;
    }

    public String getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(String verificationStatus) { this.verificationStatus = verificationStatus; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}
