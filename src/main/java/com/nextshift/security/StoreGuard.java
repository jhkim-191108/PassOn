package com.nextshift.security;

import com.nextshift.common.ApiException;
import com.nextshift.domain.MemberStatus;
import com.nextshift.domain.Store;
import com.nextshift.domain.StoreMember;
import com.nextshift.repo.StoreMemberRepository;
import com.nextshift.repo.StoreRepository;
import java.util.UUID;
import org.springframework.stereotype.Service;
import com.nextshift.domain.StoreRole;

@Service
public class StoreGuard {
    private final StoreRepository storeRepository;
    private final StoreMemberRepository memberRepository;

    public StoreGuard(StoreRepository storeRepository, StoreMemberRepository memberRepository) {
        this.storeRepository = storeRepository;
        this.memberRepository = memberRepository;
    }

    public Store requireStore(UUID storeId) {
        return storeRepository.findById(storeId).orElseThrow(() -> ApiException.notFound("매장을 찾을 수 없습니다."));
    }

    public StoreMember requireActiveMember(UUID storeId, UUID userId) {
        requireStore(storeId);
        StoreMember member = memberRepository.findByStoreIdAndUserId(storeId, userId)
                .orElseThrow(() -> ApiException.forbidden("이 매장의 멤버가 아닙니다."));
        if (member.getStatus() != MemberStatus.ACTIVE) {
            throw ApiException.forbidden("정지된 멤버입니다.");
        }
        return member;
    }

    public void requireStoreUpdate(StoreMember member) {
        if (!PermissionMatrix.canUpdateStore(member.getRole())) {
            throw ApiException.forbidden("매장 수정 권한이 없습니다.");
        }
    }

    public void requireStoreDelete(StoreMember member) {
        if (!PermissionMatrix.canDeleteStore(member.getRole())) {
            throw ApiException.forbidden("매장 삭제 권한이 없습니다.");
        }
    }

    public void requireMemberCreate(StoreMember actor, StoreRole assigned) {
        if (!PermissionMatrix.canAssign(actor.getRole(), assigned)) {
            throw ApiException.forbidden("이 역할의 멤버를 추가할 수 없습니다.");
        }
    }

    public void requireMemberModify(StoreMember actor, StoreMember target) {
        if (!PermissionMatrix.canModifyMember(actor.getRole(), target.getRole())) {
            throw ApiException.forbidden("이 멤버를 수정할 수 없습니다.");
        }
    }

    public void requireAssign(StoreMember actor, StoreRole assigned) {
        if (!PermissionMatrix.canAssign(actor.getRole(), assigned)) {
            throw ApiException.forbidden("이 역할로 바꿀 수 없습니다.");
        }
    }

    public void requireAuthored(StoreMember actor, UUID autorId) {
        if(!PermissionMatrix.canMutateAuthored(actor.getRole(), autorId, actor.getUserId())){
            throw ApiException.forbidden("본인이 작성한 인수인계만 수정할 수 있습니다.");
        }
    }
}