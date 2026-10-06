package com.nextshift.domain;

import jakarta.persistence.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "handoffs")
public class Handoff extends UuidEntity {
    @Column(name = "store_id", nullable = false)
    private UUID storeId;

    @Column(name = "author_id", nullable = false)
    private UUID authorId;

    @Column(name = "raw-text", nullable = false)
    private String rawText;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private HandoffStatus status = HandoffStatus.DRAFT;

    @Column(name = "analyze_error")
    private String analyzeError;

    @Column(name = "analyzed_at")
    private OffsetDateTime analyzedAt;

    @Column(name = "confirmed_at")
    private OffsetDateTime confirmedAt;

    @Column(name = "confirmed_by")
    private UUID confirmedBy;

    public UUID getStoreId() {
        return storeId;
    }

    public void setStoreId(UUID storeId) {
        this.storeId = storeId;
    }

    public UUID getAuthorId() {
        return authorId;
    }

    public void setAuthorId(UUID authorId) {
        this.authorId = authorId;
    }

    public String getRawText() {
        return rawText;
    }

    public HandoffStatus getStatus() {
        return status;
    }

    public void setStatus(HandoffStatus status) {
        this.status = status;
    }

    public String getAnalyzeError() {
        return analyzeError;
    }

    public void setanalyzeError(String analyzeError) {
        this.analyzeError = analyzeError;
    }

    public OffsetDateTime getAnalyzedAt() {
        return analyzedAt;
    }

    public void setAnalyzedAt(OffsetDateTime analyzedAt) {
        this.analyzedAt = analyzedAt;
    }

    public OffsetDateTime getConfirmedAt() {
        return confirmedAt;
    }

    public void setConfirmedAt(OffsetDateTime confirmedAt) {
        this.confirmedAt = confirmedAt;
    }

    public UUID getConfirmedBy() {
        return confirmedBy;
    }

    public void setConfirmedBy(UUID confirmedBy) {
        this.confirmedBy = confirmedBy;
    }

}
