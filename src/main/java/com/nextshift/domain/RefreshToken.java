package com.nextshift.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

/** 재발급용 토큰. 원문은 쿠키에만 두고, DB에는 해시만 저장한다. */
@Entity
@Table(name = "refresh_tokens")
public class RefreshToken {
    @Id
    private UUID id = UUID.randomUUID();

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "token_hash", nullable = false)
    private String tokenHash;

    @Column(name = "expires_at", nullable = false)
    private OffsetDateTime expiresAt;

    @Column(name = "revoked_at")
    private OffsetDateTime revokedAt;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now(ZoneOffset.UTC);

    /** 토큰 행 id를 반환한다. */
    public UUID getId() {
        return id;
    }

    /** 토큰 주인 사용자 id를 반환한다. */
    public UUID getUserId() {
        return userId;
    }

    /** 토큰 주인 사용자 id를 저장한다. */
    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    /** 리프레시 토큰 해시를 반환한다. */
    public String getTokenHash() {
        return tokenHash;
    }

    /** 리프레시 토큰 해시를 저장한다. */
    public void setTokenHash(String tokenHash) {
        this.tokenHash = tokenHash;
    }

    /** 만료 시각을 반환한다. */
    public OffsetDateTime getExpiresAt() {
        return expiresAt;
    }

    /** 만료 시각을 저장한다. */
    public void setExpiresAt(OffsetDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    /** 폐기 시각을 반환한다. null이면 아직 쓸 수 있다. */
    public OffsetDateTime getRevokedAt() {
        return revokedAt;
    }

    /** 폐기 시각을 저장한다. */
    public void setRevokedAt(OffsetDateTime revokedAt) {
        this.revokedAt = revokedAt;
    }
}