package com.nextshift.web;

import com.nextshift.api.Views.StoreView;
import com.nextshift.common.AuthPrincipal;
import com.nextshift.service.InviteService;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** 초대 코드로 매장에 들어가거나, 코드를 새로 발급한다. */
@RestController
@RequestMapping("/api/stores")
public class InviteController {
    private final InviteService inviteService;

    public InviteController(InviteService inviteService) {
        this.inviteService = inviteService;
    }

    /** 초대 코드로 매니저 또는 직원으로 들어간다. */
    @PostMapping("/join")
    public StoreView join(@Valid @RequestBody JoinStoreRequest request) {
        return inviteService.join(AuthPrincipal.current(), request.code(), request.role());
    }

    /** 초대 코드를 새로 발급한다. 이전 코드는 더 이상 쓸 수 없다. */
    @PostMapping("/{storeId}/invite")
    public StoreView reissue(@PathVariable UUID storeId) {
        return inviteService.reissue(AuthPrincipal.current(), storeId);
    }
}