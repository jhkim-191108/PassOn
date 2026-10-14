package com.nextshift.service;

import com.nextshift.api.Views.RecordView;
import com.nextshift.common.AuthPrincipal;
import com.nextshift.domain.Card;
import com.nextshift.domain.CardRevision;
import com.nextshift.domain.Handoff;
import com.nextshift.domain.User;
import com.nextshift.repo.CardRepository;
import com.nextshift.repo.CardRevisionRepository;
import com.nextshift.repo.HandoffRepository;
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
    private final StoreGuard guard;

    public RecordService(
            HandoffRepository handoffRepository,
            CardRepository cardRepository,
            CardRevisionRepository revisionRepository,
            UserRepository userRepository,
            StoreGuard guard
    ) {
        this.handoffRepository = handoffRepository;
        this.cardRepository = cardRepository;
        this.revisionRepository = revisionRepository;
        this.userRepository = userRepository;
        this.guard = guard;
    }

    /**
     * 매장 멤버가 기록을 본다.
     * q는 제목과 한 사람 이름에 포함되면 통과한다.
     * from과 to는 서울 날짜이며 양 끝을 포함한다.
     * 삭제는 휴지통에 남아 있는 최근 2주와 영구 보관만 나온다.
     */
    @Transactional(readOnly = true)
    public List<RecordView> list(AuthPrincipal principal, UUID storeId, String q, LocalDate from, LocalDate to) {
        guard.requireActiveMember(storeId, principal.id());
        Map<UUID, String> names = new HashMap<>();
        List<RecordView> records = new ArrayList<>();
        for (Handoff handoff : handoffRepository.findByStoreIdAndDeletedAtIsNullOrderByCreatedAtDesc(storeId)) {
            records.add(row("CREATED", handoff.getId(), storeId, handoff.getId(), null, title(handoff.getRawText()), name(names, handoff.getAuthorId()), handoff.getCreatedAt()));
        }
        Map<UUID, Card> cards = new HashMap<>();
        for (Card card : cardRepository.findActiveByStoreId(storeId)) {
            cards.put(card.getId(), card);
            Handoff parent = handoffRepository.findById(card.getHandoffId()).orElse(null);
            UUID authorId = parent == null ? null : parent.getAuthorId();
            records.add(row("CREATED", card.getId(), storeId, card.getHandoffId(), card.getId(), card.getTitle(), name(names, authorId), card.getCreatedAt()));
            if (card.getCompletedAt() != null) {
                records.add(row("COMPLETED", card.getId(), storeId, card.getHandoffId(), card.getId(), card.getTitle(), name(names, card.getCompletedBy()), card.getCompletedAt()));
            }
        }
        for (CardRevision revision : revisionRepository.findByStoreIdOrderByCreatedAtDesc(storeId)) {
            Card card = cards.computeIfAbsent(revision.getCardId(), id -> cardRepository.findById(id).orElse(null));
            String title = card == null ? revision.getAfterValue() : card.getTitle();
            UUID handoffId = card == null ? null : card.getHandoffId();
            records.add(row("UPDATED", revision.getId(), storeId, handoffId, revision.getCardId(), title, name(names, revision.getEditorId()), revision.getCreatedAt()));
        }
        OffsetDateTime since = OffsetDateTime.now(ZoneOffset.UTC).minusDays(TrashService.DAYS);
        for (Handoff handoff : handoffRepository.findTrash(storeId, since)) {
            records.add(row("DELETED", handoff.getId(), storeId, handoff.getId(), null, title(handoff.getRawText()), name(names, handoff.getDeletedBy()), handoff.getDeletedAt()));
        }
        for (Card card : cardRepository.findTrash(storeId, since)) {
            records.add(row("DELETED", card.getId(), storeId, card.getHandoffId(), card.getId(), card.getTitle(), name(names, card.getDeletedBy()), card.getDeletedAt()));
        }
        return records.stream()
                .filter(record -> matches(q, record.title(), record.actorName()))
                .filter(record -> inRange(record.at(), from, to))
                .sorted(Comparator.comparing(RecordView::at, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
    }

    private RecordView row(String action, UUID id, UUID storeId, UUID handoffId, UUID cardId, String title, String actorName, OffsetDateTime at) {
        return new RecordView(action, id, storeId, handoffId, cardId, title, actorName, at);
    }

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

    private static boolean matches(String q, String title, String actor) {
        if (q == null || q.isBlank()) {
            return true;
        }
        String needle = q.trim().toLowerCase(Locale.ROOT);
        return contains(title, needle) || contains(actor, needle);
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
