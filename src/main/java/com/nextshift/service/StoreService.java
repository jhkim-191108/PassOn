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

    @Transactional(readOnly = true)
    public List<StoreView> list(AuthPrincipal principal) {
        List<StoreView> views = new ArrayList<>();
        for (StoreMember membership : memberRepository.findByUserIdAndStatus(principal.id(), MemberStatus.ACTIVE)) {
            storeRepository.findById(membership.getStoreId()).ifPresent(store -> views.add(toView(store, membership.getRole())));
        }
        return views;
    }

    @Transactional(readOnly = true)
    public StoreView get(AuthPrincipal principal, UUID storeId) {
        Store store = guard.requireStore(storeId);
        StoreMember member = guard.requireActiveMember(storeId, principal.id());
        return toView(store, member.getRole());
    }

    @Transactional
    public StoreView update(AuthPrincipal principal, UUID storeId, String name) {
        Store store = guard.requireStore(storeId);
        StoreMember member = guard.requireActiveMember(storeId, principal.id());
        guard.requireStoreUpdate(member);
        store.setName(name.trim());
        return toView(store, member.getRole());
    }

    @Transactional
    public void delete(AuthPrincipal principal, UUID storeId) {
        guard.requireStore(storeId);
        StoreMember member = guard.requireActiveMember(storeId, principal.id());
        guard.requireStoreDelete(member);
        storeRepository.deleteById(storeId);
    }

    static StoreView toView(Store store, StoreRole role) {
        String inviteCode = role == StoreRole.STAFF ? null : store.getInviteCode();
        return new StoreView(store.getId(), store.getName(), store.getType(), role, inviteCode, store.getCreatedAt());
    }
}