package com.nextshift.service;

import com.nextshift.api.Views.CardRevisionView;
import com.nextshift.api.Views.CardView;
import com.nextshift.common.ApiException;
import com.nextshift.common.AuthPrincipal;
import com.nextshift.domain.Card;
import com.nextshift.domain.CardProgress;
import com.nextshift.domain.CardRevision;
import com.nextshift.domain.CardRevisionField;
import com.nextshift.domain.CardType;
import com.nextshift.domain.CardTypeCorrection;
import com.nextshift.domain.Escalation;
import com.nextshift.domain.EscalationStatus;
import com.nextshift.domain.Handoff;
import com.nextshift.domain.HandoffStatus;
import com.nextshift.domain.MemberStatus;
import com.nextshift.domain.StoreMember;
import com.nextshift.domain.StoreRole;
import com.nextshift.domain.Urgency;
import com.nextshift.domain.User;
import com.nextshift.repo.CardRepository;
import com.nextshift.repo.CardRevisionRepository;
import com.nextshift.repo.CardTypeCorrectionRepository;
import com.nextshift.repo.EscalationRepository;
import com.nextshift.repo.HandoffRepository;
import com.nextshift.repo.StoreMemberRepository;
import com.nextshift.repo.UserRepository;
import com.nextshift.security.StoreGuard;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 카드 수정, 완료, 담당자, 검색, 수정 이력. 종류를 바꾸면 그 수정을 다음 분석 예시로 남긴다. */
@Service
public class CardService {
    private static final ZoneId SEOUL = ZoneId.of("Asia/Seoul");

    private final CardRepository cardRepository;
    private final CardRevisionRepository revisionRepository;
    private final HandoffRepository handoffRepository;
    private final CardTypeCorrectionRepository correctionRepository;
    private final EscalationRepository escalationRepository;
    private final UserRepository userRepository;
    private final StoreMemberRepository memberRepository;
    private final StoreGuard guard;
    private final NotificationService notificationService;
    private final StoreLive live;

    public CardService(
            CardRepository cardRepository,
            CardRevisionRepository revisionRepository,
            HandoffRepository handoffRepository,
            CardTypeCorrectionRepository correctionRepository,
            EscalationRepository escalationRepository,
            UserRepository userRepository,
            StoreMemberRepository memberRepository,
            StoreGuard guard,
            NotificationService notificationService,
            StoreLive live
    ) {
        this.cardRepository = cardRepository;
        this.revisionRepository = revisionRepository;
        this.handoffRepository = handoffRepository;
        this.correctionRepository = correctionRepository;
        this.escalationRepository = escalationRepository;
        this.userRepository = userRepository;
        this.memberRepository = memberRepository;
        this.guard = guard;
        this.notificationService = notificationService;
        this.live = live;
    }

    /** 그 인수인계 매장의 멤버에게 삭제되지 않은 카드를 순서대로 돌려준다. */
    @Transactional(readOnly = true)
    public List<CardView> list(AuthPrincipal principal, UUID handoffId) {
        Handoff handoff = readableHandoff(principal, handoffId);
        return cardRepository.findByHandoffIdAndDeletedAtIsNullOrderByPositionAsc(handoff.getId()).stream()
                .map(card -> toView(card, handoff))
                .toList();
    }

    /** 매장의 미완료 카드를 만든 순서대로 돌려준다. 어제 것도 완료 전까지 남는다. */
    @Transactional(readOnly = true)
    public List<CardView> openCards(AuthPrincipal principal, UUID storeId) {
        guard.requireActiveMember(storeId, principal.id());
        return openCards(storeId);
    }

    /** 권한 확인 없이 미완료 카드를 돌려준다. 실시간 전송에서 쓴다. */
    @Transactional(readOnly = true)
    public List<CardView> openCards(UUID storeId) {
        List<Card> cards = cardRepository.findOpenByStoreId(storeId);
        Map<UUID, Handoff> handoffs = new HashMap<>();
        for (Card card : cards) {
            handoffs.computeIfAbsent(card.getHandoffId(), id -> handoffRepository.findById(id).orElse(null));
        }
        return cards.stream()
                .filter(card -> handoffs.get(card.getHandoffId()) != null)
                .map(card -> toView(card, handoffs.get(card.getHandoffId())))
                .toList();
    }

    /**
     * 매장 카드를 거른다.
     * progress는 OPEN, IN_PROGRESS, DONE.
     * mine이 true면 내 담당만.
     * from과 to는 서울 날짜이며 양 끝을 포함한다.
     * q는 제목, 내용, 작성자 이름, 담당자 이름에 포함되면 통과한다.
     */
    @Transactional(readOnly = true)
    public List<CardView> search(
            AuthPrincipal principal,
            UUID storeId,
            CardProgress progress,
            Urgency urgency,
            Boolean mine,
            UUID authorId,
            LocalDate from,
            LocalDate to,
            String q
    ) {
        StoreMember member = guard.requireActiveMember(storeId, principal.id());
        List<Card> cards = cardRepository.findActiveByStoreId(storeId);
        Map<UUID, Handoff> handoffs = new HashMap<>();
        for (Card card : cards) {
            handoffs.computeIfAbsent(card.getHandoffId(), id -> handoffRepository.findById(id).orElse(null));
        }
        return cards.stream()
                .filter(card -> handoffs.get(card.getHandoffId()) != null)
                .filter(card -> progress == null || progress(card) == progress)
                .filter(card -> urgency == null || card.getUrgency() == urgency)
                .filter(card -> mine == null || !mine || member.getId().equals(card.getAssigneeMemberId()))
                .filter(card -> authorId == null || authorId.equals(handoffs.get(card.getHandoffId()).getAuthorId()))
                .filter(card -> matchesDate(card, from, to))
                .filter(card -> matchesQuery(card, handoffs.get(card.getHandoffId()), q))
                .sorted(Comparator.comparing((Card card) -> card.getCompletedAt() != null).thenComparing(Card::getCreatedAt))
                .map(card -> toView(card, handoffs.get(card.getHandoffId())))
                .toList();
    }

    /** 카드가 속한 매장의 멤버만 한 장을 본다. 휴지통에 있으면 없는 것으로 친다. */
    @Transactional(readOnly = true)
    public CardView get(AuthPrincipal principal, UUID cardId) {
        Loaded loaded = readableCard(principal, cardId);
        return toView(loaded.card(), loaded.handoff());
    }

    /** 카드 수정 이력을 최근 수정이 앞에 오도록 돌려준다. */
    @Transactional(readOnly = true)
    public List<CardRevisionView> revisions(AuthPrincipal principal, UUID cardId) {
        readableCard(principal, cardId);
        return revisionRepository.findByCardIdOrderByCreatedAtDesc(cardId).stream()
                .map(this::revisionView)
                .toList();
    }

    /** 보낸 필드만 고친다. 값이 바뀌면 수정 이력을 남긴다. */
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
        CardType beforeType = card.getType();
        String beforeTitle = card.getTitle();
        String beforeBody = card.getBody();
        Urgency beforeUrgency = card.getUrgency();
        boolean beforeReview = card.isNeedsReview();
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
        revise(card, loaded.handoff(), principal.id(), CardRevisionField.TYPE, beforeType.name(), card.getType().name());
        revise(card, loaded.handoff(), principal.id(), CardRevisionField.TITLE, beforeTitle, card.getTitle());
        revise(card, loaded.handoff(), principal.id(), CardRevisionField.BODY, beforeBody, card.getBody());
        revise(card, loaded.handoff(), principal.id(), CardRevisionField.URGENCY, beforeUrgency.name(), card.getUrgency().name());
        revise(card, loaded.handoff(), principal.id(), CardRevisionField.NEEDS_REVIEW, Boolean.toString(beforeReview), Boolean.toString(card.isNeedsReview()));
        if (urgency == Urgency.NOW && beforeUrgency != Urgency.NOW) {
            notifyUrgent(loaded.handoff(), card, principal.id());
        }
        live.cards(loaded.handoff().getStoreId());
        return toView(card, loaded.handoff());
    }

    /** 확정 이후에도 휴지통으로 보낸다. 작성자 역할에 따라 권한이 갈린다. */
    @Transactional
    public void delete(AuthPrincipal principal, UUID cardId) {
        Loaded loaded = readableCard(principal, cardId);
        StoreMember actor = guard.requireActiveMember(loaded.handoff().getStoreId(), principal.id());
        guard.requireDeleteAuthored(actor, loaded.handoff().getAuthorId());
        loaded.card().setDeletedAt(OffsetDateTime.now(ZoneOffset.UTC));
        loaded.card().setDeletedBy(principal.id());
        live.cards(loaded.handoff().getStoreId());
    }

    /** 2주 안의 삭제 카드를 다시 목록으로 되돌린다. */
    @Transactional
    public CardView restore(AuthPrincipal principal, UUID cardId) {
        Card card = cardRepository.findById(cardId).orElseThrow(() -> ApiException.notFound("카드를 찾을 수 없습니다."));
        Handoff handoff = handoffRepository.findById(card.getHandoffId())
                .orElseThrow(() -> ApiException.notFound("인수인계를 찾을 수 없습니다."));
        StoreMember actor = guard.requireActiveMember(handoff.getStoreId(), principal.id());
        if (card.getDeletedAt() == null) {
            throw ApiException.conflict("삭제된 카드가 아닙니다.");
        }
        if (card.getDeletedAt().plusDays(TrashService.DAYS).isBefore(OffsetDateTime.now(ZoneOffset.UTC))) {
            throw ApiException.conflict("2주가 지나 복원할 수 없습니다.");
        }
        if (handoff.getDeletedAt() != null) {
            throw ApiException.conflict("인수인계가 삭제되어 있습니다. 인수인계를 먼저 복원해 주세요.");
        }
        guard.requireDeleteAuthored(actor, handoff.getAuthorId());
        card.setDeletedAt(null);
        card.setDeletedBy(null);
        live.cards(handoff.getStoreId());
        return toView(card, handoff);
    }

    /** 같은 매장의 재직 직원에게 담당을 맡긴다. memberId가 없으면 배정을 해제한다. */
    @Transactional
    public CardView assign(AuthPrincipal principal, UUID cardId, UUID memberId) {
        Loaded loaded = readableCard(principal, cardId);
        StoreMember actor = guard.requireActiveMember(loaded.handoff().getStoreId(), principal.id());
        guard.requireAuthored(actor, loaded.handoff().getAuthorId());
        Card card = loaded.card();
        if (memberId == null) {
            card.setAssigneeMemberId(null);
            live.cards(loaded.handoff().getStoreId());
            return toView(card, loaded.handoff());
        }
        StoreMember assignee = memberRepository.findById(memberId)
                .orElseThrow(() -> ApiException.notFound("멤버를 찾을 수 없습니다."));
        if (!assignee.getStoreId().equals(loaded.handoff().getStoreId())) {
            throw ApiException.badRequest("이 매장의 직원이 아닙니다.");
        }
        if (assignee.getStatus() != MemberStatus.ACTIVE) {
            throw ApiException.badRequest("재직 중인 직원만 담당자로 지정할 수 있습니다.");
        }
        card.setAssigneeMemberId(assignee.getId());
        notificationService.assignment(
                loaded.handoff().getStoreId(),
                principal.id(),
                assignee.getUserId(),
                loaded.handoff().getId(),
                card.getId(),
                card.getTitle()
        );
        live.cards(loaded.handoff().getStoreId());
        return toView(card, loaded.handoff());
    }

    /** 카드를 처리중으로 확인한다. 이미 확인했으면 시각을 바꾸지 않는다. */
    @Transactional
    public CardView acknowledge(AuthPrincipal principal, UUID cardId) {
        Loaded loaded = readableCard(principal, cardId);
        Card card = loaded.card();
        if (card.getCompletedAt() != null) {
            throw ApiException.conflict("완료된 카드는 처리중으로 바꿀 수 없습니다.");
        }
        if (card.getAcknowledgedAt() == null) {
            card.setAcknowledgedAt(OffsetDateTime.now(ZoneOffset.UTC));
            card.setAcknowledgedBy(principal.id());
            live.cards(loaded.handoff().getStoreId());
        }
        return toView(card, loaded.handoff());
    }

    /** 처리중 확인을 취소한다. 완료된 카드는 완료 취소 후 가능하다. */
    @Transactional
    public CardView unacknowledge(AuthPrincipal principal, UUID cardId) {
        Loaded loaded = readableCard(principal, cardId);
        Card card = loaded.card();
        if (card.getCompletedAt() != null) {
            throw ApiException.conflict("완료된 카드의 확인은 취소할 수 없습니다. 완료를 먼저 취소해 주세요.");
        }
        StoreMember actor = guard.requireActiveMember(loaded.handoff().getStoreId(), principal.id());
        boolean manager = actor.getRole() == StoreRole.OWNER || actor.getRole() == StoreRole.MANAGER;
        boolean allowed = manager
                || principal.id().equals(card.getAcknowledgedBy())
                || principal.id().equals(loaded.handoff().getAuthorId());
        if (!allowed) {
            throw ApiException.forbidden("확인을 취소할 권한이 없습니다.");
        }
        card.setAcknowledgedAt(null);
        card.setAcknowledgedBy(null);
        live.cards(loaded.handoff().getStoreId());
        return toView(card, loaded.handoff());
    }

    /** 카드를 처리 완료로 표시한다. 이미 완료면 시각을 바꾸지 않는다. */
    @Transactional
    public CardView complete(AuthPrincipal principal, UUID cardId) {
        Loaded loaded = readableCard(principal, cardId);
        Card card = loaded.card();
        if (card.getCompletedAt() == null) {
            card.setCompletedAt(OffsetDateTime.now(ZoneOffset.UTC));
            card.setCompletedBy(principal.id());
            notificationService.completed(
                    loaded.handoff().getStoreId(),
                    principal.id(),
                    loaded.handoff().getAuthorId(),
                    loaded.handoff().getId(),
                    card.getId(),
                    card.getTitle()
            );
            live.cards(loaded.handoff().getStoreId());
        }
        return toView(card, loaded.handoff());
    }

    /** 완료를 취소한다. 작성자이거나 매니저 이상만 가능하다. 확인 기록은 남는다. */
    @Transactional
    public CardView reopen(AuthPrincipal principal, UUID cardId) {
        Loaded loaded = readableCard(principal, cardId);
        StoreMember actor = guard.requireActiveMember(loaded.handoff().getStoreId(), principal.id());
        guard.requireAuthored(actor, loaded.handoff().getAuthorId());
        loaded.card().setCompletedAt(null);
        loaded.card().setCompletedBy(null);
        live.cards(loaded.handoff().getStoreId());
        return toView(loaded.card(), loaded.handoff());
    }

    private void revise(Card card, Handoff handoff, UUID editorId, CardRevisionField field, String before, String after) {
        String previous = before == null ? "" : before;
        String next = after == null ? "" : after;
        if (Objects.equals(previous, next)) {
            return;
        }
        CardRevision revision = new CardRevision();
        revision.setCardId(card.getId());
        revision.setStoreId(handoff.getStoreId());
        revision.setEditorId(editorId);
        revision.setFieldName(field);
        revision.setBeforeValue(previous);
        revision.setAfterValue(next);
        revisionRepository.save(revision);
        card.setEdited(true);
    }

    private boolean matchesQuery(Card card, Handoff handoff, String q) {
        if (q == null || q.isBlank()) {
            return true;
        }
        String needle = q.trim().toLowerCase(Locale.ROOT);
        return contains(card.getTitle(), needle)
                || contains(card.getBody(), needle)
                || contains(authorName(handoff.getAuthorId()), needle)
                || contains(assigneeName(card.getAssigneeMemberId()), needle);
    }

    private static boolean contains(String value, String needle) {
        return value != null && value.toLowerCase(Locale.ROOT).contains(needle);
    }

    private static boolean matchesDate(Card card, LocalDate from, LocalDate to) {
        if (from == null && to == null) {
            return true;
        }
        LocalDate day = card.getCreatedAt().atZoneSameInstant(SEOUL).toLocalDate();
        if (from != null && day.isBefore(from)) {
            return false;
        }
        return to == null || !day.isAfter(to);
    }

    private void notifyUrgent(Handoff handoff, Card card, UUID actorId) {
        for (StoreMember member : memberRepository.findByStoreIdOrderByCreatedAtAsc(handoff.getStoreId())) {
            if (member.getStatus() != MemberStatus.ACTIVE) {
                continue;
            }
            notificationService.urgent(
                    handoff.getStoreId(),
                    actorId,
                    member.getUserId(),
                    handoff.getId(),
                    card.getId(),
                    card.getTitle()
            );
        }
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
        if (card.getDeletedAt() != null) {
            throw ApiException.notFound("카드를 찾을 수 없습니다.");
        }
        Handoff handoff = readableHandoff(principal, card.getHandoffId());
        return new Loaded(card, handoff);
    }

    private Handoff readableHandoff(AuthPrincipal principal, UUID handoffId) {
        Handoff handoff = handoffRepository.findById(handoffId)
                .orElseThrow(() -> ApiException.notFound("인수인계를 찾을 수 없습니다."));
        if (handoff.getDeletedAt() != null) {
            throw ApiException.notFound("인수인계를 찾을 수 없습니다.");
        }
        guard.requireActiveMember(handoff.getStoreId(), principal.id());
        return handoff;
    }

    private Escalation latestEscalation(UUID cardId) {
        return escalationRepository.findByCardIdAndStatus(cardId, EscalationStatus.PENDING)
                .orElseGet(() -> escalationRepository.findFirstByCardIdOrderByCreatedAtDesc(cardId).orElse(null));
    }

    private String authorName(UUID userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null || user.getDeletedAt() != null) {
            return "탈퇴한 사용자";
        }
        return user.getName();
    }

    private String assigneeName(UUID memberId) {
        if (memberId == null) {
            return null;
        }
        StoreMember member = memberRepository.findById(memberId).orElse(null);
        if (member == null) {
            return "알 수 없는 직원";
        }
        return authorName(member.getUserId());
    }

    private static CardProgress progress(Card card) {
        if (card.getCompletedAt() != null) {
            return CardProgress.DONE;
        }
        if (card.getAcknowledgedAt() != null) {
            return CardProgress.IN_PROGRESS;
        }
        return CardProgress.OPEN;
    }

    private CardRevisionView revisionView(CardRevision revision) {
        return new CardRevisionView(
                revision.getId(),
                revision.getCardId(),
                revision.getFieldName(),
                revision.getBeforeValue(),
                revision.getAfterValue(),
                revision.getEditorId(),
                authorName(revision.getEditorId()),
                revision.getCreatedAt()
        );
    }

    private CardView toView(Card card, Handoff handoff) {
        Escalation escalation = latestEscalation(card.getId());
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
                card.getUpdatedAt(),
                authorName(handoff.getAuthorId()),
                escalation == null ? null : escalation.getStatus(),
                escalation == null ? null : escalation.getPriority(),
                card.getAssigneeMemberId(),
                assigneeName(card.getAssigneeMemberId()),
                card.getAcknowledgedAt(),
                card.getAcknowledgedBy(),
                card.getAcknowledgedBy() == null ? null : authorName(card.getAcknowledgedBy()),
                progress(card),
                card.isEdited()
        );
    }

    private record Loaded(Card card, Handoff handoff) {}
}