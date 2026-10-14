package com.nextshift.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.UUID;

/** 인수인계 원문에서 잘라 낸 카드 한 장. */
@Entity
@Table(name = "cards")
public class Card extends UuidEntity {
    @Column(name = "handoff_id", nullable = false)
    private UUID handoffId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CardType type;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String body = "";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Urgency urgency;

    /** AI가 확정하지 못해 사람이 한 번 더 봐야 하면 true. */
    @Column(name = "needs_review", nullable = false)
    private boolean needsReview;

    /** 이 카드가 나온 원문 조각. */
    @Column(name = "source_quote", nullable = false)
    private String sourceQuote = "";

    /** 같은 인수인계 안에서의 표시 순서. */
    @Column(nullable = false)
    private int position;

    @Column(name = "completed_at")
    private OffsetDateTime completedAt;

    @Column(name = "completed_by")
    private UUID completedBy;

    /** 확인해서 처리중으로 넘긴 시각. */
    @Column(name = "acknowledged_at")
    private OffsetDateTime acknowledgedAt;

    @Column(name = "acknowledged_by")
    private UUID acknowledgedBy;

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

    /** 담당 직원. 없으면 미배정. */
    @Column(name = "assignee_member_id")
    private UUID assigneeMemberId;

    /** 내용이 한 번이라도 수정되면 true. */
    @Column(nullable = false)
    private boolean edited = false;

    /** 이 카드가 속한 인수인계 id를 반환한다. */
    public UUID getHandoffId() {
        return handoffId;
    }

    /** 이 카드가 속한 인수인계 id를 저장한다. */
    public void setHandoffId(UUID handoffId) {
        this.handoffId = handoffId;
    }

    /** 카드 종류를 반환한다. */
    public CardType getType() {
        return type;
    }

    /** 카드 종류를 저장한다. */
    public void setType(CardType type) {
        this.type = type;
    }

    /** 카드 제목을 반환한다. */
    public String getTitle() {
        return title;
    }

    /** 카드 제목을 저장한다. */
    public void setTitle(String title) {
        this.title = title;
    }

    /** 카드 본문을 반환한다. */
    public String getBody() {
        return body;
    }

    /** 카드 본문을 저장한다. */
    public void setBody(String body) {
        this.body = body;
    }

    /** 중요도를 반환한다. */
    public Urgency getUrgency() {
        return urgency;
    }

    /** 중요도를 저장한다. */
    public void setUrgency(Urgency urgency) {
        this.urgency = urgency;
    }

    /** 사람이 한 번 더 확인해야 하면 true를 반환한다. */
    public boolean isNeedsReview() {
        return needsReview;
    }

    /** 추가 확인이 필요한지 저장한다. */
    public void setNeedsReview(boolean needsReview) {
        this.needsReview = needsReview;
    }

    /** 카드가 나온 원문 조각을 반환한다. */
    public String getSourceQuote() {
        return sourceQuote;
    }

    /** 카드가 나온 원문 조각을 저장한다. */
    public void setSourceQuote(String sourceQuote) {
        this.sourceQuote = sourceQuote;
    }

    /** 같은 인수인계 안 표시 순서를 반환한다. */
    public int getPosition() {
        return position;
    }

    /** 같은 인수인계 안 표시 순서를 저장한다. */
    public void setPosition(int position) {
        this.position = position;
    }

    /** 처리 완료 시각을 반환한다. null이면 아직 끝나지 않았다. */
    public OffsetDateTime getCompletedAt() {
        return completedAt;
    }

    /** 처리 완료 시각을 저장한다. */
    public void setCompletedAt(OffsetDateTime completedAt) {
        this.completedAt = completedAt;
    }

    /** 처리한 사용자 id를 반환한다. */
    public UUID getCompletedBy() {
        return completedBy;
    }

    /** 처리한 사용자 id를 저장한다. */
    public void setCompletedBy(UUID completedBy) {
        this.completedBy = completedBy;
    }

    /** 처리중으로 확인한 시각을 반환한다. */
    public OffsetDateTime getAcknowledgedAt() {
        return acknowledgedAt;
    }

    /** 처리중으로 확인한 시각을 저장한다. */
    public void setAcknowledgedAt(OffsetDateTime acknowledgedAt) {
        this.acknowledgedAt = acknowledgedAt;
    }

    /** 처리중으로 확인한 사용자 id를 반환한다. */
    public UUID getAcknowledgedBy() {
        return acknowledgedBy;
    }

    /** 처리중으로 확인한 사용자 id를 저장한다. */
    public void setAcknowledgedBy(UUID acknowledgedBy) {
        this.acknowledgedBy = acknowledgedBy;
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

    /** 담당 멤버 id를 반환한다. null이면 미배정이다. */
    public UUID getAssigneeMemberId() {
        return assigneeMemberId;
    }

    /** 담당 멤버 id를 저장한다. */
    public void setAssigneeMemberId(UUID assigneeMemberId) {
        this.assigneeMemberId = assigneeMemberId;
    }

    /** 수정된 카드이면 true를 반환한다. */
    public boolean isEdited() {
        return edited;
    }

    /** 수정 여부를 저장한다. */
    public void setEdited(boolean edited) {
        this.edited = edited;
    }
}