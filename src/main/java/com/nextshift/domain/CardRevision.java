package com.nextshift.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import java.util.UUID;

/** 카드 내용이 바뀐 기록. 이전 값은 지우지 않는다. */
@Entity
@Table(name = "card_revisions")
public class CardRevision extends UuidEntity {
    @Column(name = "card_id", nullable = false)
    private UUID cardId;

    @Column(name = "store_id", nullable = false)
    private UUID storeId;

    @Column(name = "editor_id", nullable = false)
    private UUID editorId;

    @Enumerated(EnumType.STRING)
    @Column(name = "field_name", nullable = false, length = 20)
    private CardRevisionField fieldName;

    @Column(name = "before_value", nullable = false, columnDefinition = "text")
    private String beforeValue = "";

    @Column(name = "after_value", nullable = false, columnDefinition = "text")
    private String afterValue = "";

    /** 수정된 카드 id를 반환한다. */
    public UUID getCardId() {
        return cardId;
    }

    /** 수정된 카드 id를 저장한다. */
    public void setCardId(UUID cardId) {
        this.cardId = cardId;
    }

    /** 매장 id를 반환한다. */
    public UUID getStoreId() {
        return storeId;
    }

    /** 매장 id를 저장한다. */
    public void setStoreId(UUID storeId) {
        this.storeId = storeId;
    }

    /** 수정한 사용자 id를 반환한다. */
    public UUID getEditorId() {
        return editorId;
    }

    /** 수정한 사용자 id를 저장한다. */
    public void setEditorId(UUID editorId) {
        this.editorId = editorId;
    }

    /** 바뀐 칸을 반환한다. */
    public CardRevisionField getFieldName() {
        return fieldName;
    }

    /** 바뀐 칸을 저장한다. */
    public void setFieldName(CardRevisionField fieldName) {
        this.fieldName = fieldName;
    }

    /** 바꾸기 전 값을 반환한다. */
    public String getBeforeValue() {
        return beforeValue;
    }

    /** 바꾸기 전 값을 저장한다. */
    public void setBeforeValue(String beforeValue) {
        this.beforeValue = beforeValue;
    }

    /** 바꾼 뒤 값을 반환한다. */
    public String getAfterValue() {
        return afterValue;
    }

    /** 바꾼 뒤 값을 저장한다. */
    public void setAfterValue(String afterValue) {
        this.afterValue = afterValue;
    }
}