package com.nextshift.service;

import com.nextshift.api.Views.PurgeView;
import com.nextshift.common.ApiException;
import com.nextshift.common.AuthPrincipal;
import com.nextshift.domain.Card;
import com.nextshift.domain.Handoff;
import com.nextshift.domain.StoreMember;
import com.nextshift.domain.StoreRole;
import com.nextshift.repo.CardRepository;
import com.nextshift.repo.HandoffRepository;
import com.nextshift.security.StoreGuard;
import jakarta.persistence.EntityManager;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 삭제된 지 2주가 지난 항목 중 영구 보관이 아닌 행을 지운다. */
@Service
public class PurgeService {
    private final HandoffRepository handoffRepository;
    private final CardRepository cardRepository;
    private final StoreGuard guard;
    private final EntityManager entityManager;
    private final PhotoService photoService;

    public PurgeService(
            HandoffRepository handoffRepository,
            CardRepository cardRepository,
            StoreGuard guard,
            EntityManager entityManager,
            PhotoService photoService
    ) {
        this.handoffRepository = handoffRepository;
        this.cardRepository = cardRepository;
        this.guard = guard;
        this.entityManager = entityManager;
        this.photoService = photoService;
    }

    /** 매일 새벽 3시 15분(서울)에 전체 매장을 정리한다. */
    @Scheduled(cron = "0 15 3 * * *", zone = "Asia/Seoul")
    @Transactional
    public void purgeAll() {
        purge(null);
    }

    /** 오너가 그 매장의 만료 항목을 바로 정리한다. */
    @Transactional
    public PurgeView purgeStore(AuthPrincipal principal, UUID storeId) {
        StoreMember member = guard.requireActiveMember(storeId, principal.id());
        if (member.getRole() != StoreRole.OWNER) {
            throw ApiException.forbidden("오너만 삭제 항목을 정리할 수 있습니다.");
        }
        return purge(storeId);
    }

    private PurgeView purge(UUID storeId) {
        OffsetDateTime deadline = OffsetDateTime.now(ZoneOffset.UTC).minusDays(TrashService.DAYS);
        List<Card> cards = storeId == null
                ? cardRepository.findExpired(deadline)
                : cardRepository.findExpiredInStore(storeId, deadline);
        int cardCount = 0;
        for (Card card : cards) {
            removeCard(card);
            cardCount++;
        }
        entityManager.flush();
        List<Handoff> handoffs = storeId == null
                ? handoffRepository.findByDeletedAtIsNotNullAndDeletedAtLessThanEqualAndKeptAtIsNull(deadline)
                : handoffRepository.findByStoreIdAndDeletedAtIsNotNullAndDeletedAtLessThanEqualAndKeptAtIsNull(storeId, deadline);
        int handoffCount = 0;
        for (Handoff handoff : handoffs) {
            if (removeHandoff(handoff)) {
                handoffCount++;
            }
        }
        return new PurgeView(handoffCount, cardCount);
    }

    /** 카드 안에 영구 보관이 남아 있으면 인수인계 행은 남긴다. */
    private boolean removeHandoff(Handoff handoff) {
        List<Card> cards = cardRepository.findByHandoffIdOrderByPositionAsc(handoff.getId());
        for (Card card : cards) {
            if (card.getKeptAt() != null) {
                return false;
            }
        }
        for (Card card : cards) {
            removeCard(card);
        }
        photoService.deleteAll(handoff.getId());
        entityManager.createQuery("delete from HandoffRead r where r.handoffId = :id")
                .setParameter("id", handoff.getId())
                .executeUpdate();
        entityManager.createQuery("delete from AiRequest a where a.handoffId = :id")
                .setParameter("id", handoff.getId())
                .executeUpdate();
        entityManager.remove(entityManager.contains(handoff) ? handoff : entityManager.merge(handoff));
        return true;
    }

    private void removeCard(Card card) {
        entityManager.createQuery("delete from Escalation e where e.cardId = :id")
                .setParameter("id", card.getId())
                .executeUpdate();
        entityManager.createQuery("delete from CardTypeCorrection c where c.cardId = :id")
                .setParameter("id", card.getId())
                .executeUpdate();
        entityManager.remove(entityManager.contains(card) ? card : entityManager.merge(card));
    }
}