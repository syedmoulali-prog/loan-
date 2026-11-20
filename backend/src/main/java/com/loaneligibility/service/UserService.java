package com.loaneligibility.service;

import com.loaneligibility.dto.UserDto;
import com.loaneligibility.entity.User;
import com.loaneligibility.exception.BadRequestException;
import com.loaneligibility.exception.ResourceNotFoundException;
import com.loaneligibility.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, AuditLogService auditLogService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditLogService = auditLogService;
    }

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return mapToDto(user);
    }

    @Transactional
    public UserDto updateUser(Long id, UserDto dto, Long currentUserId) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        if (dto.getName() != null && !dto.getName().isBlank()) {
            user.setName(dto.getName());
        }
        if (dto.getRole() != null && !dto.getRole().isBlank()) {
            user.setRole(dto.getRole().toUpperCase());
        }
        if (dto.getStatus() != null && !dto.getStatus().isBlank()) {
            user.setStatus(dto.getStatus().toUpperCase());
        }

        User updated = userRepository.save(user);

        auditLogService.log(currentUserId, "UPDATE_USER", "USER", id.toString(),
                "Updated user " + updated.getEmail() + " (Role: " + updated.getRole() + ", Status: " + updated.getStatus() + ")");

        return mapToDto(updated);
    }

    @Transactional
    public void resetUserPassword(Long id, String newPassword, Long currentUserId) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        if (newPassword == null || newPassword.length() < 6) {
            throw new BadRequestException("Password must be at least 6 characters");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        auditLogService.log(currentUserId, "ADMIN_RESET_PASSWORD", "USER", id.toString(),
                "Administrator reset password for user: " + user.getEmail());
    }

    public UserDto mapToDto(User user) {
        return new UserDto(user.getUserId(), user.getName(), user.getEmail(), user.getRole(), user.getStatus(), user.getCreatedAt());
    }
}
