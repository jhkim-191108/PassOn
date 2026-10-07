package com.nextshift.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import java.util.UUID;

/** 매장. 초대 코드 6자리로 직원을 받는다. */
@Entity
@Table(name = "stores")
public class Store extends UuidEntity {
    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StoreType type;

    @Column(name = "invite_code", nullable = false, length = 6)
    private String inviteCode;

    @Column(name = "created_by", nullable = false)
    private UUID createdBy;

    /** 매장 이름을 반환한다. */
    public String getName() {
        return name;
    }

    /** 매장 이름을 저장한다. */
    public void setName(String name) {
        this.name = name;
    }

    /** 업종을 반환한다. */
    public StoreType getType() {
        return type;
    }

    /** 업종을 저장한다. */
    public void setType(StoreType type) {
        this.type = type;
    }

    /** 직원 초대 코드를 반환한다. */
    public String getInviteCode() {
        return inviteCode;
    }

    /** 직원 초대 코드를 저장한다. */
    public void setInviteCode(String inviteCode) {
        this.inviteCode = inviteCode;
    }

    /** 매장을 만든 사용자 id를 반환한다. */
    public UUID getCreatedBy() {
        return createdBy;
    }

    /** 매장을 만든 사용자 id를 저장한다. */
    public void setCreatedBy(UUID createdBy) {
        this.createdBy = createdBy;
    }
}