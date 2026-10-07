package com.nextshift.repo;

import com.nextshift.domain.Card;
import java.util.Collection;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

/** 카드 목록과, 인수인계별 전체·미완료 개수. */
public interface CardRepository extends JpaRepository<Card, UUID> {
    List<Card> findByHandoffIdOrderByPositionAsc(UUID handoffId);

    @Query("""
            select c.handoffId, count(c),
                   sum(case when c.completedAt is null then 1 else 0 end)
            from Card c
            where c.handoffId in :ids
            group by c.handoffId
            """)
    List<Object[]> countByHandoffIds(Collection<UUID> ids);
}