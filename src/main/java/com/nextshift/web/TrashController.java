package com.nextshift.web;

import com.nextshift.api.Views.PurgeView;
import com.nextshift.api.Views.TrashItemView;
import com.nextshift.common.AuthPrincipal;
import com.nextshift.service.PurgeService;
import com.nextshift.service.TrashService;
import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** 최근 2주 삭제 항목. */
@RestController
@RequestMapping("/api/stores/{storeId}/trash")
public class TrashController {
    private final TrashService trashService;
    private final PurgeService purgeService;

    public TrashController(TrashService trashService, PurgeService purgeService) {
        this.trashService = trashService;
        this.purgeService = purgeService;
    }

    /** 복원 가능한 삭제 항목을 최근 삭제순으로 돌려준다. */
    @GetMapping
    public List<TrashItemView> list(@PathVariable UUID storeId) {
        return trashService.list(AuthPrincipal.current(), storeId);
    }

    /** 2주가 지난 미보관 항목을 지운다. 오너만 가능하다. */
    @PostMapping("/purge")
    public PurgeView purge(@PathVariable UUID storeId) {
        return purgeService.purgeStore(AuthPrincipal.current(), storeId);
    }
}