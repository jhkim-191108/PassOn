package com.nextshift.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PostLoad;
import jakarta.persistence.PostPersist;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Transient;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;
import org.springframework.data.domain.Persistable;

/**
 * 공통 PK. id는 저장 전에 미리 만들고, isNew로 insert와 update를 구분한다.
 */
@MappedSuperclass
public abstract class UuidEntity implements Persistable<UUID> {
    @Id
    private UUID id = UUID.randomUUID();

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    /** DB에 아직 없으면 true. 저장·조회 뒤에는 false라 merge로 새 행이 생기지 않는다. */
    @Transient
    private boolean isNew = true;

    /** 기본키를 반환한다. */
    @Override
    public UUID getId() {
        return id;
    }

    /** 아직 DB에 저장되지 않았으면 true를 반환한다. */
    @Override
    public boolean isNew() {
        return isNew;
    }

    @PrePersist
    void onCreate() {
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        if (createdAt == null) {
            createdAt = now;
        }
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = OffsetDateTime.now(ZoneOffset.UTC);
    }

    @PostPersist
    @PostLoad
    void markNotNew() {
        isNew = false;
    }

    /** 처음 저장된 시각을 반환한다. */
    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    /** 마지막으로 수정된 시각을 반환한다. */
    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }
}