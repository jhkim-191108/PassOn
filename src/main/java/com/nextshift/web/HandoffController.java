package com.nextshift.web;

import com.nextshift.api.Views.HandoffView;
import com.nextshift.common.AuthPrincipal;
import com.nextshift.service.HandoffService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
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

/** 인수인계 작성, 수정, 분석, 확정, 읽음 처리. */
@RestController
@RequestMapping("/api/handoffs")
public class HandoffController {
    private final HandoffService handoffService;

    public HandoffController(HandoffService handoffService) {
        this.handoffService = handoffService;
    }

    /** 원문을 저장한다. 분석은 하지 않는다. */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public HandoffView create(@Valid @RequestBody HandoffRequest request) {
        return handoffService.create(AuthPrincipal.current(), request.storeId(), request.rawText());
    }

    /** 그 매장의 인수인계를 최신순으로 돌려준다. */
    @GetMapping
    public List<HandoffView> list(@RequestParam UUID storeId) {
        return handoffService.list(AuthPrincipal.current(), storeId);
    }

    /** 인수인계 한 건을 돌려준다. */
    @GetMapping("/{handoffId}")
    public HandoffView get(@PathVariable UUID handoffId) {
        return handoffService.get(AuthPrincipal.current(), handoffId);
    }

    /** 확정 전 원문을 고친다. */
    @PatchMapping("/{handoffId}")
    public HandoffView update(@PathVariable UUID handoffId, @Valid @RequestBody HandoffPatchRequest request) {
        return handoffService.update(AuthPrincipal.current(), handoffId, request.rawText());
    }

    /** 확정 전 인수인계를 지운다. */
    @DeleteMapping("/{handoffId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID handoffId) {
        handoffService.delete(AuthPrincipal.current(), handoffId);
    }

    /** 원문을 카드로 나눈다. 키가 없으면 키워드 분류를 쓴다. */
    @PostMapping("/{handoffId}/analyze")
    public HandoffView analyze(@PathVariable UUID handoffId) {
        return handoffService.analyze(AuthPrincipal.current(), handoffId);
    }

    /** 분석이 끝난 인수인계를 확정한다. */
    @PostMapping("/{handoffId}/confirm")
    public HandoffView confirm(@PathVariable UUID handoffId) {
        return handoffService.confirm(AuthPrincipal.current(), handoffId);
    }

    /** 현재 사용자가 이 인수인계를 읽었다고 기록한다. */
    @PostMapping("/{handoffId}/read")
    public HandoffView read(@PathVariable UUID handoffId) {
        return handoffService.read(AuthPrincipal.current(), handoffId);
    }
}