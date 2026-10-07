package com.nextshift.repo;

import com.nextshift.domain.HandoffRead;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

/** 사용자가 이미 읽은 인수인계 id. */
public interface HandoffReadRepository extends JpaRepository<HandoffRead, HandoffRead.Key> {
    Optional<HandoffRead> findByHandoffIdAndUserId(UUID handoffId, UUID userId);

    @Query("select r.handoffId from HandoffRead r where r.userId = :userId and r.handoffId in :ids")
    List<UUID> findReadHandoffIds(UUID userId, Collection<UUID> ids);
}