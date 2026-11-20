package com.loaneligibility.repository;

import com.loaneligibility.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    @Query("SELECT n FROM Notification n WHERE (n.user.userId = :userId) OR (n.user IS NULL AND n.recipientRole = :role) ORDER BY n.createdAt DESC")
    List<Notification> findForUserOrRole(@Param("userId") Long userId, @Param("role") String role);

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.isRead = false AND ((n.user.userId = :userId) OR (n.user IS NULL AND n.recipientRole = :role))")
    long countUnreadForUserOrRole(@Param("userId") Long userId, @Param("role") String role);

    List<Notification> findByRecipientRoleOrderByCreatedAtDesc(String role);

    long countByRecipientRoleAndIsReadFalse(String role);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = CURRENT_TIMESTAMP WHERE (n.user.userId = :userId) OR (n.user IS NULL AND n.recipientRole = :role)")
    void markAllAsReadForUserOrRole(@Param("userId") Long userId, @Param("role") String role);
}
