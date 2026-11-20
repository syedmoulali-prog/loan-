package com.loaneligibility.service;

import com.loaneligibility.dto.*;
import com.loaneligibility.entity.Customer;
import com.loaneligibility.entity.User;
import com.loaneligibility.exception.BadRequestException;
import com.loaneligibility.exception.ConflictException;
import com.loaneligibility.exception.ResourceNotFoundException;
import com.loaneligibility.repository.CustomerRepository;
import com.loaneligibility.repository.UserRepository;
import com.loaneligibility.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    public AuthService(UserRepository userRepository,
                       CustomerRepository customerRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtTokenProvider tokenProvider,
                       AuditLogService auditLogService,
                       NotificationService notificationService) {
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.auditLogService = auditLogService;
        this.notificationService = notificationService;
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!"ACTIVE".equalsIgnoreCase(user.getStatus())) {
            throw new BadRequestException("User account is inactive or suspended");
        }

        String token = tokenProvider.generateToken(authentication);

        Long customerId = null;
        if ("CUSTOMER".equalsIgnoreCase(user.getRole())) {
            customerId = customerRepository.findByUser(user)
                    .map(Customer::getCustomerId)
                    .orElse(null);
        }

        auditLogService.log(user.getUserId(), "USER_LOGIN", "USER", user.getUserId().toString(),
                user.getRole() + " " + user.getName() + " logged in successfully");

        return new AuthResponse(token, user.getUserId(), user.getName(), user.getEmail(), user.getRole(), customerId);
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email is already registered: " + request.getEmail());
        }

        String assignedRole = (request.getRole() != null && !request.getRole().isBlank())
                ? request.getRole().toUpperCase()
                : "CUSTOMER";

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(assignedRole);
        user.setStatus("ACTIVE");
        User savedUser = userRepository.save(user);

        Long customerId = null;
        if ("CUSTOMER".equalsIgnoreCase(assignedRole)) {
            Customer customer = new Customer();
            customer.setUser(savedUser);
            customer.setName(request.getName());
            customer.setEmail(request.getEmail());
            customer.setDateOfBirth(request.getDateOfBirth() != null ? request.getDateOfBirth() : LocalDate.of(1995, 1, 1));
            customer.setGender(request.getGender() != null ? request.getGender() : "Not Specified");
            customer.setPhone(request.getPhone() != null ? request.getPhone() : "+1-000-0000");
            customer.setAddress(request.getAddress() != null ? request.getAddress() : "Address not provided");
            customer.setEmploymentType(request.getEmploymentType() != null ? request.getEmploymentType() : "Salaried");
            Customer savedCustomer = customerRepository.save(customer);
            customerId = savedCustomer.getCustomerId();

            // Trigger Administrator notification for new customer registration
            notificationService.notifyAdminCustomerRegistered(savedCustomer);
        }

        auditLogService.log(savedUser.getUserId(), "USER_REGISTER", "USER", savedUser.getUserId().toString(),
                "New user registered: " + savedUser.getEmail() + " with role " + assignedRole);

        String token = tokenProvider.generateTokenFromUsername(savedUser.getEmail(), savedUser.getRole());
        return new AuthResponse(token, savedUser.getUserId(), savedUser.getName(), savedUser.getEmail(), savedUser.getRole(), customerId);
    }

    public UserDto getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return new UserDto(user.getUserId(), user.getName(), user.getEmail(), user.getRole(), user.getStatus(), user.getCreatedAt());
    }

    @Transactional
    public void resetPassword(String email, PasswordResetDto dto) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (dto.getCurrentPassword() != null && !dto.getCurrentPassword().isBlank()) {
            if (!passwordEncoder.matches(dto.getCurrentPassword(), user.getPasswordHash())) {
                throw new BadRequestException("Current password does not match");
            }
        }

        user.setPasswordHash(passwordEncoder.encode(dto.getNewPassword()));
        userRepository.save(user);

        auditLogService.log(user.getUserId(), "RESET_PASSWORD", "USER", user.getUserId().toString(),
                "User changed password successfully");
    }
}
