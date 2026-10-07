package com.nextshift.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import java.util.UUID;

/** 사용자와 매장의 소속. 역할, 재직 상태, 근무조를 같이 가진다. */
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

    @Enumerated(EnumType.STRING)
    @Column
    private ShiftTeam team;

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

    /** 근무조를 반환한다. 지정되지 않았으면 null이다. */
    public ShiftTeam getTeam() {
        return team;
    }

    /** 근무조를 저장한다. */
    public void setTeam(ShiftTeam team) {
        this.team = team;
    }
}