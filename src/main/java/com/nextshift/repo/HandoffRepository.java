package com.nextshift.repo;

import com.nextshift.domain.Handoff;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

/** 매장의 인수인계를 최신순으로 가져온다. 휴지통과 영구 보관은 따로 조회한다. */
public interface HandoffRepository extends JpaRepository<Handoff, UUID> {
    List<Handoff> findByStoreIdAndDeletedAtIsNullOrderByCreatedAtDesc(UUID storeId);

    /** 2주 안의 삭제 항목과, 기한이 지나도 오너가 보관한 항목. */
    @Query("""
            select h from Handoff h
            where h.storeId = :storeId
              and h.deletedAt is not null
              and (h.deletedAt > :since or h.keptAt is not null)
            order by h.deletedAt desc
            """)
    List<Handoff> findTrash(UUID storeId, OffsetDateTime since);

    @Query("""
            select h from Handoff h
            where h.storeId = :storeId
              and h.keptAt is not null
            order by h.keptAt desc
            """)
    List<Handoff> findKept(UUID storeId);

    List<Handoff> findByDeletedAtIsNotNullAndDeletedAtLessThanEqualAndKeptAtIsNull(OffsetDateTime deadline);

    List<Handoff> findByStoreIdAndDeletedAtIsNotNullAndDeletedAtLessThanEqualAndKeptAtIsNull(UUID storeId, OffsetDateTime deadline);
}