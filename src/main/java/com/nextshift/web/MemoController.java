package com.nextshift.web;

import com.nextshift.api.Views.MemoView;
import com.nextshift.common.AuthPrincipal;
import com.nextshift.service.MemoService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** 카드 후속 메모. */
@RestController
@RequestMapping("/api/cards/{cardId}/memos")
public class MemoController {
    private final MemoService memoService;

    public MemoController(MemoService memoService) {
        this.memoService = memoService;
    }

    /** 메모를 작성 순으로 돌려준다. */
    @GetMapping
    public List<MemoView> list(@PathVariable UUID cardId) {
        return memoService.list(AuthPrincipal.current(), cardId);
    }

    /** 후속 메모를 붙인다. */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MemoView create(@PathVariable UUID cardId, @Valid @RequestBody MemoRequest request) {
        return memoService.create(AuthPrincipal.current(), cardId, request.body());
    }

    /** 본인 메모이거나 매니저 이상만 지운다. */
    @DeleteMapping("/{memoId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID cardId, @PathVariable UUID memoId) {
        memoService.delete(AuthPrincipal.current(), cardId, memoId);
    }
}