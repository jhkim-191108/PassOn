package com.nextshift.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import java.util.UUID;

/** 매장 공지. 인수인계 카드와 따로 두고, 고정과 일반·중요·긴급 단계를 가진다. */
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

    /** 일반, 중요, 긴급. 비어 있으면 일반이다. */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private NoticePriority priority = NoticePriority.NORMAL;

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

    /** 공지 단계를 반환한다. */
    public NoticePriority getPriority() {
        return priority;
    }

    /** 공지 단계를 저장한다. */
    public void setPriority(NoticePriority priority) {
        this.priority = priority;
    }
}