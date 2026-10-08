package com.nextshift.repo;

import com.nextshift.domain.MemberStatus;
import com.nextshift.domain.StoreMember;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

/** 사용자-매장 소속 조회. 한 매장에 같은 사용자는 한 번만 있다. */
public interface StoreMemberRepository extends JpaRepository<StoreMember, UUID> {
    Optional<StoreMember> findByStoreIdAndUserId(UUID storeId, UUID userId);

    List<StoreMember> findByUserIdAndStatus(UUID userId, MemberStatus status);

    List<StoreMember> findByStoreIdOrderByCreatedAtAsc(UUID storeId);

    List<StoreMember> findByTeamId(UUID teamId);

    long countByTeamIdAndStatus(UUID teamId, MemberStatus status);

    boolean existsByStoreIdAndUserId(UUID storeId, UUID userId);
}