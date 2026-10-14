package com.nextshift.repo;

import com.nextshift.domain.Card;
import java.time.OffsetDateTime;
import java.util.Collection;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

/** 카드 목록과, 인수인계별 전체·미완료 개수. 삭제된 카드는 목록과 개수에서 뺀다. */
public interface CardRepository extends JpaRepository<Card, UUID> {
    List<Card> findByHandoffIdOrderByPositionAsc(UUID handoffId);

    List<Card> findByHandoffIdAndDeletedAtIsNullOrderByPositionAsc(UUID handoffId);

    @Query("""
            select c.handoffId, count(c),
                   sum(case when c.completedAt is null then 1 else 0 end)
            from Card c
            where c.handoffId in :ids
              and c.deletedAt is null
            group by c.handoffId
            """)
    List<Object[]> countByHandoffIds(Collection<UUID> ids);

    /** 인수인계 자체는 살아 있고, 카드만 휴지통에 있는 항목. 영구 보관은 2주가 지나도 남긴다. */
    @Query("""
            select c from Card c, Handoff h
            where c.handoffId = h.id
              and h.storeId = :storeId
              and h.deletedAt is null
              and c.deletedAt is not null
              and (c.deletedAt > :since or c.keptAt is not null)
            order by c.deletedAt desc
            """)
    List<Card> findTrash(UUID storeId, OffsetDateTime since);

    @Query("""
            select c from Card c, Handoff h
            where c.handoffId = h.id
              and h.storeId = :storeId
              and c.keptAt is not null
            order by c.keptAt desc
            """)
    List<Card> findKept(UUID storeId);

    @Query("""
            select c from Card c
            where c.deletedAt is not null
              and c.deletedAt <= :deadline
              and c.keptAt is null
            """)
    List<Card> findExpired(OffsetDateTime deadline);

    @Query("""
            select c from Card c, Handoff h
            where c.handoffId = h.id
              and h.storeId = :storeId
              and c.deletedAt is not null
              and c.deletedAt <= :deadline
              and c.keptAt is null
            """)
    List<Card> findExpiredInStore(UUID storeId, OffsetDateTime deadline);

    /** 날짜와 상관없이 아직 완료되지 않은 카드. 오래된 것이 앞이다. */
    @Query("""
            select c from Card c, Handoff h
            where c.handoffId = h.id
              and h.storeId = :storeId
              and h.deletedAt is null
              and c.deletedAt is null
              and c.completedAt is null
            order by c.createdAt asc
            """)
    List<Card> findOpenByStoreId(UUID storeId);

    /** 삭제되지 않은 매장 카드 전체. 검색 조건은 서비스에서 거른다. */
    @Query("""
            select c from Card c, Handoff h
            where c.handoffId = h.id
              and h.storeId = :storeId
              and h.deletedAt is null
              and c.deletedAt is null
            order by c.createdAt asc
            """)
    List<Card> findActiveByStoreId(UUID storeId);
}