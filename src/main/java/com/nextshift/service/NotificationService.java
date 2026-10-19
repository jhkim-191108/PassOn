package com.nextshift.service;

import com.nextshift.api.Views.NotificationView;
import com.nextshift.common.ApiException;
import com.nextshift.common.AuthPrincipal;
import com.nextshift.domain.Notification;
import com.nextshift.domain.NotificationType;
import com.nextshift.domain.User;
import com.nextshift.repo.NotificationRepository;
import com.nextshift.repo.UserRepository;
import com.nextshift.security.StoreGuard;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 알림을 만들고 조회·읽음 처리한다. 켜기가 꺼져 있거나 본인 행동이면 만들지 않는다. */
@Service
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final StoreGuard guard;

    public NotificationService(
            NotificationRepository notificationRepository,
            UserRepository userRepository,
            StoreGuard guard
    ) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.guard = guard;
    }

    /** 담당자에게 배정 알림을 만든다. */
    @Transactional
    public void assignment(UUID storeId, UUID actorId, UUID recipientId, UUID handoffId, UUID cardId, String cardTitle) {
        push(storeId, actorId, recipientId, NotificationType.ASSIGNMENT, handoffId, cardId, "업무가 배정되었습니다", cardTitle);
    }

    /** 긴급 카드가 생기면 작성자를 뺀 멤버에게 알린다. 받는 사람 목록은 호출하는 쪽이 고른다. */
    @Transactional
    public void urgent(UUID storeId, UUID actorId, UUID recipientId, UUID handoffId, UUID cardId, String cardTitle) {
        push(storeId, actorId, recipientId, NotificationType.URGENT, handoffId, cardId, "긴급 업무가 등록되었습니다", cardTitle);
    }

    /** 긴급 공지가 생기면 작성자를 뺀 멤버에게 알린다. 받는 사람 목록은 호출하는 쪽이 고른다. */
    @Transactional
    public void urgentNotice(UUID storeId, UUID actorId, UUID recipientId, String noticeTitle) {
        push(storeId, actorId, recipientId, NotificationType.URGENT, null, null, "긴급 공지가 등록되었습니다", noticeTitle);
    }

    /** 내 업무에 메모가 붙으면 작성자와 담당자에게 알린다. */
    @Transactional
    public void memo(
            UUID storeId,
            UUID actorId,
            UUID authorId,
            UUID assigneeUserId,
            UUID handoffId,
            UUID cardId,
            String memoBody
    ) {
        Set<UUID> recipients = new LinkedHashSet<>();
        if (authorId != null) {
            recipients.add(authorId);
        }
        if (assigneeUserId != null) {
            recipients.add(assigneeUserId);
        }
        for (UUID recipientId : recipients) {
            push(storeId, actorId, recipientId, NotificationType.MEMO, handoffId, cardId, "메모가 추가되었습니다", memoBody);
        }
    }

    /** 내가 쓴 업무가 완료되면 작성자에게 알린다. */
    @Transactional
    public void completed(UUID storeId, UUID actorId, UUID authorId, UUID handoffId, UUID cardId, String cardTitle) {
        push(storeId, actorId, authorId, NotificationType.COMPLETED, handoffId, cardId, "업무가 완료되었습니다", cardTitle);
    }

    /** 내 알림을 최신순으로 돌려준다. */
    @Transactional(readOnly = true)
    public List<NotificationView> list(AuthPrincipal principal, UUID storeId) {
        guard.requireActiveMember(storeId, principal.id());
        return notificationRepository.findByStoreIdAndRecipientIdOrderByCreatedAtDesc(storeId, principal.id()).stream()
                .map(this::toView)
                .toList();
    }

    /** 내 알림 한 건을 읽음 처리한다. */
    @Transactional
    public NotificationView read(AuthPrincipal principal, UUID notificationId) {
        Notification notification = mine(principal, notificationId);
        if (notification.getReadAt() == null) {
            notification.setReadAt(OffsetDateTime.now(ZoneOffset.UTC));
        }
        return toView(notification);
    }

    /** 그 매장의 안 읽은 알림을 모두 읽음 처리하고 개수를 돌려준다. */
    @Transactional
    public int readAll(AuthPrincipal principal, UUID storeId) {
        guard.requireActiveMember(storeId, principal.id());
        List<Notification> unread = notificationRepository.findByStoreIdAndRecipientIdAndReadAtIsNull(storeId, principal.id());
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        for (Notification notification : unread) {
            notification.setReadAt(now);
        }
        return unread.size();
    }

    private Notification mine(AuthPrincipal principal, UUID notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> ApiException.notFound("알림을 찾을 수 없습니다."));
        if (!notification.getRecipientId().equals(principal.id())) {
            throw ApiException.notFound("알림을 찾을 수 없습니다.");
        }
        return notification;
    }

    private void push(
            UUID storeId,
            UUID actorId,
            UUID recipientId,
            NotificationType type,
            UUID handoffId,
            UUID cardId,
            String title,
            String body
    ) {
        if (recipientId == null || recipientId.equals(actorId)) {
            return;
        }
        User user = userRepository.findById(recipientId).orElse(null);
        if (user == null || user.getDeletedAt() != null || !enabled(user, type)) {
            return;
        }
        Notification notification = new Notification();
        notification.setStoreId(storeId);
        notification.setRecipientId(recipientId);
        notification.setType(type);
        notification.setHandoffId(handoffId);
        notification.setCardId(cardId);
        notification.setTitle(trim(title, 120));
        notification.setBody(trim(body, 300));
        notificationRepository.save(notification);
    }

    private static boolean enabled(User user, NotificationType type) {
        return switch (type) {
            case ASSIGNMENT -> user.isNotifyAssignment();
            case URGENT -> user.isNotifyUrgent();
            case MEMO -> user.isNotifyMemo();
            case COMPLETED -> user.isNotifyCompleted();
        };
    }

    private NotificationView toView(Notification notification) {
        return new NotificationView(
                notification.getId(),
                notification.getStoreId(),
                notification.getType(),
                notification.getHandoffId(),
                notification.getCardId(),
                notification.getTitle(),
                notification.getBody(),
                notification.getReadAt() != null,
                notification.getCreatedAt()
        );
    }

    private static String trim(String value, int max) {
        if (value == null) {
            return "";
        }
        String trimmed = value.trim();
        return trimmed.length() <= max ? trimmed : trimmed.substring(0, max);
    }
}