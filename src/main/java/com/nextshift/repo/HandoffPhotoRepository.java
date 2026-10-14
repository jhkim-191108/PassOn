package com.nextshift.repo;

import com.nextshift.domain.HandoffPhoto;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

/** 인수인계 사진을 첨부 순으로 가져온다. */
public interface HandoffPhotoRepository extends JpaRepository<HandoffPhoto, UUID> {
    List<HandoffPhoto> findByHandoffIdOrderByPositionAsc(UUID handoffId);

    long countByHandoffId(UUID handoffId);
}