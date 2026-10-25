package com.nextshift.service;

import com.nextshift.api.Views.RecordView;
import com.nextshift.common.AuthPrincipal;
import com.nextshift.domain.Card;
import com.nextshift.domain.CardRevision;
import com.nextshift.domain.Handoff;
import com.nextshift.domain.StoreMember;
import com.nextshift.domain.User;
import com.nextshift.repo.CardRepository;
import com.nextshift.repo.CardRevisionRepository;
import com.nextshift.repo.HandoffRepository;
import com.nextshift.repo.StoreMemberRepository;
import com.nextshift.repo.UserRepository;
import com.nextshift.security.StoreGuard;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 기록 조회. 작성, 수정, 처리, 삭제를 한 목록으로 최근 일이 앞에 오게 모은다. */
@Service
public class RecordService {
    private static final ZoneId SEOUL = ZoneId.of("Asia/Seoul");

    private final HandoffRepository handoffRepository;
    private final CardRepository cardRepository;
    private final CardRevisionRepository revisionRepository;
    private final UserRepository userRepository;
    private final StoreMemberRepository memberRepository;
    private final StoreGuard guard;

    public RecordService(
            HandoffRepository handoffRepository,
            CardRepository cardRepository,
            CardRevisionRepository revisionRepository,
            UserRepository userRepository,
            StoreMemberRepository memberRepository,
            StoreGuard guard
    ) {
        this.handoffRepository = handoffRepository;
        this.cardRepository = cardRepository;
        this.revisionRepository = revisionRepository;
        this.userRepository = userRepository;
        this.memberRepository = memberRepository;
        this.guard = guard;
    }

    /**
     * 매장 멤버가 기록을 본다.
     * q는 제목, 내용, 기록한 사람, 담당자 이름에 포함되면 통과한다.
     * from과 to는 서울 날짜이며 양 끝을 포함한다.
     * 삭제는 휴지통에 남아 있는 최근 2주와 영구 보관만 나온다.
     */
    @Transactional(readOnly = true)
    public List<RecordView> list(AuthPrincipal principal, UUID storeId, String q, LocalDate from, LocalDate to) {
        guard.requireActiveMember(storeId, principal.id());
        Map<UUID, String> names = new HashMap<>();
        Map<UUID, String> assignees = new HashMap<>();
        List<Row> rows = new ArrayList<>();
        for (Handoff handoff : handoffRepository.findByStoreIdAndDeletedAtIsNullOrderByCreatedAtDesc(storeId)) {
            rows.add(handoffRow("CREATED", handoff, storeId, name(names, handoff.getAuthorId()), handoff.getCreatedAt()));
        }
        Map<UUID, Card> cards = new HashMap<>();
        for (Card card : cardRepository.findActiveByStoreId(storeId)) {
            cards.put(card.getId(), card);
            Handoff parent = handoffRepository.findById(card.getHandoffId()).orElse(null);
            UUID authorId = parent == null ? null : parent.getAuthorId();
            rows.add(cardRow("CREATED", card.getId(), card, storeId, name(names, authorId), card.getCreatedAt(), assignees));
            if (card.getAcknowledgedAt() != null) {
                rows.add(cardRow("ACKNOWLEDGED", card.getId(), card, storeId, name(names, card.getAcknowledgedBy()), card.getAcknowledgedAt(), assignees));
            }
            if (card.getCompletedAt() != null) {
                rows.add(cardRow("COMPLETED", card.getId(), card, storeId, name(names, card.getCompletedBy()), card.getCompletedAt(), assignees));
            }
        }
        for (CardRevision revision : revisionRepository.findByStoreIdOrderByCreatedAtDesc(storeId)) {
            Card card = cards.computeIfAbsent(revision.getCardId(), id -> cardRepository.findById(id).orElse(null));
            String actor = name(names, revision.getEditorId());
            if (card == null) {
                RecordView view = new RecordView("UPDATED", revision.getId(), storeId, null, revision.getCardId(), revision.getAfterValue(), actor, revision.getCreatedAt(), null, null);
                rows.add(new Row(view, ""));
            } else {
                rows.add(cardRow("UPDATED", revision.getId(), card, storeId, actor, revision.getCreatedAt(), assignees));
            }
        }
        OffsetDateTime since = OffsetDateTime.now(ZoneOffset.UTC).minusDays(TrashService.DAYS);
        for (Handoff handoff : handoffRepository.findTrash(storeId, since)) {
            rows.add(handoffRow("DELETED", handoff, storeId, name(names, handoff.getDeletedBy()), handoff.getDeletedAt()));
        }
        for (Card card : cardRepository.findTrash(storeId, since)) {
            rows.add(cardRow("DELETED", card.getId(), card, storeId, name(names, card.getDeletedBy()), card.getDeletedAt(), assignees));
        }
        return rows.stream()
                .filter(row -> matches(q, row.view().title(), row.view().actorName(), row.search()))
                .map(Row::view)
                .filter(record -> inRange(record.at(), from, to))
                .sorted(Comparator.comparing(RecordView::at, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
    }

    private Row handoffRow(String action, Handoff handoff, UUID storeId, String actorName, OffsetDateTime at) {
        RecordView view = new RecordView(action, handoff.getId(), storeId, handoff.getId(), null, title(handoff.getRawText()), actorName, at, null, null);
        return new Row(view, handoff.getRawText());
    }

    private Row cardRow(String action, UUID id, Card card, UUID storeId, String actorName, OffsetDateTime at, Map<UUID, String> assignees) {
        RecordView view = new RecordView(action, id, storeId, card.getHandoffId(), card.getId(), card.getTitle(), actorName, at,
                card.getUrgency(), card.getCompletedAt() != null);
        String assignee = card.getAssigneeMemberId() == null ? "" : assignees.computeIfAbsent(card.getAssigneeMemberId(), this::memberName);
        return new Row(view, card.getBody() + " " + assignee);
    }

    private String memberName(UUID memberId) {
        StoreMember member = memberRepository.findById(memberId).orElse(null);
        if (member == null) {
            return "";
        }
        User user = userRepository.findById(member.getUserId()).orElse(null);
        return user == null || user.getDeletedAt() != null ? "" : user.getName();
    }

    /** 검색에만 쓰는 내용과 담당자 이름을 기록 한 줄과 함께 들고 다닌다. */
    private record Row(RecordView view, String search) {}

    private String name(Map<UUID, String> names, UUID userId) {
        if (userId == null) {
            return "알 수 없는 사용자";
        }
        return names.computeIfAbsent(userId, id -> {
            User user = userRepository.findById(id).orElse(null);
            if (user == null || user.getDeletedAt() != null) {
                return "탈퇴한 사용자";
            }
            return user.getName();
        });
    }

    private static String title(String raw) {
        if (raw == null || raw.isBlank()) {
            return "인수인계";
        }
        String line = raw.strip().split("\\R", 2)[0].strip();
        if (line.isEmpty()) {
            return "인수인계";
        }
        return line.length() <= 80 ? line : line.substring(0, 80);
    }

    private static boolean matches(String q, String title, String actor, String search) {
        if (q == null || q.isBlank()) {
            return true;
        }
        String needle = q.trim().toLowerCase(Locale.ROOT);
        return contains(title, needle) || contains(actor, needle) || contains(search, needle);
    }

    private static boolean contains(String value, String needle) {
        return value != null && value.toLowerCase(Locale.ROOT).contains(needle);
    }

    private static boolean inRange(OffsetDateTime at, LocalDate from, LocalDate to) {
        if (from == null && to == null) {
            return true;
        }
        if (at == null) {
            return false;
        }
        LocalDate day = at.atZoneSameInstant(SEOUL).toLocalDate();
        if (from != null && day.isBefore(from)) {
            return false;
        }
        return to == null || !day.isAfter(to);
    }
}
