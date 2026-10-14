package com.nextshift.web;

import com.nextshift.api.Views.CardRevisionView;
import com.nextshift.api.Views.CardView;
import com.nextshift.common.AuthPrincipal;
import com.nextshift.domain.CardProgress;
import com.nextshift.domain.Urgency;
import com.nextshift.service.CardService;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** 카드 조회와 수정, 완료·다시 열기, 담당자, 처리중, 검색, 수정 이력. 내용 수정은 확정 전에만 된다. */
@RestController
public class CardController {
    private final CardService cardService;

    public CardController(CardService cardService) {
        this.cardService = cardService;
    }

    /** 그 인수인계의 카드를 순서대로 돌려준다. */
    @GetMapping("/api/handoffs/{handoffId}/cards")
    public List<CardView> list(@PathVariable UUID handoffId) {
        return cardService.list(AuthPrincipal.current(), handoffId);
    }

    /** 매장의 미완료 카드를 오래된 순으로 돌려준다. */
    @GetMapping("/api/stores/{storeId}/open-cards")
    public List<CardView> openCards(@PathVariable UUID storeId) {
        return cardService.openCards(AuthPrincipal.current(), storeId);
    }

    /** 진행 상태, 중요도, 내 담당, 작성자, 날짜, 제목·내용·작성자·담당자 검색어로 카드를 거른다. */
    @GetMapping("/api/stores/{storeId}/cards")
    public List<CardView> search(
            @PathVariable UUID storeId,
            @RequestParam(required = false) CardProgress progress,
            @RequestParam(required = false) Urgency urgency,
            @RequestParam(required = false) Boolean mine,
            @RequestParam(required = false) UUID authorId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) String q
    ) {
        return cardService.search(AuthPrincipal.current(), storeId, progress, urgency, mine, authorId, from, to, q);
    }

    /** 카드 한 장을 돌려준다. */
    @GetMapping("/api/cards/{cardId}")
    public CardView get(@PathVariable UUID cardId) {
        return cardService.get(AuthPrincipal.current(), cardId);
    }

    /** 카드 수정 이력을 최근 수정이 앞에 오도록 돌려준다. */
    @GetMapping("/api/cards/{cardId}/revisions")
    public List<CardRevisionView> revisions(@PathVariable UUID cardId) {
        return cardService.revisions(AuthPrincipal.current(), cardId);
    }

    /** 보낸 필드만 고친다. 값이 바뀌면 수정 이력이 남는다. */
    @PatchMapping("/api/cards/{cardId}")
    public CardView update(@PathVariable UUID cardId, @Valid @RequestBody CardPatchRequest request) {
        return cardService.update(
                AuthPrincipal.current(),
                cardId,
                request.type(),
                request.title(),
                request.body(),
                request.urgency(),
                request.needsReview()
        );
    }

    /** 확정 전 카드를 휴지통으로 보낸다. */
    @DeleteMapping("/api/cards/{cardId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID cardId) {
        cardService.delete(AuthPrincipal.current(), cardId);
    }

    /** 2주 안의 삭제 카드를 되돌린다. */
    @PostMapping("/api/cards/{cardId}/restore")
    public CardView restore(@PathVariable UUID cardId) {
        return cardService.restore(AuthPrincipal.current(), cardId);
    }

    /** 담당 직원을 지정하거나 해제한다. */
    @PatchMapping("/api/cards/{cardId}/assignee")
    public CardView assign(@PathVariable UUID cardId, @RequestBody AssigneeRequest request) {
        return cardService.assign(AuthPrincipal.current(), cardId, request.memberId());
    }

    /** 카드를 처리중으로 확인한다. */
    @PatchMapping("/api/cards/{cardId}/acknowledge")
    public CardView acknowledge(@PathVariable UUID cardId) {
        return cardService.acknowledge(AuthPrincipal.current(), cardId);
    }

    /** 처리중 확인을 취소한다. */
    @PatchMapping("/api/cards/{cardId}/unacknowledge")
    public CardView unacknowledge(@PathVariable UUID cardId) {
        return cardService.unacknowledge(AuthPrincipal.current(), cardId);
    }

    /** 카드를 처리 완료로 표시한다. */
    @PatchMapping("/api/cards/{cardId}/complete")
    public CardView complete(@PathVariable UUID cardId) {
        return cardService.complete(AuthPrincipal.current(), cardId);
    }

    /** 완료를 취소한다. */
    @PatchMapping("/api/cards/{cardId}/reopen")
    public CardView reopen(@PathVariable UUID cardId) {
        return cardService.reopen(AuthPrincipal.current(), cardId);
    }
}