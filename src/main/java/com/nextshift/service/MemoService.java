package com.nextshift.service;

import com.nextshift.api.Views.MemoView;
import com.nextshift.common.ApiException;
import com.nextshift.common.AuthPrincipal;
import com.nextshift.domain.Card;
import com.nextshift.domain.CardMemo;
import com.nextshift.domain.Handoff;
import com.nextshift.domain.StoreMember;
import com.nextshift.domain.StoreRole;
import com.nextshift.domain.User;
import com.nextshift.repo.CardMemoRepository;
import com.nextshift.repo.CardRepository;
import com.nextshift.repo.HandoffRepository;
import com.nextshift.repo.StoreMemberRepository;
import com.nextshift.repo.UserRepository;
import com.nextshift.security.StoreGuard;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 카드 후속 메모. 원문 수정과 따로 저장한다. */
@Service
public class MemoService {
    private final CardMemoRepository memoRepository;
    private final CardRepository cardRepository;
    private final HandoffRepository handoffRepository;
    private final UserRepository userRepository;
    private final StoreMemberRepository memberRepository;
    private final StoreGuard guard;
    private final NotificationService notificationService;

    public MemoService(
            CardMemoRepository memoRepository,
            CardRepository cardRepository,
            HandoffRepository handoffRepository,
            UserRepository userRepository,
            StoreMemberRepository memberRepository,
            StoreGuard guard,
            NotificationService notificationService
    ) {
        this.memoRepository = memoRepository;
        this.cardRepository = cardRepository;
        this.handoffRepository = handoffRepository;
        this.userRepository = userRepository;
        this.memberRepository = memberRepository;
        this.guard = guard;
        this.notificationService = notificationService;
    }

    /** 그 카드의 메모를 작성 순으로 돌려준다. */
    @Transactional(readOnly = true)
    public List<MemoView> list(AuthPrincipal principal, UUID cardId) {
        readableCard(principal, cardId);
        return memoRepository.findByCardIdOrderByCreatedAtAsc(cardId).stream()
                .map(this::toView)
                .toList();
    }

    /** 후속 메모를 붙인다. 매장 멤버면 된다. */
    @Transactional
    public MemoView create(AuthPrincipal principal, UUID cardId, String body) {
        Handoff handoff = readableCard(principal, cardId);
        Card card = cardRepository.findById(cardId).orElseThrow(() -> ApiException.notFound("카드를 찾을 수 없습니다."));
        String trimmed = body.trim();
        if (trimmed.isBlank()) {
            throw ApiException.badRequest("메모 내용을 입력해 주세요.");
        }
        CardMemo memo = new CardMemo();
        memo.setCardId(cardId);
        memo.setAuthorId(principal.id());
        memo.setBody(trimmed);
        memoRepository.save(memo);
        UUID assigneeUserId = null;
        if (card.getAssigneeMemberId() != null) {
            StoreMember assignee = memberRepository.findById(card.getAssigneeMemberId()).orElse(null);
            if (assignee != null) {
                assigneeUserId = assignee.getUserId();
            }
        }
        notificationService.memo(
                handoff.getStoreId(),
                principal.id(),
                handoff.getAuthorId(),
                assigneeUserId,
                handoff.getId(),
                card.getId(),
                trimmed
        );
        return toView(memo);
    }

    /** 본인 메모이거나 매니저 이상만 지운다. */
    @Transactional
    public void delete(AuthPrincipal principal, UUID cardId, UUID memoId) {
        Handoff handoff = readableCard(principal, cardId);
        CardMemo memo = memoRepository.findById(memoId)
                .filter(found -> found.getCardId().equals(cardId))
                .orElseThrow(() -> ApiException.notFound("메모를 찾을 수 없습니다."));
        StoreMember actor = guard.requireActiveMember(handoff.getStoreId(), principal.id());
        boolean manager = actor.getRole() == StoreRole.OWNER || actor.getRole() == StoreRole.MANAGER;
        if (!manager && !memo.getAuthorId().equals(principal.id())) {
            throw ApiException.forbidden("본인이 작성한 메모만 삭제할 수 있습니다.");
        }
        memoRepository.delete(memo);
    }

    private Handoff readableCard(AuthPrincipal principal, UUID cardId) {
        Card card = cardRepository.findById(cardId).orElseThrow(() -> ApiException.notFound("카드를 찾을 수 없습니다."));
        if (card.getDeletedAt() != null) {
            throw ApiException.notFound("카드를 찾을 수 없습니다.");
        }
        Handoff handoff = handoffRepository.findById(card.getHandoffId())
                .orElseThrow(() -> ApiException.notFound("인수인계를 찾을 수 없습니다."));
        if (handoff.getDeletedAt() != null) {
            throw ApiException.notFound("인수인계를 찾을 수 없습니다.");
        }
        guard.requireActiveMember(handoff.getStoreId(), principal.id());
        return handoff;
    }

    private MemoView toView(CardMemo memo) {
        User user = userRepository.findById(memo.getAuthorId()).orElse(null);
        String authorName = user == null || user.getDeletedAt() != null ? "탈퇴한 사용자" : user.getName();
        return new MemoView(
                memo.getId(),
                memo.getCardId(),
                memo.getAuthorId(),
                authorName,
                memo.getBody(),
                memo.getCreatedAt()
        );
    }
}