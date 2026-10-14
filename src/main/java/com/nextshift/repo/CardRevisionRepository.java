package com.nextshift.repo;

import com.nextshift.domain.CardRevision;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

/** 카드 수정 이력을 최근 수정이 앞에 오도록 가져온다. */
public interface CardRevisionRepository extends JpaRepository<CardRevision, UUID> {
    List<CardRevision> findByCardIdOrderByCreatedAtDesc(UUID cardId);

    /** 매장 기록 조회용. 최근 수정이 앞에 온다. */
    List<CardRevision> findByStoreIdOrderByCreatedAtDesc(UUID storeId);
}