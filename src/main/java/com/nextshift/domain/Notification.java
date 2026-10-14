package com.nextshift.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.UUID;

/** 매장 안 웹 알림. readAt이 있으면 읽은 알림이다. */
@Entity
@Table(name = "notifications")
public class Notification extends UuidEntity {
    @Column(name = "store_id", nullable = false)
    private UUID storeId;

    @Column(name = "recipient_id", nullable = false)
    private UUID recipientId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private NotificationType type;

    @Column(name = "handoff_id")
    private UUID handoffId;

    @Column(name = "card_id")
    private UUID cardId;

    @Column(nullable = false, length = 120)
    private String title;

    @Column(nullable = false, length = 300)
    private String body;

    @Column(name = "read_at")
    private OffsetDateTime readAt;

    /** 매장 id를 반환한다. */
    public UUID getStoreId() {
        return storeId;
    }

    /** 매장 id를 저장한다. */
    public void setStoreId(UUID storeId) {
        this.storeId = storeId;
    }

    /** 알림을 받을 사용자 id를 반환한다. */
    public UUID getRecipientId() {
        return recipientId;
    }

    /** 알림을 받을 사용자 id를 저장한다. */
    public void setRecipientId(UUID recipientId) {
        this.recipientId = recipientId;
    }

    /** 알림 종류를 반환한다. */
    public NotificationType getType() {
        return type;
    }

    /** 알림 종류를 저장한다. */
    public void setType(NotificationType type) {
        this.type = type;
    }

    /** 관련 인수인계 id를 반환한다. */
    public UUID getHandoffId() {
        return handoffId;
    }

    /** 관련 인수인계 id를 저장한다. */
    public void setHandoffId(UUID handoffId) {
        this.handoffId = handoffId;
    }

    /** 관련 카드 id를 반환한다. */
    public UUID getCardId() {
        return cardId;
    }

    /** 관련 카드 id를 저장한다. */
    public void setCardId(UUID cardId) {
        this.cardId = cardId;
    }

    /** 알림 제목을 반환한다. */
    public String getTitle() {
        return title;
    }

    /** 알림 제목을 저장한다. */
    public void setTitle(String title) {
        this.title = title;
    }

    /** 알림 본문을 반환한다. */
    public String getBody() {
        return body;
    }

    /** 알림 본문을 저장한다. */
    public void setBody(String body) {
        this.body = body;
    }

    /** 읽은 시각을 반환한다. null이면 아직 안 읽었다. */
    public OffsetDateTime getReadAt() {
        return readAt;
    }

    /** 읽은 시각을 저장한다. */
    public void setReadAt(OffsetDateTime readAt) {
        this.readAt = readAt;
    }
}