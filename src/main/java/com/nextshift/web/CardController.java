package com.nextshift.web;

import com.nextshift.api.Views.CardView;
import com.nextshift.common.AuthPrincipal;
import com.nextshift.service.CardService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** 카드 조회와 수정, 완료·다시 열기. 내용 수정은 확정 전에만 된다. */
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

    /** 카드 한 장을 돌려준다. */
    @GetMapping("/api/cards/{cardId}")
    public CardView get(@PathVariable UUID cardId) {
        return cardService.get(AuthPrincipal.current(), cardId);
    }

    /** 보낸 필드만 고친다. 종류가 바뀌면 수정 이력이 남는다. */
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

    /** 확정 전 카드를 지운다. */
    @DeleteMapping("/api/cards/{cardId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID cardId) {
        cardService.delete(AuthPrincipal.current(), cardId);
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