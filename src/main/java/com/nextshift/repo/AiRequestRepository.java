package com.nextshift.repo;

import com.nextshift.domain.AiRequest;
import java.time.OffsetDateTime;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

/** 하루 분석 횟수를 세려고 호출 시각을 남긴다. */
public interface AiRequestRepository extends JpaRepository<AiRequest, UUID> {
    @Query("select count(a) from AiRequest a where a.userId = :userId and a.createdAt >= :since")
    long countSince(UUID userId, OffsetDateTime since);
}