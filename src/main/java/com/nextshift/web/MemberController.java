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

/** 매장 멤버의 역할, 근무조, 상태. 권한은 MemberService가 StoreGuard로 확인한다. */
@RestController
@RequestMapping("/api/stores/{storeId}/members")
public class MemberController {
    private final MemberService memberService;

    public MemberController(MemberService memberService) {
        this.memberService = memberService;
    }

    /** 이미 가입한 사용자를 이 매장에 넣는다. */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MemberView add(@PathVariable UUID storeId, @Valid @RequestBody AddMemberRequest request) {
        return memberService.add(AuthPrincipal.current(), storeId, request.userId(), request.role());
    }

    /** 매장 멤버 목록을 가입 순으로 돌려준다. */
    @GetMapping
    public List<MemberView> list(@PathVariable UUID storeId) {
        return memberService.list(AuthPrincipal.current(), storeId);
    }

    /** 멤버 한 명을 돌려준다. */
    @GetMapping("/{memberId}")
    public MemberView get(@PathVariable UUID storeId, @PathVariable UUID memberId) {
        return memberService.get(AuthPrincipal.current(), storeId, memberId);
    }

    /** 멤버 역할을 바꾼다. 오너는 다른 오너를 바꾸지 못한다. */
    @PatchMapping("/{memberId}")
    public MemberView changeRole(@PathVariable UUID storeId, @PathVariable UUID memberId, @Valid @RequestBody RoleRequest request) {
        return memberService.changeRole(AuthPrincipal.current(), storeId, memberId, request.role());
    }

    /** 근무조를 바꾼다. 값을 안 보내면 조 지정이 빠진다. */
    @PatchMapping("/{memberId}/team")
    public MemberView changeTeam(
            @PathVariable UUID storeId,
            @PathVariable UUID memberId,
            @RequestBody TeamRequest request
    ) {
        return memberService.changeTeam(AuthPrincipal.current(), storeId, memberId, request.teamId());
    }

    /** 정지하거나 퇴사 처리한다. */
    @PatchMapping("/{memberId}/status")
    public MemberView changeStatus(
            @PathVariable UUID storeId,
            @PathVariable UUID memberId,
            @Valid @RequestBody StatusRequest request
    ) {
        return memberService.changeStatus(AuthPrincipal.current(), storeId, memberId, request.status());
    }

    /** 매장에서 멤버 행을 지운다. 사용자 계정은 남는다. */
    @DeleteMapping("/{memberId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID storeId, @PathVariable UUID memberId) {
        memberService.delete(AuthPrincipal.current(), storeId, memberId);
    }
}