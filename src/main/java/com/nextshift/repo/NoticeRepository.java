package com.nextshift.repo;

import com.nextshift.domain.Notice;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

/** 매장 공지. 고정된 글을 먼저, 그다음 작성 시각이 최근인 글을 가져온다. */
public interface NoticeRepository extends JpaRepository<Notice, UUID> {
    @Query("""
            select n from Notice n
            where n.storeId = :storeId
            order by n.pinned desc, n.createdAt desc
            """)
    List<Notice> findByStoreId(UUID storeId);
}