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

@RestController
@RequestMapping("/api/stores")
public class InviteController {
    private final InviteService inviteService;

    public InviteController(InviteService inviteService) {
        this.inviteService = inviteService;
    }

    @PostMapping("/join")
    public StoreView join(@Valid @RequestBody JoinStoreRequest request) {
        return inviteService.join(AuthPrincipal.current(), request.code(), request.role());
    }

    @PostMapping("/{storeId}/invite")
    public StoreView reissue(@PathVariable UUID storeId) {
        return inviteService.reissue(AuthPrincipal.current(), storeId);
    }
}