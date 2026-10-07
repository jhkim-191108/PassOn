package com.nextshift.service;

import com.nextshift.api.Views.HandoffView;
import com.nextshift.common.ApiException;
import com.nextshift.common.AuthPrincipal;
import com.nextshift.config.AppProperties;
import com.nextshift.domain.AiRequest;
import com.nextshift.domain.Card;
import com.nextshift.domain.Handoff;
import com.nextshift.domain.HandoffRead;
import com.nextshift.domain.HandoffStatus;
import com.nextshift.domain.StoreMember;
import com.nextshift.domain.User;
import com.nextshift.handoff.HandoffAnalyzer;
import com.nextshift.handoff.HandoffAnalyzer.CardDraft;
import com.nextshift.handoff.HandoffAnalyzer.CorrectionExample;
import com.nextshift.repo.AiRequestRepository;
import com.nextshift.repo.CardRepository;
import com.nextshift.repo.CardTypeCorrectionRepository;
import com.nextshift.repo.HandoffReadRepository;
import com.nextshift.repo.HandoffRepository;
import com.nextshift.repo.UserRepository;
import com.nextshift.security.StoreGuard;
import jakarta.persistence.EntityManager;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

/** 인수인계 원문과 분석. 모델 호출은 트랜잭션 밖에서 하고, 결과 저장만 트랜잭션으로 감싼다. */
@Service
public class HandoffService {
    private static final ZoneId SEOUL = ZoneId.of("Asia/Seoul");

    private final HandoffRepository handoffRepository;
    private final CardRepository cardRepository;
    private final HandoffReadRepository readRepository;
    private final CardTypeCorrectionRepository correctionRepository;
    private final AiRequestRepository aiRequestRepository;
    private final UserRepository userRepository;
    private final StoreGuard guard;
    private final HandoffAnalyzer analyzer;
    private final AppProperties properties;
    private final EntityManager entityManager;
    private final TransactionTemplate transactionTemplate;

    public HandoffService(
            HandoffRepository handoffRepository,
            CardRepository cardRepository,
            HandoffReadRepository readRepository,
            CardTypeCorrectionRepository correctionRepository,
            AiRequestRepository aiRequestRepository,
            UserRepository userRepository,
            StoreGuard guard,
            HandoffAnalyzer analyzer,
            AppProperties properties,
            EntityManager entityManager,
            PlatformTransactionManager transactionManager
    ) {
        this.handoffRepository = handoffRepository;
        this.cardRepository = cardRepository;
        this.readRepository = readRepository;
        this.correctionRepository = correctionRepository;
        this.aiRequestRepository = aiRequestRepository;
        this.userRepository = userRepository;
        this.guard = guard;
        this.analyzer = analyzer;
        this.properties = properties;
        this.entityManager = entityManager;
        this.transactionTemplate = new TransactionTemplate(transactionManager);
    }

    /** 원문만 저장하고 DRAFT로 둔다. 분석은 따로 호출한다. */
    @Transactional
    public HandoffView create(AuthPrincipal principal, UUID storeId, String rawText) {
        guard.requireActiveMember(storeId, principal.id());
        Handoff handoff = new Handoff();
        handoff.setStoreId(storeId);
        handoff.setAuthorId(principal.id());
        handoff.setRawText(rawText.trim());
        handoff.setStatus(HandoffStatus.DRAFT);
        handoffRepository.save(handoff);
        return one(principal, handoff);
    }

    /** 활동 중인 멤버에게 그 매장 인수인계를 최신순으로 돌려준다. */
    @Transactional(readOnly = true)
    public List<HandoffView> list(AuthPrincipal principal, UUID storeId) {
        guard.requireActiveMember(storeId, principal.id());
        List<Handoff> handoffs = handoffRepository.findByStoreIdOrderByCreatedAtDesc(storeId);
        return toViews(principal.id(), handoffs);
    }

    /** 그 매장 멤버만 인수인계 한 건을 본다. */
    @Transactional(readOnly = true)
    public HandoffView get(AuthPrincipal principal, UUID handoffId) {
        Handoff handoff = requireReadable(principal, handoffId);
        return one(principal, handoff);
    }

    /** 확정 전과 분석 중이 아닐 때만 원문을 고친다. 이미 분석됐으면 카드를 지우고 DRAFT로 되돌린다. */
    @Transactional
    public HandoffView update(AuthPrincipal principal, UUID handoffId, String rawText) {
        Handoff handoff = requireReadable(principal, handoffId);
        StoreMember actor = guard.requireActiveMember(handoff.getStoreId(), principal.id());
        guard.requireAuthored(actor, handoff.getAuthorId());
        requireOpen(handoff, "수정");
        if (handoff.getStatus() == HandoffStatus.ANALYZING) {
            throw ApiException.conflict("분석 중인 인수인계는 수정할 수 없습니다.");
        }
        handoff.setRawText(rawText.trim());
        if (handoff.getStatus() == HandoffStatus.ANALYZED || handoff.getStatus() == HandoffStatus.FAILED) {
            deleteCards(handoff.getId());
            handoff.setStatus(HandoffStatus.DRAFT);
            handoff.setAnalyzedAt(null);
            handoff.setAnalyzeError(null);
        }
        return one(principal, handoff);
    }

    /** 작성 권한이 있고 확정 전일 때만 지운다. */
    @Transactional
    public void delete(AuthPrincipal principal, UUID handoffId) {
        Handoff handoff = requireReadable(principal, handoffId);
        StoreMember actor = guard.requireActiveMember(handoff.getStoreId(), principal.id());
        guard.requireAuthored(actor, handoff.getAuthorId());
        requireOpen(handoff, "삭제");
        handoffRepository.delete(handoff);
    }

    /** 분석 시작을 먼저 저장한 뒤 모델을 부르고, 성공·실패를 각각 다시 저장한다. */
    public HandoffView analyze(AuthPrincipal principal, UUID handoffId) {
        AnalysisContext context = transactionTemplate.execute(status -> begin(principal, handoffId));
        try {
            List<CardDraft> drafts = analyzer.analyze(context.rawText(), context.examples());
            if (drafts == null || drafts.isEmpty()) {
                throw new IllegalStateException("카드를 만들지 못했습니다.");
            }
            return transactionTemplate.execute(status -> succeed(principal, handoffId, context.rawText(), drafts));
        } catch (RuntimeException ex) {
            if (ex instanceof ApiException) {
                throw ex;
            }
            return transactionTemplate.execute(status -> fail(principal, handoffId, ex.getMessage()));
        }
    }

    /** ANALYZED인 인수인계만 확정한다. */
    @Transactional
    public HandoffView confirm(AuthPrincipal principal, UUID handoffId) {
        Handoff handoff = requireReadable(principal, handoffId);
        if (handoff.getStatus() != HandoffStatus.ANALYZED) {
            throw ApiException.conflict("분석이 끝난 인수인계만 확정할 수 있습니다.");
        }
        handoff.setStatus(HandoffStatus.CONFIRMED);
        handoff.setConfirmedAt(OffsetDateTime.now(ZoneOffset.UTC));
        handoff.setConfirmedBy(principal.id());
        return one(principal, handoff);
    }

    /** 이 사용자가 이 인수인계를 읽었다고 시각을 남긴다. 있으면 시각만 갱신한다. */
    @Transactional
    public HandoffView read(AuthPrincipal principal, UUID handoffId) {
        Handoff handoff = requireReadable(principal, handoffId);
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        readRepository.findByHandoffIdAndUserId(handoffId, principal.id()).ifPresentOrElse(
                existing -> existing.setReadAt(now),
                () -> {
                    HandoffRead read = new HandoffRead();
                    read.setHandoffId(handoffId);
                    read.setUserId(principal.id());
                    read.setReadAt(now);
                    readRepository.save(read);
                }
        );
        return one(principal, handoff);
    }

    private AnalysisContext begin(AuthPrincipal principal, UUID handoffId) {
        Handoff handoff = requireReadable(principal, handoffId);
        if (handoff.getStatus() == HandoffStatus.CONFIRMED) {
            throw ApiException.conflict("확정된 인수인계는 분석할 수 없습니다.");
        }
        if (handoff.getStatus() == HandoffStatus.ANALYZING) {
            throw ApiException.conflict("이미 분석 중입니다.");
        }
        OffsetDateTime since = OffsetDateTime.now(SEOUL).toLocalDate().atStartOfDay(SEOUL).toOffsetDateTime();
        int dailyLimit = properties.ai() == null ? 20 : properties.ai().dailyLimit();
        if (aiRequestRepository.countSince(principal.id(), since) >= dailyLimit) {
            throw ApiException.tooMany("오늘 분석 횟수를 모두 사용했습니다.");
        }
        AiRequest request = new AiRequest();
        request.setUserId(principal.id());
        request.setHandoffId(handoffId);
        aiRequestRepository.save(request);
        handoff.setStatus(HandoffStatus.ANALYZING);
        handoff.setAnalyzeError(null);
        List<CorrectionExample> examples = correctionRepository.findTop10ByStoreIdOrderByCreatedAtDesc(handoff.getStoreId())
                .stream()
                .map(row -> new CorrectionExample(row.getSourceQuote(), row.getFromType(), row.getToType()))
                .toList();
        return new AnalysisContext(handoff.getRawText(), examples);
    }

    private HandoffView succeed(AuthPrincipal principal, UUID handoffId, String rawText, List<CardDraft> drafts) {
        Handoff handoff = handoffRepository.findById(handoffId).orElseThrow(() -> ApiException.notFound("인수인계를 찾을 수 없습니다."));
        deleteCards(handoffId);
        int position = 0;
        for (CardDraft draft : drafts) {
            Card card = new Card();
            card.setHandoffId(handoffId);
            card.setType(draft.type() == null ? com.nextshift.domain.CardType.TASK : draft.type());
            String title = draft.title() == null ? "" : draft.title().trim();
            card.setTitle(title.isBlank() ? "확인 필요" : trim(title, 120));
            card.setBody(draft.body() == null ? "" : draft.body());
            card.setUrgency(draft.urgency() == null ? com.nextshift.domain.Urgency.LATER : draft.urgency());
            String quote = draft.sourceQuote() == null ? "" : draft.sourceQuote();
            boolean quoted = !quote.isBlank() && rawText.contains(quote);
            card.setSourceQuote(quoted ? quote : "");
            card.setNeedsReview(draft.needsReview() || !quoted);
            card.setPosition(position++);
            cardRepository.save(card);
        }
        handoff.setStatus(HandoffStatus.ANALYZED);
        handoff.setAnalyzedAt(OffsetDateTime.now(ZoneOffset.UTC));
        handoff.setAnalyzeError(null);
        entityManager.flush();
        return one(principal, handoff);
    }

    private HandoffView fail(AuthPrincipal principal, UUID handoffId, String message) {
        Handoff handoff = handoffRepository.findById(handoffId).orElseThrow(() -> ApiException.notFound("인수인계를 찾을 수 없습니다."));
        handoff.setStatus(HandoffStatus.FAILED);
        handoff.setAnalyzeError(trim(message == null ? "분석에 실패했습니다." : message, 300));
        return one(principal, handoff);
    }

    private Handoff requireReadable(AuthPrincipal principal, UUID handoffId) {
        Handoff handoff = handoffRepository.findById(handoffId)
                .orElseThrow(() -> ApiException.notFound("인수인계를 찾을 수 없습니다."));
        guard.requireActiveMember(handoff.getStoreId(), principal.id());
        return handoff;
    }

    private void deleteCards(UUID handoffId) {
        cardRepository.deleteAll(cardRepository.findByHandoffIdOrderByPositionAsc(handoffId));
        entityManager.flush();
    }

    private static void requireOpen(Handoff handoff, String action) {
        if (handoff.getStatus() == HandoffStatus.CONFIRMED) {
            throw ApiException.conflict("확정된 인수인계는 " + action + "할 수 없습니다.");
        }
    }

    private HandoffView one(AuthPrincipal principal, Handoff handoff) {
        return toViews(principal.id(), List.of(handoff)).getFirst();
    }

    private List<HandoffView> toViews(UUID userId, List<Handoff> handoffs) {
        if (handoffs.isEmpty()) {
            return List.of();
        }
        List<UUID> ids = handoffs.stream().map(Handoff::getId).toList();
        Map<UUID, long[]> counts = new HashMap<>();
        for (Object[] row : cardRepository.countByHandoffIds(ids)) {
            counts.put((UUID) row[0], new long[] {((Number) row[1]).longValue(), ((Number) row[2]).longValue()});
        }
        Set<UUID> readIds = Set.copyOf(readRepository.findReadHandoffIds(userId, ids));
        Map<UUID, User> authors = userRepository.findAllById(handoffs.stream().map(Handoff::getAuthorId).collect(Collectors.toSet()))
                .stream()
                .collect(Collectors.toMap(User::getId, Function.identity()));
        return handoffs.stream().map(handoff -> {
            long[] count = counts.getOrDefault(handoff.getId(), new long[] {0, 0});
            User author = authors.get(handoff.getAuthorId());
            String authorName = author == null || author.getDeletedAt() != null ? "탈퇴한 사용자" : author.getName();
            return new HandoffView(
                    handoff.getId(),
                    handoff.getStoreId(),
                    handoff.getAuthorId(),
                    authorName,
                    handoff.getRawText(),
                    handoff.getStatus(),
                    handoff.getAnalyzeError(),
                    handoff.getAnalyzedAt(),
                    handoff.getConfirmedAt(),
                    handoff.getConfirmedBy(),
                    handoff.getCreatedAt(),
                    handoff.getUpdatedAt(),
                    readIds.contains(handoff.getId()),
                    count[0],
                    count[1]
            );
        }).toList();
    }

    private static String trim(String value, int max) {
        if (value == null) {
            return "";
        }
        return value.length() <= max ? value : value.substring(0, max);
    }

    private record AnalysisContext(String rawText, List<CorrectionExample> examples) {}
}