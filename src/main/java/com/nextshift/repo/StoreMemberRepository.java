package com.nextshift.repo;

import com.nextshift.domain.MemberStatus;
import com.nextshift.domain.StoreMember;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StoreMemberRepository extends JpaRepository<StoreMember, UUID> {
    Optional<StoreMember> findByStoreIdAndUserId(UUID storeId, UUID userId);

    List<StoreMember> findByUserIdAndStatus(UUID userId, MemberStatus status);

    List<StoreMember> findByStoreIdOrderByCreatedAtAsc(UUID storeId);

    boolean existsByStoreIdAndUserId(UUID storeId, UUID userId);
}