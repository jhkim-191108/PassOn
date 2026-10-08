package com.nextshift.service;

import com.nextshift.api.Views.TeamView;
import com.nextshift.common.ApiException;
import com.nextshift.common.AuthPrincipal;
import com.nextshift.domain.MemberStatus;
import com.nextshift.domain.StoreMember;
import com.nextshift.domain.StoreRole;
import com.nextshift.domain.Team;
import com.nextshift.repo.StoreMemberRepository;
import com.nextshift.repo.TeamRepository;
import com.nextshift.security.StoreGuard;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 매장 팀 생성·이름 변경·삭제. 만들기는 오너만 할 수 있다. */
@Service
public class TeamService {
    private final TeamRepository teamRepository;
    private final StoreMemberRepository memberRepository;
    private final StoreGuard guard;

    public TeamService(TeamRepository teamRepository, StoreMemberRepository memberRepository, StoreGuard guard) {
        this.teamRepository = teamRepository;
        this.memberRepository = memberRepository;
        this.guard = guard;
    }

    @Transactional
    public TeamView create(AuthPrincipal principal, UUID storeId, String name) {
        requireOwner(storeId, principal.id());
        String cleaned = clean(name);
        if (teamRepository.existsByStoreIdAndName(storeId, cleaned)) {
            throw ApiException.conflict("이미 있는 팀 이름입니다.");
        }
        Team team = new Team();
        team.setStoreId(storeId);
        team.setName(cleaned);
        teamRepository.save(team);
        return toView(team, 0);
    }

    @Transactional(readOnly = true)
    public List<TeamView> list(AuthPrincipal principal, UUID storeId) {
        guard.requireActiveMember(storeId, principal.id());
        return teamRepository.findByStoreIdOrderByCreatedAtAsc(storeId).stream()
                .map(team -> toView(team, memberRepository.countByTeamIdAndStatus(team.getId(), MemberStatus.ACTIVE)))
                .toList();
    }

    @Transactional
    public TeamView rename(AuthPrincipal principal, UUID storeId, UUID teamId, String name) {
        requireOwner(storeId, principal.id());
        Team team = teamInStore(storeId, teamId);
        String cleaned = clean(name);
        if (teamRepository.existsByStoreIdAndNameAndIdNot(storeId, cleaned, team.getId())) {
            throw ApiException.conflict("이미 있는 팀 이름입니다.");
        }
        team.setName(cleaned);
        long count = memberRepository.countByTeamIdAndStatus(team.getId(), MemberStatus.ACTIVE);
        return toView(team, count);
    }

    @Transactional
    public void delete(AuthPrincipal principal, UUID storeId, UUID teamId) {
        requireOwner(storeId, principal.id());
        Team team = teamInStore(storeId, teamId);
        for (StoreMember member : memberRepository.findByTeamId(team.getId())) {
            member.setTeamId(null);
        }
        teamRepository.delete(team);
    }

    private void requireOwner(UUID storeId, UUID userId) {
        StoreMember actor = guard.requireActiveMember(storeId, userId);
        if (actor.getRole() != StoreRole.OWNER) {
            throw ApiException.forbidden("팀을 만들 권한은 오너에게 있습니다.");
        }
    }

    private Team teamInStore(UUID storeId, UUID teamId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> ApiException.notFound("팀을 찾을 수 없습니다."));
        if (!team.getStoreId().equals(storeId)) {
            throw ApiException.notFound("팀을 찾을 수 없습니다.");
        }
        return team;
    }

    private static String clean(String name) {
        if (name == null) {
            throw ApiException.badRequest("팀 이름을 입력해 주세요.");
        }
        String trimmed = name.trim();
        if (trimmed.isEmpty() || trimmed.length() > 20) {
            throw ApiException.badRequest("팀 이름은 1자 이상 20자 이하입니다.");
        }
        return trimmed;
    }

    private static TeamView toView(Team team, long memberCount) {
        return new TeamView(team.getId(), team.getStoreId(), team.getName(), memberCount, team.getCreatedAt());
    }
}