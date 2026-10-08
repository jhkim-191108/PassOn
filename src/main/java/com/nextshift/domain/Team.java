package com.nextshift.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.util.UUID;

/** 매장 팀. 오너가 이름을 만들고, 멤버가 없어도 남는다. */
@Entity
@Table(name = "teams")
public class Team extends UuidEntity {
    @Column(name = "store_id", nullable = false)
    private UUID storeId;

    @Column(nullable = false)
    private String name;

    /** 소속 매장 id를 반환한다. */
    public UUID getStoreId() {
        return storeId;
    }

    /** 소속 매장 id를 저장한다. */
    public void setStoreId(UUID storeId) {
        this.storeId = storeId;
    }

    /** 팀 이름을 반환한다. */
    public String getName() {
        return name;
    }

    /** 팀 이름을 저장한다. */
    public void setName(String name) {
        this.name = name;
    }
}