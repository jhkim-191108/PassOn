package com.nextshift.repo;

import com.nextshift.domain.Notification;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

/** 사용자별 매장 알림. */
public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    List<Notification> findByStoreIdAndRecipientIdOrderByCreatedAtDesc(UUID storeId, UUID recipientId);

    List<Notification> findByStoreIdAndRecipientIdAndReadAtIsNull(UUID storeId, UUID recipientId);
}