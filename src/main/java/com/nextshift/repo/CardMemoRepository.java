package com.nextshift.repo;

import com.nextshift.domain.CardMemo;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

/** 카드 메모를 작성 순으로 가져온다. */
public interface CardMemoRepository extends JpaRepository<CardMemo, UUID> {
    List<CardMemo> findByCardIdOrderByCreatedAtAsc(UUID cardId);
}