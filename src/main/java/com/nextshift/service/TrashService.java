package com.nextshift.service;

import com.nextshift.api.Views.TrashItemView;
import com.nextshift.common.ApiException;
import com.nextshift.common.AuthPrincipal;
import com.nextshift.domain.Card;
import com.nextshift.domain.Handoff;
import com.nextshift.domain.StoreMember;
import com.nextshift.domain.StoreRole;
import com.nextshift.domain.TrashKind;
import com.nextshift.domain.User;
import com.nextshift.repo.CardRepository;
import com.nextshift.repo.HandoffRepository;
import com.nextshift.repo.UserRepository;
import com.nextshift.security.PermissionMatrix;
import com.nextshift.security.StoreGuard;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 최근 2주 안에 지운 인수인계와 카드. 영구 보관은 그 이후에도 목록에 남긴다. */
@Service
public class TrashService {
    public static final int DAYS = 14;

    private final HandoffRepository handoffRepository;
    private final CardRepository cardRepository;
    private final UserRepository userRepository;
    private final StoreGuard guard;

    public TrashService(
            HandoffRepository handoffRepository,
            CardRepository cardRepository,
            UserRepository userRepository,
            StoreGuard guard
    ) {
        this.handoffRepository = handoffRepository;
        this.cardRepository = cardRepository;
        this.userRepository = userRepository;
        this.guard = guard;
    }

    /** 복원 가능한 삭제 항목과, 기한이 지나도 보관한 항목을 최근 삭제순으로 돌려준다. */
    @Transactional(readOnly = true)
    public List<TrashItemView> list(AuthPrincipal principal, UUID storeId) {
        StoreMember member = guard.requireActiveMember(storeId, principal.id());
        OffsetDateTime since = OffsetDateTime.now(ZoneOffset.UTC).minusDays(DAYS);
        Map<UUID, StoreRole> authorRoles = new HashMap<>();
        List<Handoff> handoffs = handoffRepository.findTrash(storeId, since).stream()
                .filter(handoff -> visible(member, handoff.getAuthorId(), authorRoles))
                .toList();
        Map<UUID, Handoff> parents = new HashMap<>();
        List<Card> cards = cardRepository.findTrash(storeId, since).stream()
                .filter(card -> {
                    Handoff parent = parents.computeIfAbsent(card.getHandoffId(), id -> handoffRepository.findById(id).orElse(null));
                    return parent != null && visible(member, parent.getAuthorId(), authorRoles);
                })
                .toList();
        return items(storeId, handoffs, cards);
    }

    /** 오너가 영구 보관으로 체크한 인수인계와 카드. */
    @Transactional(readOnly = true)
    public List<TrashItemView> kept(AuthPrincipal principal, UUID storeId) {
        StoreMember member = guard.requireActiveMember(storeId, principal.id());
        if (member.getRole() != StoreRole.OWNER) {
            throw ApiException.forbidden("오너만 영구 보관 목록을 볼 수 있습니다.");
        }
        List<Handoff> handoffs = handoffRepository.findKept(storeId);
        List<Card> cards = cardRepository.findKept(storeId);
        return items(storeId, handoffs, cards);
    }

    private List<TrashItemView> items(UUID storeId, List<Handoff> handoffs, List<Card> cards) {
        Map<UUID, String> names = names(handoffs, cards);
        List<TrashItemView> items = new ArrayList<>();
        for (Handoff handoff : handoffs) {
            items.add(new TrashItemView(
                    TrashKind.HANDOFF,
                    handoff.getId(),
                    handoff.getStoreId(),
                    handoff.getId(),
                    snippet(handoff.getRawText()),
                    handoff.getDeletedBy(),
                    handoff.getDeletedBy() == null ? null : names.getOrDefault(handoff.getDeletedBy(), "알 수 없는 사용자"),
                    handoff.getDeletedAt(),
                    handoff.getDeletedAt() == null ? null : handoff.getDeletedAt().plusDays(DAYS),
                    handoff.getKeptAt() != null
            ));
        }
        for (Card card : cards) {
            items.add(new TrashItemView(
                    TrashKind.CARD,
                    card.getId(),
                    storeId,
                    card.getHandoffId(),
                    card.getTitle(),
                    card.getDeletedBy(),
                    card.getDeletedBy() == null ? null : names.getOrDefault(card.getDeletedBy(), "알 수 없는 사용자"),
                    card.getDeletedAt(),
                    card.getDeletedAt() == null ? null : card.getDeletedAt().plusDays(DAYS),
                    card.getKeptAt() != null
            ));
        }
        items.sort(Comparator.comparing(TrashItemView::deletedAt, Comparator.nullsLast(Comparator.reverseOrder())));
        return items;
    }

    private boolean visible(StoreMember actor, UUID authorId, Map<UUID, StoreRole> authorRoles) {
        StoreRole authorRole = authorRoles.computeIfAbsent(authorId, id -> guard.authorRole(actor.getStoreId(), id));
        return PermissionMatrix.canViewTrash(actor.getRole(), actor.getUserId(), authorRole, authorId);
    }

    private Map<UUID, String> names(List<Handoff> handoffs, List<Card> cards) {
        List<UUID> ids = new ArrayList<>();
        for (Handoff handoff : handoffs) {
            if (handoff.getDeletedBy() != null) {
                ids.add(handoff.getDeletedBy());
            }
        }
        for (Card card : cards) {
            if (card.getDeletedBy() != null) {
                ids.add(card.getDeletedBy());
            }
        }
        Map<UUID, String> names = new HashMap<>();
        for (User user : userRepository.findAllById(ids)) {
            names.put(user.getId(), user.getDeletedAt() == null ? user.getName() : "탈퇴한 사용자");
        }
        return names;
    }

    private static String snippet(String raw) {
        String one = raw.replaceAll("\\s+", " ").trim();
        return one.length() <= 80 ? one : one.substring(0, 80);
    }
}