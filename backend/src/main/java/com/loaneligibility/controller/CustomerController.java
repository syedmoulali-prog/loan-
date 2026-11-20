package com.loaneligibility.controller;

import com.loaneligibility.dto.CustomerCreateDto;
import com.loaneligibility.dto.CustomerDto;
import com.loaneligibility.entity.User;
import com.loaneligibility.repository.UserRepository;
import com.loaneligibility.service.CustomerService;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerService customerService;
    private final UserRepository userRepository;

    public CustomerController(CustomerService customerService, UserRepository userRepository) {
        this.customerService = customerService;
        this.userRepository = userRepository;
    }

    private Long getCurrentUserId(Authentication auth) {
        if (auth == null) return null;
        return userRepository.findByEmail(auth.getName())
                .map(User::getUserId)
                .orElse(null);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'STAFF', 'REVIEWER')")
    public ResponseEntity<List<CustomerDto>> getAllCustomers() {
        return ResponseEntity.ok(customerService.getAllCustomers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CustomerDto> getCustomerById(@PathVariable Long id) {
        return ResponseEntity.ok(customerService.getCustomerById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<CustomerDto> getCustomerByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(customerService.getCustomerByUserId(userId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'STAFF', 'CUSTOMER')")
    public ResponseEntity<CustomerDto> createCustomer(
            @Valid @RequestBody CustomerCreateDto dto,
            Authentication authentication) {
        CustomerDto created = customerService.createCustomer(dto, getCurrentUserId(authentication));
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'STAFF', 'CUSTOMER')")
    public ResponseEntity<CustomerDto> updateCustomer(
            @PathVariable Long id,
            @Valid @RequestBody CustomerCreateDto dto,
            Authentication authentication) {
        CustomerDto updated = customerService.updateCustomer(id, dto, getCurrentUserId(authentication));
        return ResponseEntity.ok(updated);
    }

    @PostMapping(value = "/{id}/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'STAFF', 'CUSTOMER')")
    public ResponseEntity<CustomerDto> uploadProfilePhoto(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        CustomerDto updated = customerService.uploadProfilePhoto(id, file, getCurrentUserId(authentication));
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/{id}/photo")
    public ResponseEntity<Resource> getProfilePhoto(@PathVariable Long id) {
        Resource resource = customerService.loadProfilePhoto(id);
        String contentType = "image/jpeg";
        try {
            String probed = Files.probeContentType(resource.getFile().toPath());
            if (probed != null) {
                contentType = probed;
            }
        } catch (IOException ignored) {}

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    @DeleteMapping("/{id}/photo")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'CUSTOMER')")
    public ResponseEntity<CustomerDto> deleteProfilePhoto(
            @PathVariable Long id,
            Authentication authentication) {
        CustomerDto updated = customerService.deleteProfilePhoto(id, getCurrentUserId(authentication));
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<Map<String, String>> deleteCustomer(
            @PathVariable Long id,
            Authentication authentication) {
        customerService.deleteCustomer(id, getCurrentUserId(authentication));
        return ResponseEntity.ok(Map.of("message", "Customer profile deleted successfully"));
    }
}
