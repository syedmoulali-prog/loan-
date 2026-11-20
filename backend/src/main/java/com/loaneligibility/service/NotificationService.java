package com.loaneligibility.service;

import com.loaneligibility.dto.NotificationDto;
import com.loaneligibility.entity.Customer;
import com.loaneligibility.entity.LoanApplication;
import com.loaneligibility.entity.Notification;
import com.loaneligibility.entity.User;
import com.loaneligibility.exception.ResourceNotFoundException;
import com.loaneligibility.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public Notification createNotification(User user, String recipientRole, String title, String message,
                                           String notificationType, String relatedEntityType, String relatedEntityId) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setRecipientRole(recipientRole);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setNotificationType(notificationType);
        notification.setRelatedEntityType(relatedEntityType);
        notification.setRelatedEntityId(relatedEntityId);
        notification.setIsRead(false);
        return notificationRepository.save(notification);
    }

    @Transactional
    public void notifyAdminCustomerRegistered(Customer customer) {
        String title = "New Customer Registration";
        String timeStr = LocalDateTime.now().format(FORMATTER);
        String message = String.format(
                "Name: %s\nEmail: %s\nPhone: %s\nRegistered: %s",
                customer.getName(),
                customer.getEmail(),
                customer.getPhone(),
                timeStr
        );

        createNotification(
                null,
                "ADMINISTRATOR",
                title,
                message,
                "CUSTOMER_REGISTERED",
                "CUSTOMER",
                customer.getCustomerId().toString()
        );
    }

    @Transactional
    public void notifyAdminLoanApplicationSubmitted(LoanApplication app) {
        String title = "New Loan Application Received";
        String timeStr = LocalDateTime.now().format(FORMATTER);
        String appIdStr = "LA-" + (10000 + app.getApplicationId());
        String message = String.format(
                "Customer: %s\nApplication ID: %s\nLoan Type: %s\nRequested Amount: ₹%s\nTenure: %d months\nSubmitted: %s",
                app.getCustomer().getName(),
                appIdStr,
                app.getLoanType(),
                app.getRequestedAmount().toPlainString(),
                app.getTenure(),
                timeStr
        );

        createNotification(
                null,
                "ADMINISTRATOR",
                title,
                message,
                "LOAN_APPLICATION_SUBMITTED",
                "LOAN_APPLICATION",
                app.getApplicationId().toString()
        );
    }

    @Transactional
    public void notifyCustomerLoanDecision(LoanApplication app, boolean approved, BigDecimal monthlyPayment, String remarks) {
        User recipient = app.getCustomer().getUser();
        if (recipient == null) return;

        String appIdStr = "LA-" + (10000 + app.getApplicationId());
        if (approved) {
            String title = "Loan Application Approved";
            String message = String.format(
                    "Your loan application %s has been approved.\n\nApproved Amount: ₹%s\nMonthly Payment: ₹%s\nTenure: %d months\n\nView Loan Details",
                    appIdStr,
                    app.getRequestedAmount().toPlainString(),
                    monthlyPayment != null ? monthlyPayment.toPlainString() : "N/A",
                    app.getTenure()
            );
            createNotification(
                    recipient,
                    "CUSTOMER",
                    title,
                    message,
                    "LOAN_APPROVED",
                    "LOAN_APPLICATION",
                    app.getApplicationId().toString()
            );
        } else {
            String title = "Loan Application Update";
            String reason = (remarks != null && !remarks.isBlank()) ? remarks : "Application criteria not satisfied";
            String message = String.format(
                    "Your application %s was not approved.\n\nReason:\n%s\n\nView Application",
                    appIdStr,
                    reason
            );
            createNotification(
                    recipient,
                    "CUSTOMER",
                    title,
                    message,
                    "LOAN_REJECTED",
                    "LOAN_APPLICATION",
                    app.getApplicationId().toString()
            );
        }
    }

    public List<NotificationDto> getNotificationsForUser(Long userId, String role) {
        if ("ADMINISTRATOR".equalsIgnoreCase(role)) {
            return notificationRepository.findForUserOrRole(userId, "ADMINISTRATOR").stream()
                    .map(this::mapToDto)
                    .collect(Collectors.toList());
        } else {
            return notificationRepository.findForUserOrRole(userId, "CUSTOMER").stream()
                    .map(this::mapToDto)
                    .collect(Collectors.toList());
        }
    }

    public long getUnreadCountForUser(Long userId, String role) {
        if ("ADMINISTRATOR".equalsIgnoreCase(role)) {
            return notificationRepository.countUnreadForUserOrRole(userId, "ADMINISTRATOR");
        } else {
            return notificationRepository.countUnreadForUserOrRole(userId, "CUSTOMER");
        }
    }

    @Transactional
    public NotificationDto markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + notificationId));
        notification.setIsRead(true);
        notification.setReadAt(LocalDateTime.now());
        return mapToDto(notificationRepository.save(notification));
    }

    @Transactional
    public void markAllAsRead(Long userId, String role) {
        String targetRole = "ADMINISTRATOR".equalsIgnoreCase(role) ? "ADMINISTRATOR" : "CUSTOMER";
        notificationRepository.markAllAsReadForUserOrRole(userId, targetRole);
    }

    public NotificationDto mapToDto(Notification entity) {
        NotificationDto dto = new NotificationDto();
        dto.setNotificationId(entity.getNotificationId());
        dto.setUserId(entity.getUser() != null ? entity.getUser().getUserId() : null);
        dto.setRecipientRole(entity.getRecipientRole());
        dto.setTitle(entity.getTitle());
        dto.setMessage(entity.getMessage());
        dto.setNotificationType(entity.getNotificationType());
        dto.setRelatedEntityType(entity.getRelatedEntityType());
        dto.setRelatedEntityId(entity.getRelatedEntityId());
        dto.setIsRead(entity.getIsRead());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setReadAt(entity.getReadAt());
        return dto;
    }
}
