package com.nextshift.service;

import com.nextshift.api.Views.KeepView;
import com.nextshift.common.ApiException;
import com.nextshift.common.AuthPrincipal;
import com.nextshift.domain.Card;
import com.nextshift.domain.Handoff;
import com.nextshift.domain.StoreMember;
import com.nextshift.domain.StoreRole;
import com.nextshift.domain.TrashKind;
import com.nextshift.repo.CardRepository;
import com.nextshift.repo.HandoffRepository;
import com.nextshift.security.StoreGuard;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 오너가 삭제 항목을 영구 보관으로 남기거나 해제한다. */
@Service
public class KeepService {
    private final HandoffRepository handoffRepository;
    private final CardRepository cardRepository;
    private final StoreGuard guard;

    public KeepService(HandoffRepository handoffRepository, CardRepository cardRepository, StoreGuard guard) {
        this.handoffRepository = handoffRepository;
        this.cardRepository = cardRepository;
        this.guard = guard;
    }

    /** 인수인계 영구 보관을 켜거나 끈다. */
    @Transactional
    public KeepView keepHandoff(AuthPrincipal principal, UUID handoffId, boolean kept) {
        Handoff handoff = handoffRepository.findById(handoffId)
                .orElseThrow(() -> ApiException.notFound("인수인계를 찾을 수 없습니다."));
        requireOwner(handoff.getStoreId(), principal.id());
        if (kept) {
            if (handoff.getKeptAt() == null) {
                handoff.setKeptAt(OffsetDateTime.now(ZoneOffset.UTC));
                handoff.setKeptBy(principal.id());
            }
        } else {
            handoff.setKeptAt(null);
            handoff.setKeptBy(null);
        }
        return new KeepView(TrashKind.HANDOFF, handoff.getId(), handoff.getKeptAt() != null, handoff.getKeptAt());
    }

    /** 카드 영구 보관을 켜거나 끈다. */
    @Transactional
    public KeepView keepCard(AuthPrincipal principal, UUID cardId, boolean kept) {
        Card card = cardRepository.findById(cardId).orElseThrow(() -> ApiException.notFound("카드를 찾을 수 없습니다."));
        Handoff handoff = handoffRepository.findById(card.getHandoffId())
                .orElseThrow(() -> ApiException.notFound("인수인계를 찾을 수 없습니다."));
        requireOwner(handoff.getStoreId(), principal.id());
        if (kept) {
            if (card.getKeptAt() == null) {
                card.setKeptAt(OffsetDateTime.now(ZoneOffset.UTC));
                card.setKeptBy(principal.id());
            }
        } else {
            card.setKeptAt(null);
            card.setKeptBy(null);
        }
        return new KeepView(TrashKind.CARD, card.getId(), card.getKeptAt() != null, card.getKeptAt());
    }

    private void requireOwner(UUID storeId, UUID userId) {
        StoreMember member = guard.requireActiveMember(storeId, userId);
        if (member.getRole() != StoreRole.OWNER) {
            throw ApiException.forbidden("오너만 영구 보관할 수 있습니다.");
        }
    }
}