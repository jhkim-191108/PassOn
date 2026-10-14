package com.nextshift.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.util.UUID;

/** 인수인계에 붙은 사진. 한 인수인계에 최대 3장이다. */
@Entity
@Table(name = "handoff_photos")
public class HandoffPhoto extends UuidEntity {
    @Column(name = "handoff_id", nullable = false)
    private UUID handoffId;

    @Column(name = "original_name", nullable = false, length = 200)
    private String originalName;

    @Column(name = "content_type", nullable = false, length = 100)
    private String contentType;

    @Column(name = "size_bytes", nullable = false)
    private long sizeBytes;

    @Column(nullable = false)
    private int position;

    /** 사진이 붙은 인수인계 id를 반환한다. */
    public UUID getHandoffId() {
        return handoffId;
    }

    /** 사진이 붙은 인수인계 id를 저장한다. */
    public void setHandoffId(UUID handoffId) {
        this.handoffId = handoffId;
    }

    /** 올린 파일 이름을 반환한다. */
    public String getOriginalName() {
        return originalName;
    }

    /** 올린 파일 이름을 저장한다. */
    public void setOriginalName(String originalName) {
        this.originalName = originalName;
    }

    /** 파일 종류를 반환한다. */
    public String getContentType() {
        return contentType;
    }

    /** 파일 종류를 저장한다. */
    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    /** 파일 크기를 바이트로 반환한다. */
    public long getSizeBytes() {
        return sizeBytes;
    }

    /** 파일 크기를 바이트로 저장한다. */
    public void setSizeBytes(long sizeBytes) {
        this.sizeBytes = sizeBytes;
    }

    /** 같은 인수인계 안 순서를 반환한다. */
    public int getPosition() {
        return position;
    }

    /** 같은 인수인계 안 순서를 저장한다. */
    public void setPosition(int position) {
        this.position = position;
    }
}