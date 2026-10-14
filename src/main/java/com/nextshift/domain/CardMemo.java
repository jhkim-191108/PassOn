package com.nextshift.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.util.UUID;

/** 카드 아래에 붙는 후속 메모. 카드 원문은 바꾸지 않는다. */
@Entity
@Table(name = "card_memos")
public class CardMemo extends UuidEntity {
    @Column(name = "card_id", nullable = false)
    private UUID cardId;

    @Column(name = "author_id", nullable = false)
    private UUID authorId;

    @Column(nullable = false, length = 1000)
    private String body;

    /** 메모가 붙은 카드 id를 반환한다. */
    public UUID getCardId() {
        return cardId;
    }

    /** 메모가 붙은 카드 id를 저장한다. */
    public void setCardId(UUID cardId) {
        this.cardId = cardId;
    }

    /** 메모를 쓴 사용자 id를 반환한다. */
    public UUID getAuthorId() {
        return authorId;
    }

    /** 메모를 쓴 사용자 id를 저장한다. */
    public void setAuthorId(UUID authorId) {
        this.authorId = authorId;
    }

    /** 메모 내용을 반환한다. */
    public String getBody() {
        return body;
    }

    /** 메모 내용을 저장한다. */
    public void setBody(String body) {
        this.body = body;
    }
}