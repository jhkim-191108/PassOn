package com.nextshift.repo;

import com.nextshift.domain.Store;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StoreRepository extends JpaRepository<Store, UUID> {
    Optional<Store> findByInviteCode(String inviteCode);

    boolean existsByInviteCode(String inviteCode);
}