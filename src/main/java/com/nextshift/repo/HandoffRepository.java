package com.nextshift.repo;

import com.nextshift.domain.Handoff;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

/** 매장의 인수인계를 최신순으로 가져온다. */
public interface HandoffRepository extends JpaRepository<Handoff, UUID> {
    List<Handoff> findByStoreIdOrderByCreatedAtDesc(UUID storeId);
}