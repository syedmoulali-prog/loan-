package com.loaneligibility.service;

import com.loaneligibility.dto.CustomerCreateDto;
import com.loaneligibility.dto.CustomerDto;
import com.loaneligibility.entity.Customer;
import com.loaneligibility.exception.BadRequestException;
import com.loaneligibility.exception.ResourceNotFoundException;
import com.loaneligibility.repository.CustomerRepository;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final AuditLogService auditLogService;

    public CustomerService(CustomerRepository customerRepository, AuditLogService auditLogService) {
        this.customerRepository = customerRepository;
        this.auditLogService = auditLogService;
    }

    public List<CustomerDto> getAllCustomers() {
        return customerRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public CustomerDto getCustomerById(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));
        return mapToDto(customer);
    }

    public CustomerDto getCustomerByUserId(Long userId) {
        Customer customer = customerRepository.findByUserUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found for user id: " + userId));
        return mapToDto(customer);
    }

    @Transactional
    public CustomerDto createCustomer(CustomerCreateDto dto, Long currentUserId) {
        Customer customer = new Customer();
        customer.setName(dto.getName());
        customer.setDateOfBirth(dto.getDateOfBirth());
        customer.setGender(dto.getGender());
        customer.setPhone(dto.getPhone());
        customer.setEmail(dto.getEmail());
        customer.setAddress(dto.getAddress());
        customer.setEmploymentType(dto.getEmploymentType());

        Customer saved = customerRepository.save(customer);

        auditLogService.log(currentUserId, "CREATE_CUSTOMER", "CUSTOMER", saved.getCustomerId().toString(),
                "Created new customer profile for " + saved.getName());

        return mapToDto(saved);
    }

    @Transactional
    public CustomerDto updateCustomer(Long id, CustomerCreateDto dto, Long currentUserId) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));

        customer.setName(dto.getName());
        customer.setDateOfBirth(dto.getDateOfBirth());
        customer.setGender(dto.getGender());
        customer.setPhone(dto.getPhone());
        customer.setEmail(dto.getEmail());
        customer.setAddress(dto.getAddress());
        customer.setEmploymentType(dto.getEmploymentType());

        Customer updated = customerRepository.save(customer);

        auditLogService.log(currentUserId, "UPDATE_CUSTOMER", "CUSTOMER", updated.getCustomerId().toString(),
                "Updated customer profile for " + updated.getName());

        return mapToDto(updated);
    }

    @Transactional
    public void deleteCustomer(Long id, Long currentUserId) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));
        customerRepository.delete(customer);

        auditLogService.log(currentUserId, "DELETE_CUSTOMER", "CUSTOMER", id.toString(),
                "Deleted customer profile " + customer.getName());
    }

    private static final String UPLOAD_DIR = "uploads/profiles";
    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp", "image/gif", "image/jpg"
    );

    @Transactional
    public CustomerDto uploadProfilePhoto(Long customerId, MultipartFile file, Long currentUserId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + customerId));

        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Uploaded image file cannot be empty");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase())) {
            throw new BadRequestException("Only JPEG, PNG, WEBP, or GIF images are supported (received: " + contentType + ")");
        }

        // Limit size to 5MB
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new BadRequestException("Image file size cannot exceed 5MB");
        }

        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Remove previous photo if existed
            if (customer.getProfilePhoto() != null) {
                try {
                    Path oldFilePath = uploadPath.resolve(customer.getProfilePhoto()).normalize();
                    Files.deleteIfExists(oldFilePath);
                } catch (Exception ignored) {}
            }

            String originalName = file.getOriginalFilename();
            String extension = ".jpg";
            if (originalName != null && originalName.lastIndexOf('.') > 0) {
                extension = originalName.substring(originalName.lastIndexOf('.')).toLowerCase();
            }

            String filename = "customer_" + customerId + "_" + System.currentTimeMillis() + extension;
            Path targetLocation = uploadPath.resolve(filename).normalize();
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            customer.setProfilePhoto(filename);
            Customer saved = customerRepository.save(customer);

            auditLogService.log(currentUserId, "UPLOAD_PROFILE_PHOTO", "CUSTOMER", customerId.toString(),
                    "Uploaded new profile photo for customer " + customer.getName());

            return mapToDto(saved);
        } catch (IOException ex) {
            throw new RuntimeException("Failed to store profile photo: " + ex.getMessage(), ex);
        }
    }

    public Resource loadProfilePhoto(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + customerId));

        if (customer.getProfilePhoto() == null || customer.getProfilePhoto().isBlank()) {
            throw new ResourceNotFoundException("Customer does not have a profile photo uploaded");
        }

        try {
            Path filePath = Paths.get(UPLOAD_DIR).resolve(customer.getProfilePhoto()).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("Profile photo file not found on server");
            }
        } catch (MalformedURLException ex) {
            throw new ResourceNotFoundException("Profile photo file not found: " + ex.getMessage());
        }
    }

    @Transactional
    public CustomerDto deleteProfilePhoto(Long customerId, Long currentUserId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + customerId));

        if (customer.getProfilePhoto() != null) {
            try {
                Path filePath = Paths.get(UPLOAD_DIR).resolve(customer.getProfilePhoto()).normalize();
                Files.deleteIfExists(filePath);
            } catch (Exception ignored) {}
            customer.setProfilePhoto(null);
            Customer saved = customerRepository.save(customer);

            auditLogService.log(currentUserId, "DELETE_PROFILE_PHOTO", "CUSTOMER", customerId.toString(),
                    "Removed profile photo for customer " + customer.getName());

            return mapToDto(saved);
        }

        return mapToDto(customer);
    }

    public CustomerDto mapToDto(Customer customer) {
        CustomerDto dto = new CustomerDto();
        dto.setCustomerId(customer.getCustomerId());
        dto.setUserId(customer.getUser() != null ? customer.getUser().getUserId() : null);
        dto.setName(customer.getName());
        dto.setDateOfBirth(customer.getDateOfBirth());
        dto.setAge(customer.getAge());
        dto.setGender(customer.getGender());
        dto.setPhone(customer.getPhone());
        dto.setEmail(customer.getEmail());
        dto.setAddress(customer.getAddress());
        dto.setEmploymentType(customer.getEmploymentType());
        dto.setProfilePhoto(customer.getProfilePhoto());
        dto.setCreatedAt(customer.getCreatedAt());
        return dto;
    }
}
