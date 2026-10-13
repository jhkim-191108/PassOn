package com.nextshift.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.UUID;

/** 매니저가 오너에게 올린 카드. 오너 역할을 넘기지 않는다. */
@Entity
@Table(name = "escalations")
public class Escalation extends UuidEntity {
    @Column(name = "store_id", nullable = false)
    private UUID storeId;

    @Column(name = "card_id", nullable = false)
    private UUID cardId;

    @Column(name = "requested_by", nullable = false)
    private UUID requestedBy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EscalationPriority priority;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EscalationStatus status = EscalationStatus.PENDING;

    @Column(name = "resolved_by")
    private UUID resolvedBy;

    @Column(name = "resolved_at")
    private OffsetDateTime resolvedAt;

    /** 매장 id를 반환한다. */
    public UUID getStoreId() {
        return storeId;
    }

    /** 매장 id를 저장한다. */
    public void setStoreId(UUID storeId) {
        this.storeId = storeId;
    }

    /** 올린 카드 id를 반환한다. */
    public UUID getCardId() {
        return cardId;
    }

    /** 올린 카드 id를 저장한다. */
    public void setCardId(UUID cardId) {
        this.cardId = cardId;
    }

    /** 위임을 올린 사용자 id를 반환한다. */
    public UUID getRequestedBy() {
        return requestedBy;
    }

    /** 위임을 올린 사용자 id를 저장한다. */
    public void setRequestedBy(UUID requestedBy) {
        this.requestedBy = requestedBy;
    }

    /** 중요 또는 긴급을 반환한다. */
    public EscalationPriority getPriority() {
        return priority;
    }

    /** 중요 또는 긴급을 저장한다. */
    public void setPriority(EscalationPriority priority) {
        this.priority = priority;
    }

    /** 처리 상태를 반환한다. */
    public EscalationStatus getStatus() {
        return status;
    }

    /** 처리 상태를 저장한다. */
    public void setStatus(EscalationStatus status) {
        this.status = status;
    }

    /** 처리한 오너 id를 반환한다. */
    public UUID getResolvedBy() {
        return resolvedBy;
    }

    /** 처리한 오너 id를 저장한다. */
    public void setResolvedBy(UUID resolvedBy) {
        this.resolvedBy = resolvedBy;
    }

    /** 처리 시각을 반환한다. */
    public OffsetDateTime getResolvedAt() {
        return resolvedAt;
    }

    /** 처리 시각을 저장한다. */
    public void setResolvedAt(OffsetDateTime resolvedAt) {
        this.resolvedAt = resolvedAt;
    }
}