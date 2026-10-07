package com.nextshift.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import java.io.Serializable;
import java.time.OffsetDateTime;
import java.util.Objects;
import java.util.UUID;

/** 누가 어느 인수인계를 읽었는지. 인수인계 id와 사용자 id가 복합키다. */
@Entity
@Table(name = "handoff_reads")
@IdClass(HandoffRead.Key.class)
public class HandoffRead {
    @Id
    @Column(name = "handoff_id")
    private UUID handoffId;

    @Id
    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "read_at", nullable = false)
    private OffsetDateTime readAt;

    /** 읽은 인수인계 id를 반환한다. */
    public UUID getHandoffId() {
        return handoffId;
    }

    /** 읽은 인수인계 id를 저장한다. */
    public void setHandoffId(UUID handoffId) {
        this.handoffId = handoffId;
    }

    /** 읽은 사용자 id를 반환한다. */
    public UUID getUserId() {
        return userId;
    }

    /** 읽은 사용자 id를 저장한다. */
    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    /** 읽은 시각을 반환한다. */
    public OffsetDateTime getReadAt() {
        return readAt;
    }

    /** 읽은 시각을 저장한다. */
    public void setReadAt(OffsetDateTime readAt) {
        this.readAt = readAt;
    }

    /** 인수인계 id와 사용자 id를 묶은 복합키. */
    public static class Key implements Serializable {
        private UUID handoffId;
        private UUID userId;

        public Key() {}

        public Key(UUID handoffId, UUID userId) {
            this.handoffId = handoffId;
            this.userId = userId;
        }

        @Override
        public boolean equals(Object other) {
            if (this == other) {
                return true;
            }
            if (!(other instanceof Key that)) {
                return false;
            }
            return Objects.equals(handoffId, that.handoffId) && Objects.equals(userId, that.userId);
        }

        @Override
        public int hashCode() {
            return Objects.hash(handoffId, userId);
        }
    }
}