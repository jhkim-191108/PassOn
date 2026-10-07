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

/** 매장 멤버 추가·역할·근무조·상태. 행위자와 대상의 역할을 StoreGuard로 비교한다. */
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

    /** 탈퇴하지 않은 사용자를 활동 멤버로 넣는다. 이미 있으면 409다. */
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

    /** 활동 멤버가 그 매장 멤버 전체를 본다. */
    @Transactional(readOnly = true)
    public List<MemberView> list(AuthPrincipal principal, UUID storeId) {
        guard.requireActiveMember(storeId, principal.id());
        List<StoreMember> members = memberRepository.findByStoreIdOrderByCreatedAtAsc(storeId);
        Map<UUID, User> users = usersOf(members);
        return members.stream().map(member -> toView(member, users.get(member.getUserId()))).toList();
    }

    /** 그 매장에 속한 멤버만 조회한다. 다른 매장 id면 404다. */
    @Transactional(readOnly = true)
    public MemberView get(AuthPrincipal principal, UUID storeId, UUID memberId) {
        guard.requireActiveMember(storeId, principal.id());
        StoreMember member = memberInStore(storeId, memberId);
        return toView(member, userRepository.findById(member.getUserId()).orElse(null));
    }

    /** 대상 멤버를 고칠 수 있고, 그 역할을 줄 수 있을 때만 바꾼다. */
    @Transactional
    public MemberView changeRole(AuthPrincipal principal, UUID storeId, UUID memberId, StoreRole role) {
        StoreMember actor = guard.requireActiveMember(storeId, principal.id());
        StoreMember target = memberInStore(storeId, memberId);
        guard.requireMemberModify(actor, target);
        guard.requireAssign(actor, role);
        target.setRole(role);
        return toView(target, userRepository.findById(target.getUserId()).orElse(null));
    }

    /** 멤버를 수정할 수 있는 사람만 근무조를 바꾼다. */
    @Transactional
    public MemberView changeTeam(AuthPrincipal principal, UUID storeId, UUID memberId, ShiftTeam team) {
        StoreMember actor = guard.requireActiveMember(storeId, principal.id());
        StoreMember target = memberInStore(storeId, memberId);
        guard.requireMemberModify(actor, target);
        target.setTeam(team);
        return toView(target, userRepository.findById(target.getUserId()).orElse(null));
    }

    /** 멤버를 수정할 수 있는 사람만 상태를 바꾼다. */
    @Transactional
    public MemberView changeStatus(AuthPrincipal principal, UUID storeId, UUID memberId, MemberStatus status) {
        StoreMember actor = guard.requireActiveMember(storeId, principal.id());
        StoreMember target = memberInStore(storeId, memberId);
        guard.requireMemberModify(actor, target);
        target.setStatus(status);
        return toView(target, userRepository.findById(target.getUserId()).orElse(null));
    }

    /** 멤버 행만 지운다. 사용자 계정은 그대로다. */
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

    /** 탈퇴한 계정이면 이름만 "탈퇴한 사용자"로 바꾸고 이메일은 비운다. */
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