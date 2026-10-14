package com.nextshift.web;

import com.nextshift.api.Views.KeepView;
import com.nextshift.api.Views.TrashItemView;
import com.nextshift.common.AuthPrincipal;
import com.nextshift.service.KeepService;
import com.nextshift.service.TrashService;
import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

/** 오너 영구 보관. */
@RestController
public class KeepController {
    private final KeepService keepService;
    private final TrashService trashService;

    public KeepController(KeepService keepService, TrashService trashService) {
        this.keepService = keepService;
        this.trashService = trashService;
    }

    /** 그 매장에서 오너가 보관한 항목. */
    @GetMapping("/api/stores/{storeId}/kept")
    public List<TrashItemView> kept(@PathVariable UUID storeId) {
        return trashService.kept(AuthPrincipal.current(), storeId);
    }

    /** 인수인계를 영구 보관한다. */
    @PostMapping("/api/handoffs/{handoffId}/keep")
    public KeepView keepHandoff(@PathVariable UUID handoffId) {
        return keepService.keepHandoff(AuthPrincipal.current(), handoffId, true);
    }

    /** 인수인계 영구 보관을 해제한다. */
    @DeleteMapping("/api/handoffs/{handoffId}/keep")
    public KeepView unkeepHandoff(@PathVariable UUID handoffId) {
        return keepService.keepHandoff(AuthPrincipal.current(), handoffId, false);
    }

    /** 카드를 영구 보관한다. */
    @PostMapping("/api/cards/{cardId}/keep")
    public KeepView keepCard(@PathVariable UUID cardId) {
        return keepService.keepCard(AuthPrincipal.current(), cardId, true);
    }

    /** 카드 영구 보관을 해제한다. */
    @DeleteMapping("/api/cards/{cardId}/keep")
    public KeepView unkeepCard(@PathVariable UUID cardId) {
        return keepService.keepCard(AuthPrincipal.current(), cardId, false);
    }
}