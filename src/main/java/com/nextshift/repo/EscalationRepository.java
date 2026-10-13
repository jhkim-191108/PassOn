package com.nextshift.repo;

import com.nextshift.domain.Escalation;
import com.nextshift.domain.EscalationStatus;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

/** 카드 위임. 한 카드의 대기 건은 하나뿐이다. */
public interface EscalationRepository extends JpaRepository<Escalation, UUID> {
    List<Escalation> findByStoreIdAndStatusOrderByCreatedAtDesc(UUID storeId, EscalationStatus status);

    Optional<Escalation> findByCardIdAndStatus(UUID cardId, EscalationStatus status);

    Optional<Escalation> findFirstByCardIdOrderByCreatedAtDesc(UUID cardId);
}