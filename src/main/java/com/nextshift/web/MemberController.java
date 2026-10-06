package com.nextshift.web;

import com.nextshift.api.Views.MemberView;
import com.nextshift.common.AuthPrincipal;
import com.nextshift.service.MemberService;
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

@RestController
@RequestMapping("/api/stores/{storeId}/members")
public class MemberController {
    private final MemberService memberService;

    public MemberController(MemberService memberService) {
        this.memberService = memberService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MemberView add(@PathVariable UUID storeId, @Valid @RequestBody AddMemberRequest request) {
        return memberService.add(AuthPrincipal.current(), storeId, request.userId(), request.role());
    }

    @GetMapping
    public List<MemberView> list(@PathVariable UUID storeId) {
        return memberService.list(AuthPrincipal.current(), storeId);
    }

    @GetMapping("/{memberId}")
    public MemberView get(@PathVariable UUID storeId, @PathVariable UUID memberId) {
        return memberService.get(AuthPrincipal.current(), storeId, memberId);
    }

    @PatchMapping("/{memberId}")
    public MemberView changeRole(@PathVariable UUID storeId, @PathVariable UUID memberId, @Valid @RequestBody RoleRequest request) {
        return memberService.changeRole(AuthPrincipal.current(), storeId, memberId, request.role());
    }

    @PatchMapping("/{memberId}/team")
    public MemberView changeTeam(
            @PathVariable UUID storeId,
            @PathVariable UUID memberId,
            @RequestBody TeamRequest request
    ) {
        return memberService.changeTeam(AuthPrincipal.current(), storeId, memberId, request.team());
    }

    @PatchMapping("/{memberId}/status")
    public MemberView changeStatus(
            @PathVariable UUID storeId,
            @PathVariable UUID memberId,
            @Valid @RequestBody StatusRequest request
    ) {
        return memberService.changeStatus(AuthPrincipal.current(), storeId, memberId, request.status());
    }

    @DeleteMapping("/{memberId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID storeId, @PathVariable UUID memberId) {
        memberService.delete(AuthPrincipal.current(), storeId, memberId);
    }
}