package com.nextshift.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.util.UUID;

/** 근무표 한 칸. 날짜와 오전·오후·마감에 멤버 한 명을 넣는다. */
@Entity
@Table(name = "shifts")
public class Shift extends UuidEntity {
    @Column(name = "store_id", nullable = false)
    private UUID storeId;

    @Column(name = "member_id", nullable = false)
    private UUID memberId;

    @Column(name = "work_date", nullable = false)
    private LocalDate workDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WorkSlot slot;

    /** 소속 매장 id를 반환한다. */
    public UUID getStoreId() {
        return storeId;
    }

    /** 소속 매장 id를 저장한다. */
    public void setStoreId(UUID storeId) {
        this.storeId = storeId;
    }

    /** 배정된 멤버 id를 반환한다. */
    public UUID getMemberId() {
        return memberId;
    }

    /** 배정된 멤버 id를 저장한다. */
    public void setMemberId(UUID memberId) {
        this.memberId = memberId;
    }

    /** 근무 날짜를 반환한다. */
    public LocalDate getWorkDate() {
        return workDate;
    }

    /** 근무 날짜를 저장한다. */
    public void setWorkDate(LocalDate workDate) {
        this.workDate = workDate;
    }

    /** 오전·오후·마감 슬롯을 반환한다. */
    public WorkSlot getSlot() {
        return slot;
    }

    /** 오전·오후·마감 슬롯을 저장한다. */
    public void setSlot(WorkSlot slot) {
        this.slot = slot;
    }
}