package com.nextshift.service;

import com.nextshift.api.Views.EscalationView;
import com.nextshift.common.ApiException;
import com.nextshift.common.AuthPrincipal;
import com.nextshift.domain.Card;
import com.nextshift.domain.Escalation;
import com.nextshift.domain.EscalationPriority;
import com.nextshift.domain.EscalationStatus;
import com.nextshift.domain.Handoff;
import com.nextshift.domain.StoreMember;
import com.nextshift.domain.StoreRole;
import com.nextshift.domain.User;
import com.nextshift.repo.CardRepository;
import com.nextshift.repo.EscalationRepository;
import com.nextshift.repo.HandoffRepository;
import com.nextshift.repo.UserRepository;
import com.nextshift.security.StoreGuard;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 매니저가 카드를 오너에게 올리고, 오너가 처리 완료한다. */
@Service
public class EscalationService {
    private final EscalationRepository escalationRepository;
    private final CardRepository cardRepository;
    private final HandoffRepository handoffRepository;
    private final UserRepository userRepository;
    private final StoreGuard guard;
    private final StoreLive live;

    public EscalationService(
            EscalationRepository escalationRepository,
            CardRepository cardRepository,
            HandoffRepository handoffRepository,
            UserRepository userRepository,
            StoreGuard guard,
            StoreLive live
    ) {
        this.escalationRepository = escalationRepository;
        this.cardRepository = cardRepository;
        this.handoffRepository = handoffRepository;
        this.userRepository = userRepository;
        this.guard = guard;
        this.live = live;
    }

    /** 매니저만 올린다. 오너는 자기 목록에서 처리한다. */
    @Transactional
    public EscalationView create(AuthPrincipal principal, UUID cardId, EscalationPriority priority) {
        Loaded loaded = load(cardId);
        StoreMember actor = guard.requireActiveMember(loaded.handoff().getStoreId(), principal.id());
        if (actor.getRole() != StoreRole.MANAGER) {
            throw ApiException.forbidden("매니저만 오너에게 올릴 수 있습니다.");
        }
        if (loaded.card().getCompletedAt() != null) {
            throw ApiException.conflict("이미 처리된 카드입니다.");
        }
        if (escalationRepository.findByCardIdAndStatus(cardId, EscalationStatus.PENDING).isPresent()) {
            throw ApiException.conflict("이미 오너에게 올라간 카드입니다.");
        }
        Escalation escalation = new Escalation();
        escalation.setStoreId(loaded.handoff().getStoreId());
        escalation.setCardId(loaded.card().getId());
        escalation.setRequestedBy(principal.id());
        escalation.setPriority(priority);
        escalation.setStatus(EscalationStatus.PENDING);
        escalationRepository.save(escalation);
        return toView(escalation, loaded.card(), loaded.handoff());
    }

    /** 오너의 처리 대기 목록. */
    @Transactional(readOnly = true)
    public List<EscalationView> list(AuthPrincipal principal, UUID storeId) {
        StoreMember actor = guard.requireActiveMember(storeId, principal.id());
        if (actor.getRole() != StoreRole.OWNER) {
            throw ApiException.forbidden("오너만 위임 목록을 볼 수 있습니다.");
        }
        return escalationRepository.findByStoreIdAndStatusOrderByCreatedAtDesc(storeId, EscalationStatus.PENDING)
                .stream()
                .map(this::toView)
                .toList();
    }

    /** 오너가 처리 완료하면 위임이 끝나고 카드도 완료된다. */
    @Transactional
    public EscalationView resolve(AuthPrincipal principal, UUID cardId) {
        Loaded loaded = load(cardId);
        StoreMember actor = guard.requireActiveMember(loaded.handoff().getStoreId(), principal.id());
        if (actor.getRole() != StoreRole.OWNER) {
            throw ApiException.forbidden("오너만 위임을 처리할 수 있습니다.");
        }
        Escalation escalation = escalationRepository.findByCardIdAndStatus(cardId, EscalationStatus.PENDING)
                .orElseThrow(() -> ApiException.notFound("처리 대기 중인 위임이 없습니다."));
        escalation.setStatus(EscalationStatus.RESOLVED);
        escalation.setResolvedBy(principal.id());
        escalation.setResolvedAt(OffsetDateTime.now(ZoneOffset.UTC));
        if (loaded.card().getCompletedAt() == null) {
            loaded.card().setCompletedAt(escalation.getResolvedAt());
            loaded.card().setCompletedBy(principal.id());
            live.cards(loaded.handoff().getStoreId());
        }
        return toView(escalation, loaded.card(), loaded.handoff());
    }

    private Loaded load(UUID cardId) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> ApiException.notFound("카드를 찾을 수 없습니다."));
        Handoff handoff = handoffRepository.findById(card.getHandoffId())
                .orElseThrow(() -> ApiException.notFound("인수인계를 찾을 수 없습니다."));
        return new Loaded(card, handoff);
    }

    private EscalationView toView(Escalation escalation) {
        Card card = cardRepository.findById(escalation.getCardId())
                .orElseThrow(() -> ApiException.notFound("카드를 찾을 수 없습니다."));
        Handoff handoff = handoffRepository.findById(card.getHandoffId())
                .orElseThrow(() -> ApiException.notFound("인수인계를 찾을 수 없습니다."));
        return toView(escalation, card, handoff);
    }

    private EscalationView toView(Escalation escalation, Card card, Handoff handoff) {
        return new EscalationView(
                escalation.getId(),
                escalation.getStoreId(),
                card.getId(),
                card.getTitle(),
                card.getBody(),
                userName(handoff.getAuthorId()),
                escalation.getRequestedBy(),
                userName(escalation.getRequestedBy()),
                escalation.getPriority(),
                escalation.getStatus(),
                escalation.getCreatedAt(),
                escalation.getResolvedAt()
        );
    }

    private String userName(UUID userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null || user.getDeletedAt() != null) {
            return "탈퇴한 사용자";
        }
        return user.getName();
    }

    private record Loaded(Card card, Handoff handoff) {}
}