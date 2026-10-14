package com.nextshift.repo;

import com.nextshift.domain.Shift;
import com.nextshift.domain.WorkSlot;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

/** 매장 근무표. 같은 날, 같은 슬롯, 같은 멤버는 한 번만 있다. */
public interface ShiftRepository extends JpaRepository<Shift, UUID> {
    List<Shift> findByStoreIdAndWorkDateBetween(UUID storeId, LocalDate from, LocalDate to);

    List<Shift> findByStoreIdAndWorkDateAndSlot(UUID storeId, LocalDate workDate, WorkSlot slot);

    boolean existsByStoreIdAndMemberIdAndWorkDateAndSlot(UUID storeId, UUID memberId, LocalDate workDate, WorkSlot slot);
}