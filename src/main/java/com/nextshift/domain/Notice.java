package com.nextshift.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.util.UUID;

/** 매장 공지. 인수인계 카드와 따로 두고, 고정과 중요 표시를 가진다. */
@Entity
@Table(name = "notices")
public class Notice extends UuidEntity {
    @Column(name = "store_id", nullable = false)
    private UUID storeId;

    @Column(name = "author_id", nullable = false)
    private UUID authorId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String body;

    /** 참이면 목록 맨 위에 고정한다. */
    @Column(nullable = false)
    private boolean pinned;

    /** 참이면 중요한 공지로 표시한다. */
    @Column(nullable = false)
    private boolean important;

    /** 공지가 속한 매장 id를 반환한다. */
    public UUID getStoreId() {
        return storeId;
    }

    /** 공지가 속한 매장 id를 저장한다. */
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

    /** 공지 제목을 반환한다. */
    public String getTitle() {
        return title;
    }

    /** 공지 제목을 저장한다. */
    public void setTitle(String title) {
        this.title = title;
    }

    /** 공지 본문을 반환한다. */
    public String getBody() {
        return body;
    }

    /** 공지 본문을 저장한다. */
    public void setBody(String body) {
        this.body = body;
    }

    /** 상단 고정 여부를 반환한다. */
    public boolean isPinned() {
        return pinned;
    }

    /** 상단 고정 여부를 저장한다. */
    public void setPinned(boolean pinned) {
        this.pinned = pinned;
    }

    /** 중요 공지 여부를 반환한다. */
    public boolean isImportant() {
        return important;
    }

    /** 중요 공지 여부를 저장한다. */
    public void setImportant(boolean important) {
        this.important = important;
    }
}