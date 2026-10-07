package com.nextshift.service;

import com.nextshift.api.Views.CardView;
import com.nextshift.common.ApiException;
import com.nextshift.common.AuthPrincipal;
import com.nextshift.domain.Card;
import com.nextshift.domain.CardType;
import com.nextshift.domain.CardTypeCorrection;
import com.nextshift.domain.Handoff;
import com.nextshift.domain.HandoffStatus;
import com.nextshift.domain.StoreMember;
import com.nextshift.domain.Urgency;
import com.nextshift.repo.CardRepository;
import com.nextshift.repo.CardTypeCorrectionRepository;
import com.nextshift.repo.HandoffRepository;
import com.nextshift.security.StoreGuard;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 카드 수정과 완료. 종류를 바꾸면 그 수정을 다음 분석 예시로 남긴다. */
@Service
public class CardService {
    private final CardRepository cardRepository;
    private final HandoffRepository handoffRepository;
    private final CardTypeCorrectionRepository correctionRepository;
    private final StoreGuard guard;

    public CardService(
            CardRepository cardRepository,
            HandoffRepository handoffRepository,
            CardTypeCorrectionRepository correctionRepository,
            StoreGuard guard
    ) {
        this.cardRepository = cardRepository;
        this.handoffRepository = handoffRepository;
        this.correctionRepository = correctionRepository;
        this.guard = guard;
    }

    /** 그 인수인계 매장의 멤버에게 카드를 순서대로 돌려준다. */
    @Transactional(readOnly = true)
    public List<CardView> list(AuthPrincipal principal, UUID handoffId) {
        Handoff handoff = readableHandoff(principal, handoffId);
        return cardRepository.findByHandoffIdOrderByPositionAsc(handoff.getId()).stream().map(CardService::toView).toList();
    }

    /** 카드가 속한 매장의 멤버만 한 장을 본다. */
    @Transactional(readOnly = true)
    public CardView get(AuthPrincipal principal, UUID cardId) {
        return toView(readableCard(principal, cardId).card());
    }

    /** 보낸 필드만 고친다. 종류가 바뀌면 수정 이력을 남긴다. */
    @Transactional
    public CardView update(
            AuthPrincipal principal,
            UUID cardId,
            CardType type,
            String title,
            String body,
            Urgency urgency,
            Boolean needsReview
    ) {
        Loaded loaded = authoredCard(principal, cardId);
        if (type == null && title == null && body == null && urgency == null && needsReview == null) {
            throw ApiException.badRequest("바꿀 값이 없습니다.");
        }
        Card card = loaded.card();
        if (type != null && type != card.getType()) {
            CardTypeCorrection correction = new CardTypeCorrection();
            correction.setStoreId(loaded.handoff().getStoreId());
            correction.setCardId(card.getId());
            correction.setSourceQuote(card.getSourceQuote().isBlank() ? card.getTitle() : card.getSourceQuote());
            correction.setFromType(card.getType());
            correction.setToType(type);
            correction.setCreatedBy(principal.id());
            correctionRepository.save(correction);
            card.setType(type);
        }
        if (title != null) {
            String trimmed = title.trim();
            if (trimmed.isBlank()) {
                throw ApiException.badRequest("카드 제목을 입력해 주세요.");
            }
            card.setTitle(trimmed.length() > 120 ? trimmed.substring(0, 120) : trimmed);
        }
        if (body != null) {
            card.setBody(body);
        }
        if (urgency != null) {
            card.setUrgency(urgency);
        }
        if (needsReview != null) {
            card.setNeedsReview(needsReview);
        }
        if (card.getSourceQuote().isBlank() || !loaded.handoff().getRawText().contains(card.getSourceQuote())) {
            card.setNeedsReview(true);
        }
        return toView(card);
    }

    /** 확정 전이고 작성 권한이 있을 때만 카드를 지운다. */
    @Transactional
    public void delete(AuthPrincipal principal, UUID cardId) {
        Loaded loaded = authoredCard(principal, cardId);
        cardRepository.delete(loaded.card());
    }

    /** 카드를 처리 완료로 표시한다. 이미 완료면 시각을 바꾸지 않는다. */
    @Transactional
    public CardView complete(AuthPrincipal principal, UUID cardId) {
        Card card = readableCard(principal, cardId).card();
        if (card.getCompletedAt() == null) {
            card.setCompletedAt(OffsetDateTime.now(ZoneOffset.UTC));
            card.setCompletedBy(principal.id());
        }
        return toView(card);
    }

    /** 완료를 취소한다. 작성자이거나 매니저 이상만 가능하다. */
    @Transactional
    public CardView reopen(AuthPrincipal principal, UUID cardId) {
        Loaded loaded = readableCard(principal, cardId);
        StoreMember actor = guard.requireActiveMember(loaded.handoff().getStoreId(), principal.id());
        guard.requireAuthored(actor, loaded.handoff().getAuthorId());
        loaded.card().setCompletedAt(null);
        loaded.card().setCompletedBy(null);
        return toView(loaded.card());
    }

    private Loaded authoredCard(AuthPrincipal principal, UUID cardId) {
        Loaded loaded = readableCard(principal, cardId);
        if (loaded.handoff().getStatus() == HandoffStatus.CONFIRMED) {
            throw ApiException.conflict("확정된 인수인계의 카드 내용은 수정할 수 없습니다.");
        }
        StoreMember actor = guard.requireActiveMember(loaded.handoff().getStoreId(), principal.id());
        guard.requireAuthored(actor, loaded.handoff().getAuthorId());
        return loaded;
    }

    private Loaded readableCard(AuthPrincipal principal, UUID cardId) {
        Card card = cardRepository.findById(cardId).orElseThrow(() -> ApiException.notFound("카드를 찾을 수 없습니다."));
        Handoff handoff = readableHandoff(principal, card.getHandoffId());
        return new Loaded(card, handoff);
    }

    private Handoff readableHandoff(AuthPrincipal principal, UUID handoffId) {
        Handoff handoff = handoffRepository.findById(handoffId)
                .orElseThrow(() -> ApiException.notFound("인수인계를 찾을 수 없습니다."));
        guard.requireActiveMember(handoff.getStoreId(), principal.id());
        return handoff;
    }

    private static CardView toView(Card card) {
        return new CardView(
                card.getId(),
                card.getHandoffId(),
                card.getType(),
                card.getTitle(),
                card.getBody(),
                card.getUrgency(),
                card.isNeedsReview(),
                card.getSourceQuote(),
                card.getPosition(),
                card.getCompletedAt(),
                card.getCompletedBy(),
                card.getCreatedAt(),
                card.getUpdatedAt()
        );
    }

    private record Loaded(Card card, Handoff handoff) {}
}