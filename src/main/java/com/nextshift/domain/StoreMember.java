package com.nextshift.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.UUID;

/** 사용자와 매장의 소속. 역할, 재직 상태, 팀 id를 같이 가진다. */
@Entity
@Table(name = "store_members")
public class StoreMember extends UuidEntity {
    @Column(name = "store_id", nullable = false)
    private UUID storeId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StoreRole role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MemberStatus status;

    /** 배정된 팀. 없으면 미배정. */
    @Column(name = "team_id")
    private UUID teamId;

    /** 퇴사로 바꾼 시각. 재직이나 정지로 돌아오면 비운다. */
    @Column(name = "left_at")
    private OffsetDateTime leftAt;

    /** 소속 매장 id를 반환한다. */
    public UUID getStoreId() {
        return storeId;
    }

    /** 소속 매장 id를 저장한다. */
    public void setStoreId(UUID storeId) {
        this.storeId = storeId;
    }

    /** 소속 사용자 id를 반환한다. */
    public UUID getUserId() {
        return userId;
    }

    /** 소속 사용자 id를 저장한다. */
    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    /** 매장 안 역할을 반환한다. */
    public StoreRole getRole() {
        return role;
    }

    /** 매장 안 역할을 저장한다. */
    public void setRole(StoreRole role) {
        this.role = role;
    }

    /** 재직 상태를 반환한다. */
    public MemberStatus getStatus() {
        return status;
    }

    /** 재직 상태를 저장한다. */
    public void setStatus(MemberStatus status) {
        this.status = status;
    }

    /** 배정된 팀 id를 반환한다. 없으면 null이다. */
    public UUID getTeamId() {
        return teamId;
    }

    /** 배정된 팀 id를 저장한다. */
    public void setTeamId(UUID teamId) {
        this.teamId = teamId;
    }

    /** 퇴사 시각을 반환한다. */
    public OffsetDateTime getLeftAt() {
        return leftAt;
    }

    /** 퇴사 시각을 저장한다. */
    public void setLeftAt(OffsetDateTime leftAt) {
        this.leftAt = leftAt;
    }
}