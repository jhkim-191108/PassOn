package com.nextshift.service;

import com.nextshift.api.Views.MemberView;
import com.nextshift.common.ApiException;
import com.nextshift.common.AuthPrincipal;
import com.nextshift.domain.MemberStatus;
import com.nextshift.domain.ShiftTeam;
import com.nextshift.domain.StoreMember;
import com.nextshift.domain.StoreRole;
import com.nextshift.domain.User;
import com.nextshift.repo.StoreMemberRepository;
import com.nextshift.repo.UserRepository;
import com.nextshift.security.StoreGuard;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MemberService {
    private final StoreMemberRepository memberRepository;
    private final UserRepository userRepository;
    private final StoreGuard guard;

    public MemberService(StoreMemberRepository memberRepository, UserRepository userRepository, StoreGuard guard) {
        this.memberRepository = memberRepository;
        this.userRepository = userRepository;
        this.guard = guard;
    }

    @Transactional
    public MemberView add(AuthPrincipal principal, UUID storeId, UUID userId, StoreRole role) {
        StoreMember actor = guard.requireActiveMember(storeId, principal.id());
        guard.requireMemberCreate(actor, role);
        User user = userRepository.findById(userId)
                .filter(found -> found.getDeletedAt() == null)
                .orElseThrow(() -> ApiException.notFound("사용자를 찾을 수 없습니다."));
        if (memberRepository.existsByStoreIdAndUserId(storeId, userId)) {
            throw ApiException.conflict("이미 매장 멤버입니다.");
        }
        StoreMember member = new StoreMember();
        member.setStoreId(storeId);
        member.setUserId(userId);
        member.setRole(role);
        member.setStatus(MemberStatus.ACTIVE);
        memberRepository.save(member);
        return toView(member, user);
    }

    @Transactional(readOnly = true)
    public List<MemberView> list(AuthPrincipal principal, UUID storeId) {
        guard.requireActiveMember(storeId, principal.id());
        List<StoreMember> members = memberRepository.findByStoreIdOrderByCreatedAtAsc(storeId);
        Map<UUID, User> users = usersOf(members);
        return members.stream().map(member -> toView(member, users.get(member.getUserId()))).toList();
    }

    @Transactional(readOnly = true)
    public MemberView get(AuthPrincipal principal, UUID storeId, UUID memberId) {
        guard.requireActiveMember(storeId, principal.id());
        StoreMember member = memberInStore(storeId, memberId);
        return toView(member, userRepository.findById(member.getUserId()).orElse(null));
    }

    @Transactional
    public MemberView changeRole(AuthPrincipal principal, UUID storeId, UUID memberId, StoreRole role) {
        StoreMember actor = guard.requireActiveMember(storeId, principal.id());
        StoreMember target = memberInStore(storeId, memberId);
        guard.requireMemberModify(actor, target);
        guard.requireAssign(actor, role);
        target.setRole(role);
        return toView(target, userRepository.findById(target.getUserId()).orElse(null));
    }

    @Transactional
    public MemberView changeTeam(AuthPrincipal principal, UUID storeId, UUID memberId, ShiftTeam team) {
        StoreMember actor = guard.requireActiveMember(storeId, principal.id());
        StoreMember target = memberInStore(storeId, memberId);
        guard.requireMemberModify(actor, target);
        target.setTeam(team);
        return toView(target, userRepository.findById(target.getUserId()).orElse(null));
    }

    @Transactional
    public MemberView changeStatus(AuthPrincipal principal, UUID storeId, UUID memberId, MemberStatus status) {
        StoreMember actor = guard.requireActiveMember(storeId, principal.id());
        StoreMember target = memberInStore(storeId, memberId);
        guard.requireMemberModify(actor, target);
        target.setStatus(status);
        return toView(target, userRepository.findById(target.getUserId()).orElse(null));
    }

    @Transactional
    public void delete(AuthPrincipal principal, UUID storeId, UUID memberId) {
        StoreMember actor = guard.requireActiveMember(storeId, principal.id());
        StoreMember target = memberInStore(storeId, memberId);
        guard.requireMemberModify(actor, target);
        memberRepository.delete(target);
    }

    private StoreMember memberInStore(UUID storeId, UUID memberId) {
        StoreMember member = memberRepository.findById(memberId)
                .orElseThrow(() -> ApiException.notFound("멤버를 찾을 수 없습니다."));
        if (!member.getStoreId().equals(storeId)) {
            throw ApiException.notFound("멤버를 찾을 수 없습니다.");
        }
        return member;
    }

    private Map<UUID, User> usersOf(List<StoreMember> members) {
        List<UUID> ids = members.stream().map(StoreMember::getUserId).distinct().toList();
        return userRepository.findAllById(ids).stream().collect(Collectors.toMap(User::getId, Function.identity()));
    }

    private static MemberView toView(StoreMember member, User user) {
        boolean gone = user == null || user.getDeletedAt() != null;
        return new MemberView(
                member.getId(),
                member.getStoreId(),
                member.getUserId(),
                gone ? "탈퇴한 사용자" : user.getName(),
                gone ? null : user.getEmail(),
                member.getRole(),
                member.getStatus(),
                member.getTeam(),
                member.getCreatedAt()
        );
    }
}