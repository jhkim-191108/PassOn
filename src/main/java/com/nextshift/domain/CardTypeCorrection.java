package com.nextshift.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

/** 사람이 카드 종류를 고친 기록. 다음 분석의 예시로 쓴다. */
@Entity
@Table(name = "card_type_corrections")
public class CardTypeCorrection {
    @Id
    private UUID id = UUID.randomUUID();

    @Column(name = "store_id", nullable = false)
    private UUID storeId;

    @Column(name = "card_id")
    private UUID cardId;

    @Column(name = "source_quote", nullable = false)
    private String sourceQuote;

    @Enumerated(EnumType.STRING)
    @Column(name = "from_type", nullable = false)
    private CardType fromType;

    @Enumerated(EnumType.STRING)
    @Column(name = "to_type", nullable = false)
    private CardType toType;

    @Column(name = "created_by", nullable = false)
    private UUID createdBy;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now(ZoneOffset.UTC);

    /** 수정이 일어난 매장 id를 반환한다. */
    public UUID getStoreId() {
        return storeId;
    }

    /** 수정이 일어난 매장 id를 저장한다. */
    public void setStoreId(UUID storeId) {
        this.storeId = storeId;
    }

    /** 종류를 고친 카드 id를 저장한다. */
    public void setCardId(UUID cardId) {
        this.cardId = cardId;
    }

    /** 분류에 쓴 원문 조각을 반환한다. */
    public String getSourceQuote() {
        return sourceQuote;
    }

    /** 분류에 쓴 원문 조각을 저장한다. */
    public void setSourceQuote(String sourceQuote) {
        this.sourceQuote = sourceQuote;
    }

    /** 고치기 전 카드 종류를 반환한다. */
    public CardType getFromType() {
        return fromType;
    }

    /** 고치기 전 카드 종류를 저장한다. */
    public void setFromType(CardType fromType) {
        this.fromType = fromType;
    }

    /** 고친 뒤 카드 종류를 반환한다. */
    public CardType getToType() {
        return toType;
    }

    /** 고친 뒤 카드 종류를 저장한다. */
    public void setToType(CardType toType) {
        this.toType = toType;
    }

    /** 수정한 사용자 id를 저장한다. */
    public void setCreatedBy(UUID createdBy) {
        this.createdBy = createdBy;
    }
}