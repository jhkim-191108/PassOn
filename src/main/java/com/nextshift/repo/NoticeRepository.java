package com.nextshift.repo;

import com.nextshift.domain.Notice;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

/** 매장 공지. 순서는 서비스에서 고정, 긴급, 최신 순으로 맞춘다. */
public interface NoticeRepository extends JpaRepository<Notice, UUID> {
    @Query("""
            select n from Notice n
            where n.storeId = :storeId
            """)
    List<Notice> findByStoreId(UUID storeId);
}