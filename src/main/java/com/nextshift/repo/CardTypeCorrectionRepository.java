package com.nextshift.repo;

import com.nextshift.domain.CardTypeCorrection;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

/** 사람이 고친 카드 종류. 다음 분석 때 예시로 최근 10건을 가져온다. */
public interface CardTypeCorrectionRepository extends JpaRepository<CardTypeCorrection, UUID> {
    List<CardTypeCorrection> findTop10ByStoreIdOrderByCreatedAtDesc(UUID storeId);
}
