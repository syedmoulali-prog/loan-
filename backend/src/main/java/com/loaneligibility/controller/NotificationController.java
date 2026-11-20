package com.loaneligibility.controller;

import com.loaneligibility.dto.NotificationDto;
import com.loaneligibility.entity.User;
import com.loaneligibility.repository.UserRepository;
import com.loaneligibility.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public NotificationController(NotificationService notificationService, UserRepository userRepository) {
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    private User getCurrentUser(Authentication auth) {
        if (auth == null) return null;
        return userRepository.findByEmail(auth.getName()).orElse(null);
    }

    @GetMapping
    public ResponseEntity<List<NotificationDto>> getNotifications(Authentication auth) {
        User user = getCurrentUser(auth);
        if (user == null) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(notificationService.getNotificationsForUser(user.getUserId(), user.getRole()));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(Authentication auth) {
        User user = getCurrentUser(auth);
        if (user == null) {
            return ResponseEntity.ok(Map.of("unreadCount", 0L));
        }
        long count = notificationService.getUnreadCountForUser(user.getUserId(), user.getRole());
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<NotificationDto> markAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.markAsRead(id));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Map<String, String>> markAllAsRead(Authentication auth) {
        User user = getCurrentUser(auth);
        if (user != null) {
            notificationService.markAllAsRead(user.getUserId(), user.getRole());
        }
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }
}
