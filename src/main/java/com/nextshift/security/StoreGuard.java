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

/** 매장 API 앞에 두는 권한 확인. 없으면 404, 멤버가 아니거나 권한 밖이면 403. */
@Service
public class StoreGuard {
    private final StoreRepository storeRepository;
    private final StoreMemberRepository memberRepository;

    public StoreGuard(StoreRepository storeRepository, StoreMemberRepository memberRepository) {
        this.storeRepository = storeRepository;
        this.memberRepository = memberRepository;
    }

    /** 매장이 없으면 404를 던진다. */
    public Store requireStore(UUID storeId) {
        return storeRepository.findById(storeId).orElseThrow(() -> ApiException.notFound("매장을 찾을 수 없습니다."));
    }

    /** 활동 중인 멤버만 통과시킨다. 아니면 403이다. */
    public StoreMember requireActiveMember(UUID storeId, UUID userId) {
        requireStore(storeId);
        StoreMember member = memberRepository.findByStoreIdAndUserId(storeId, userId)
                .orElseThrow(() -> ApiException.forbidden("이 매장의 멤버가 아닙니다."));
        if (member.getStatus() != MemberStatus.ACTIVE) {
            throw ApiException.forbidden("정지된 멤버입니다.");
        }
        return member;
    }

    /** 매장 이름 수정 권한을 확인한다. */
    public void requireStoreUpdate(StoreMember member) {
        if (!PermissionMatrix.canUpdateStore(member.getRole())) {
            throw ApiException.forbidden("매장 수정 권한이 없습니다.");
        }
    }

    /** 매장 삭제 권한을 확인한다. 오너만 된다. */
    public void requireStoreDelete(StoreMember member) {
        if (!PermissionMatrix.canDeleteStore(member.getRole())) {
            throw ApiException.forbidden("매장 삭제 권한이 없습니다.");
        }
    }

    /** 그 역할을 새로 넣을 수 있는지 확인한다. */
    public void requireMemberCreate(StoreMember actor, StoreRole assigned) {
        if (!PermissionMatrix.canAssign(actor.getRole(), assigned)) {
            throw ApiException.forbidden("이 역할의 멤버를 추가할 수 없습니다.");
        }
    }

    /** 그 멤버를 수정할 수 있는지 확인한다. */
    public void requireMemberModify(StoreMember actor, StoreMember target) {
        if (!PermissionMatrix.canModifyMember(actor.getRole(), target.getRole())) {
            throw ApiException.forbidden("이 멤버를 수정할 수 없습니다.");
        }
    }

    /** 그 역할로 바꿀 수 있는지 확인한다. */
    public void requireAssign(StoreMember actor, StoreRole assigned) {
        if (!PermissionMatrix.canAssign(actor.getRole(), assigned)) {
            throw ApiException.forbidden("이 역할로 바꿀 수 없습니다.");
        }
    }

    /** 직원은 본인이 쓴 인수인계만 수정할 수 있다. */
    public void requireAuthored(StoreMember actor, UUID autorId) {
        if(!PermissionMatrix.canMutateAuthored(actor.getRole(), autorId, actor.getUserId())){
            throw ApiException.forbidden("본인이 작성한 인수인계만 수정할 수 있습니다.");
        }
    }
}