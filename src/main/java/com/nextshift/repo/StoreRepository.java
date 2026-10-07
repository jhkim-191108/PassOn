package com.nextshift.repo;

import com.nextshift.domain.Store;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

/** 초대 코드로 매장을 찾는다. 코드는 대문자로 정규화한 뒤 조회한다. */
public interface StoreRepository extends JpaRepository<Store, UUID> {
    Optional<Store> findByInviteCode(String inviteCode);

    boolean existsByInviteCode(String inviteCode);
}