package com.nextshift.web;

import com.nextshift.api.Views.RecordView;
import com.nextshift.common.AuthPrincipal;
import com.nextshift.service.RecordService;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** 기록 조회. 작성, 수정, 처리, 삭제를 한 목록으로 돌려준다. */
@RestController
public class RecordController {
    private final RecordService recordService;

    public RecordController(RecordService recordService) {
        this.recordService = recordService;
    }

    /** 제목·이름 검색어와 서울 날짜로 거른다. 최근 일이 앞에 온다. */
    @GetMapping("/api/stores/{storeId}/records")
    public List<RecordView> list(
            @PathVariable UUID storeId,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return recordService.list(AuthPrincipal.current(), storeId, q, from, to);
    }
}
