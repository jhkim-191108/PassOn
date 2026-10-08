package com.nextshift.web;

import com.nextshift.api.Views.NoticeView;
import com.nextshift.common.AuthPrincipal;
import com.nextshift.service.NoticeService;
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
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** 매장 공지 작성, 조회, 수정, 삭제. 작성·수정·삭제는 오너와 매니저만 된다. */
@RestController
@RequestMapping("/api/stores/{storeId}/notices")
public class NoticeController {
    private final NoticeService noticeService;

    public NoticeController(NoticeService noticeService) {
        this.noticeService = noticeService;
    }

    /** 공지를 만든다. pinned와 important를 생략하면 거짓이다. */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public NoticeView create(@PathVariable UUID storeId, @Valid @RequestBody NoticeRequest request) {
        return noticeService.create(
                AuthPrincipal.current(),
                storeId,
                request.title(),
                request.body(),
                request.pinned(),
                request.important()
        );
    }

    /** 고정 공지를 먼저, 그다음 최신순으로 돌려준다. */
    @GetMapping
    public List<NoticeView> list(@PathVariable UUID storeId) {
        return noticeService.list(AuthPrincipal.current(), storeId);
    }

    /** 공지 한 건을 돌려준다. */
    @GetMapping("/{noticeId}")
    public NoticeView get(@PathVariable UUID storeId, @PathVariable UUID noticeId) {
        return noticeService.get(AuthPrincipal.current(), noticeId);
    }

    /** 보낸 필드만 고친다. */
    @PatchMapping("/{noticeId}")
    public NoticeView update(@PathVariable UUID storeId, @PathVariable UUID noticeId, @Valid @RequestBody NoticePatchRequest request) {
        return noticeService.update(
                AuthPrincipal.current(),
                noticeId,
                request.title(),
                request.body(),
                request.pinned(),
                request.important()
        );
    }

    /** 공지를 지운다. */
    @DeleteMapping("/{noticeId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID storeId, @PathVariable UUID noticeId) {
        noticeService.delete(AuthPrincipal.current(), noticeId);
    }
}