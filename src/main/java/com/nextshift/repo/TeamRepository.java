package com.nextshift.repo;

import com.nextshift.domain.Team;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

/** 매장별 팀. 같은 매장 안에서는 이름이 한 번만 있다. */
public interface TeamRepository extends JpaRepository<Team, UUID> {
    List<Team> findByStoreIdOrderByCreatedAtAsc(UUID storeId);

    boolean existsByStoreIdAndName(UUID storeId, String name);

    boolean existsByStoreIdAndNameAndIdNot(UUID storeId, String name, UUID id);
}