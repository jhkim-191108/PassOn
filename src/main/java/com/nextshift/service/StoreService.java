package com.nextshift.service;

import com.nextshift.api.Views.StoreView;
import com.nextshift.common.AuthPrincipal;
import com.nextshift.domain.MemberStatus;
import com.nextshift.domain.Store;
import com.nextshift.domain.StoreMember;
import com.nextshift.domain.StoreRole;
import com.nextshift.domain.StoreType;
import com.nextshift.repo.StoreMemberRepository;
import com.nextshift.repo.StoreRepository;
import com.nextshift.security.StoreGuard;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 매장 생명주기. 만들면 요청한 사람을 OWNER로 넣고 초대 코드를 발급한다. */
@Service
public class StoreService {
    private final StoreRepository storeRepository;
    private final StoreMemberRepository memberRepository;
    private final StoreGuard guard;
    private final InviteCodes inviteCodes;

    public StoreService(
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

    /** 매장과 오너 멤버를 같이 만들고 초대 코드를 발급한다. */
    @Transactional
    public StoreView create(AuthPrincipal principal, String name, StoreType type) {
        Store store = new Store();
        store.setName(name.trim());
        store.setType(type == null ? StoreType.CAFE : type);
        store.setInviteCode(inviteCodes.next());
        store.setCreatedBy(principal.id());
        storeRepository.save(store);

        StoreMember owner = new StoreMember();
        owner.setStoreId(store.getId());
        owner.setUserId(principal.id());
        owner.setRole(StoreRole.OWNER);
        owner.setStatus(MemberStatus.ACTIVE);
        memberRepository.save(owner);
        return toView(store, StoreRole.OWNER);
    }

    /** 활동 중인 소속만 모아서 돌려준다. */
    @Transactional(readOnly = true)
    public List<StoreView> list(AuthPrincipal principal) {
        List<StoreView> views = new ArrayList<>();
        for (StoreMember membership : memberRepository.findByUserIdAndStatus(principal.id(), MemberStatus.ACTIVE)) {
            storeRepository.findById(membership.getStoreId()).ifPresent(store -> views.add(toView(store, membership.getRole())));
        }
        return views;
    }

    /** 그 매장의 활동 멤버만 상세를 본다. */
    @Transactional(readOnly = true)
    public StoreView get(AuthPrincipal principal, UUID storeId) {
        Store store = guard.requireStore(storeId);
        StoreMember member = guard.requireActiveMember(storeId, principal.id());
        return toView(store, member.getRole());
    }

    /** 이름만 고친다. 업종은 바꾸지 않는다. */
    @Transactional
    public StoreView update(AuthPrincipal principal, UUID storeId, String name) {
        Store store = guard.requireStore(storeId);
        StoreMember member = guard.requireActiveMember(storeId, principal.id());
        guard.requireStoreUpdate(member);
        store.setName(name.trim());
        return toView(store, member.getRole());
    }

    /** 오너만 매장 행을 지운다. */
    @Transactional
    public void delete(AuthPrincipal principal, UUID storeId) {
        guard.requireStore(storeId);
        StoreMember member = guard.requireActiveMember(storeId, principal.id());
        guard.requireStoreDelete(member);
        storeRepository.deleteById(storeId);
    }

    /** 직원에게는 초대 코드를 숨긴다. */
    static StoreView toView(Store store, StoreRole role) {
        String inviteCode = role == StoreRole.STAFF ? null : store.getInviteCode();
        return new StoreView(store.getId(), store.getName(), store.getType(), role, inviteCode, store.getCreatedAt());
    }
}