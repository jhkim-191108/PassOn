package com.nextshift.domain;

import jakarta.persistence.*;

import java.time.OffsetDateTime;
import java.util.UUID;

/** 직원이 남긴 인수인계 원문과, AI 분석·확정 상태. */
@Entity
@Table(name = "handoffs")
public class Handoff extends UuidEntity {
    @Column(name = "store_id", nullable = false)
    private UUID storeId;

    @Column(name = "author_id", nullable = false)
    private UUID authorId;

    /** 직원이 입력한 자연어 원문. */
    @Column(name = "raw_text", nullable = false)
    private String rawText;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private HandoffStatus status = HandoffStatus.DRAFT;

    /** 분석이 FAILED일 때 남기는 사유. */
    @Column(name = "analyze_error")
    private String analyzeError;

    @Column(name = "analyzed_at")
    private OffsetDateTime analyzedAt;

    @Column(name = "confirmed_at")
    private OffsetDateTime confirmedAt;

    @Column(name = "confirmed_by")
    private UUID confirmedBy;

    /** 값이 있으면 휴지통에 있다. 2주 동안 복원할 수 있다. */
    @Column(name = "deleted_at")
    private OffsetDateTime deletedAt;

    @Column(name = "deleted_by")
    private UUID deletedBy;

    /** 값이 있으면 오너가 영구 보관으로 체크한 항목이다. */
    @Column(name = "kept_at")
    private OffsetDateTime keptAt;

    @Column(name = "kept_by")
    private UUID keptBy;

    /** 인수인계가 속한 매장 id를 반환한다. */
    public UUID getStoreId() {
        return storeId;
    }

    /** 인수인계가 속한 매장 id를 저장한다. */
    public void setStoreId(UUID storeId) {
        this.storeId = storeId;
    }

    /** 작성자 id를 반환한다. */
    public UUID getAuthorId() {
        return authorId;
    }

    /** 작성자 id를 저장한다. */
    public void setAuthorId(UUID authorId) {
        this.authorId = authorId;
    }

    /** 직원이 입력한 원문을 반환한다. */
    public String getRawText() {
        return rawText;
    }

    /** 직원이 입력한 원문을 저장한다. */
    public void setRawText(String rawText) {
        this.rawText = rawText;
    }

    /** 분석·확정 단계를 반환한다. */
    public HandoffStatus getStatus() {
        return status;
    }

    /** 분석·확정 단계를 저장한다. */
    public void setStatus(HandoffStatus status) {
        this.status = status;
    }

    /** 분석 실패 사유를 반환한다. */
    public String getAnalyzeError() {
        return analyzeError;
    }

    /** 분석 실패 사유를 저장한다. */
    public void setAnalyzeError(String analyzeError) {
        this.analyzeError = analyzeError;
    }

    /** AI 분석이 끝난 시각을 반환한다. */
    public OffsetDateTime getAnalyzedAt() {
        return analyzedAt;
    }

    /** AI 분석이 끝난 시각을 저장한다. */
    public void setAnalyzedAt(OffsetDateTime analyzedAt) {
        this.analyzedAt = analyzedAt;
    }

    /** 작성자가 카드를 확정한 시각을 반환한다. */
    public OffsetDateTime getConfirmedAt() {
        return confirmedAt;
    }

    /** 작성자가 카드를 확정한 시각을 저장한다. */
    public void setConfirmedAt(OffsetDateTime confirmedAt) {
        this.confirmedAt = confirmedAt;
    }

    /** 카드를 확정한 사용자 id를 반환한다. */
    public UUID getConfirmedBy() {
        return confirmedBy;
    }

    /** 카드를 확정한 사용자 id를 저장한다. */
    public void setConfirmedBy(UUID confirmedBy) {
        this.confirmedBy = confirmedBy;
    }

    /** 휴지통에 넣은 시각을 반환한다. null이면 아직 사용 중이다. */
    public OffsetDateTime getDeletedAt() {
        return deletedAt;
    }

    /** 휴지통에 넣은 시각을 저장한다. */
    public void setDeletedAt(OffsetDateTime deletedAt) {
        this.deletedAt = deletedAt;
    }

    /** 휴지통에 넣은 사용자 id를 반환한다. */
    public UUID getDeletedBy() {
        return deletedBy;
    }

    /** 휴지통에 넣은 사용자 id를 저장한다. */
    public void setDeletedBy(UUID deletedBy) {
        this.deletedBy = deletedBy;
    }

    /** 영구 보관으로 체크한 시각을 반환한다. */
    public OffsetDateTime getKeptAt() {
        return keptAt;
    }

    /** 영구 보관으로 체크한 시각을 저장한다. */
    public void setKeptAt(OffsetDateTime keptAt) {
        this.keptAt = keptAt;
    }

    /** 영구 보관을 체크한 오너 id를 반환한다. */
    public UUID getKeptBy() {
        return keptBy;
    }

    /** 영구 보관을 체크한 오너 id를 저장한다. */
    public void setKeptBy(UUID keptBy) {
        this.keptBy = keptBy;
    }
}