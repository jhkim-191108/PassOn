package com.nextshift.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

/** 분석 API를 한 번 호출한 기록. 하루 횟수 제한에 쓴다. */
@Entity
@Table(name = "ai_requests")
public class AiRequest {
    @Id
    private UUID id = UUID.randomUUID();

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "handoff_id", nullable = false)
    private UUID handoffId;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now(ZoneOffset.UTC);

    /** 분석을 요청한 사용자 id를 반환한다. */
    public UUID getUserId() {
        return userId;
    }

    /** 분석을 요청한 사용자 id를 저장한다. */
    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    /** 분석 대상 인수인계 id를 저장한다. */
    public void setHandoffId(UUID handoffId) {
        this.handoffId = handoffId;
    }

    /** 요청 시각을 반환한다. */
    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }
}