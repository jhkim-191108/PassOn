package com.nextshift.web;

import com.nextshift.api.Views.EscalationView;
import com.nextshift.common.AuthPrincipal;
import com.nextshift.service.EscalationService;
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

/** 매니저의 위임과 오너의 처리. */
@RestController
public class EscalationController {
    private final EscalationService escalationService;

    public EscalationController(EscalationService escalationService) {
        this.escalationService = escalationService;
    }

    /** 매니저가 카드를 오너에게 올린다. */
    @PostMapping("/api/cards/{cardId}/escalations")
    @ResponseStatus(HttpStatus.CREATED)
    public EscalationView create(@PathVariable UUID cardId, @Valid @RequestBody EscalationRequest request) {
        return escalationService.create(AuthPrincipal.current(), cardId, request.priority());
    }

    /** 위임한 매니저가 취소한다. */
    @DeleteMapping("/api/cards/{cardId}/escalations")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void cancel(@PathVariable UUID cardId) {
        escalationService.cancel(AuthPrincipal.current(), cardId);
    }

    /** 오너의 처리 대기 목록. */
    @GetMapping("/api/stores/{storeId}/escalations")
    public List<EscalationView> list(@PathVariable UUID storeId) {
        return escalationService.list(AuthPrincipal.current(), storeId);
    }

    /** 오너가 처리 완료한다. */
    @PostMapping("/api/cards/{cardId}/escalations/resolve")
    public EscalationView resolve(@PathVariable UUID cardId) {
        return escalationService.resolve(AuthPrincipal.current(), cardId);
    }



}