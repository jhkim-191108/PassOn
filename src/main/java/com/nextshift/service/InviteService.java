package com.nextshift.service;

import com.nextshift.api.Views.StoreView;
import com.nextshift.common.ApiException;
import com.nextshift.common.AuthPrincipal;
import com.nextshift.domain.MemberStatus;
import com.nextshift.domain.Store;
import com.nextshift.domain.StoreMember;
import com.nextshift.domain.StoreRole;
import com.nextshift.repo.StoreMemberRepository;
import com.nextshift.repo.StoreRepository;
import com.nextshift.security.PermissionMatrix;
import com.nextshift.security.StoreGuard;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InviteService {
    private final StoreRepository storeRepository;
    private final StoreMemberRepository memberRepository;
    private final StoreGuard guard;
    private final InviteCodes inviteCodes;

    public InviteService(
            StoreRepository storeRepository,
            StoreMemberRepository memberRepository,
            StoreGuard guard,
            InviteCodes inviteCodes
    ) {
        this.storeRepository = storeRepository;
        this.memberRepository = memberRepository;
        this.guard = guard;
        this.inviteCodes = inviteCodes;
    }

    @Transactional
    public StoreView reissue(AuthPrincipal principal, UUID storeId) {
        Store store = guard.requireStore(storeId);
        StoreMember actor = guard.requireActiveMember(storeId, principal.id());
        if (!PermissionMatrix.canUpdateStore(actor.getRole())) {
            throw ApiException.forbidden("초대 코드를 다시 발급할 수 없습니다.");
        }
        store.setInviteCode(inviteCodes.next());
        return StoreService.toView(store, actor.getRole());
    }

    @Transactional
    public StoreView join(AuthPrincipal principal, String rawCode, StoreRole role) {
        if (role != StoreRole.MANAGER && role != StoreRole.STAFF) {
            throw ApiException.badRequest("매니저 또는 직원으로만 참여할 수 있습니다.");
        }
        String code = rawCode == null ? "" : rawCode.trim().replace(" ", "").toUpperCase();
        if (code.isEmpty()) {
            throw ApiException.badRequest("초대 코드를 입력해 주세요.");
        }
        Store store = storeRepository.findByInviteCode(code)
                .orElseThrow(() -> ApiException.notFound("없는 초대 코드입니다."));
        memberRepository.findByStoreIdAndUserId(store.getId(), principal.id()).ifPresent(existing -> {
            if (existing.getStatus() == MemberStatus.SUSPENDED) {
                throw ApiException.forbidden("정지된 멤버입니다.");
            }
            if (existing.getStatus() == MemberStatus.LEFT) {
                throw ApiException.forbidden("퇴사한 멤버입니다.");
            }
            throw ApiException.conflict("이미 참여한 매장입니다.");
        });

        StoreMember member = new StoreMember();
        member.setStoreId(store.getId());
        member.setUserId(principal.id());
        member.setRole(role);
        member.setStatus(MemberStatus.ACTIVE);
        memberRepository.save(member);
        return StoreService.toView(store, role);
    }
}