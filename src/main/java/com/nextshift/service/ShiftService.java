package com.nextshift.service;

import com.nextshift.api.Views.OnDutyView;
import com.nextshift.api.Views.ShiftView;
import com.nextshift.common.ApiException;
import com.nextshift.common.AuthPrincipal;
import com.nextshift.domain.MemberStatus;
import com.nextshift.domain.Shift;
import com.nextshift.domain.StoreMember;
import com.nextshift.domain.User;
import com.nextshift.domain.WorkSlot;
import com.nextshift.repo.ShiftRepository;
import com.nextshift.repo.StoreMemberRepository;
import com.nextshift.repo.UserRepository;
import com.nextshift.security.StoreGuard;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 근무표 조회·배정·취소. 배정과 취소는 오너와 매니저만 할 수 있다. */
@Service
public class ShiftService {
    private static final ZoneId SEOUL = ZoneId.of("Asia/Seoul");

    private final ShiftRepository shiftRepository;
    private final StoreMemberRepository memberRepository;
    private final UserRepository userRepository;
    private final StoreGuard guard;

    public ShiftService(
            ShiftRepository shiftRepository,
            StoreMemberRepository memberRepository,
            UserRepository userRepository,
            StoreGuard guard
    ) {
        this.shiftRepository = shiftRepository;
        this.memberRepository = memberRepository;
        this.userRepository = userRepository;
        this.guard = guard;
    }

    /** 기간 안의 근무표를 날짜, 시간대 순으로 돌려준다. */
    @Transactional(readOnly = true)
    public List<ShiftView> list(AuthPrincipal principal, UUID storeId, LocalDate from, LocalDate to) {
        guard.requireActiveMember(storeId, principal.id());
        if (from.isAfter(to)) {
            throw ApiException.badRequest("시작 날짜가 끝 날짜보다 늦습니다.");
        }
        if (ChronoUnit.DAYS.between(from, to) > 62) {
            throw ApiException.badRequest("조회 기간은 62일 이하입니다.");
        }
        List<Shift> shifts = shiftRepository.findByStoreIdAndWorkDateBetween(storeId, from, to);
        Map<UUID, StoreMember> members = membersOf(shifts);
        Map<UUID, User> users = usersOf(members.values().stream().map(StoreMember::getUserId).distinct().toList());
        return shifts.stream()
                .sorted(Comparator.comparing(Shift::getWorkDate).thenComparing(shift -> shift.getSlot().ordinal()))
                .map(shift -> toView(shift, members.get(shift.getMemberId()), users))
                .toList();
    }

    /** 서울 시각의 오늘, 현재 시간대에 배정된 직원을 돌려준다. */
    @Transactional(readOnly = true)
    public OnDutyView now(AuthPrincipal principal, UUID storeId) {
        guard.requireActiveMember(storeId, principal.id());
        LocalDate today = LocalDate.now(SEOUL);
        WorkSlot slot = slotAt(LocalTime.now(SEOUL));
        if (slot == null) {
            return new OnDutyView(today, null, List.of());
        }
        List<Shift> shifts = shiftRepository.findByStoreIdAndWorkDateAndSlot(storeId, today, slot);
        Map<UUID, StoreMember> members = membersOf(shifts);
        Map<UUID, User> users = usersOf(members.values().stream().map(StoreMember::getUserId).distinct().toList());
        List<ShiftView> views = shifts.stream()
                .map(shift -> toView(shift, members.get(shift.getMemberId()), users))
                .toList();
        return new OnDutyView(today, slot, views);
    }

    /** 재직 중인 직원을 그 날짜와 시간대에 넣는다. */
    @Transactional
    public ShiftView create(AuthPrincipal principal, UUID storeId, UUID memberId, LocalDate workDate, WorkSlot slot) {
        StoreMember actor = guard.requireActiveMember(storeId, principal.id());
        guard.requireStoreUpdate(actor);
        StoreMember member = memberRepository.findById(memberId)
                .filter(found -> found.getStoreId().equals(storeId))
                .orElseThrow(() -> ApiException.notFound("멤버를 찾을 수 없습니다."));
        if (member.getStatus() != MemberStatus.ACTIVE) {
            throw ApiException.badRequest("재직 중인 직원만 배정할 수 있습니다.");
        }
        if (shiftRepository.existsByStoreIdAndMemberIdAndWorkDateAndSlot(storeId, member.getId(), workDate, slot)) {
            throw ApiException.conflict("이미 그 시간에 배정되어 있습니다.");
        }
        Shift shift = new Shift();
        shift.setStoreId(storeId);
        shift.setMemberId(member.getId());
        shift.setWorkDate(workDate);
        shift.setSlot(slot);
        shiftRepository.save(shift);
        User user = userRepository.findById(member.getUserId()).orElse(null);
        return toView(shift, memberName(user));
    }

    /** 그 매장의 근무 한 칸을 지운다. */
    @Transactional
    public void delete(AuthPrincipal principal, UUID storeId, UUID shiftId) {
        StoreMember actor = guard.requireActiveMember(storeId, principal.id());
        guard.requireStoreUpdate(actor);
        Shift shift = shiftRepository.findById(shiftId)
                .orElseThrow(() -> ApiException.notFound("근무를 찾을 수 없습니다."));
        if (!shift.getStoreId().equals(storeId)) {
            throw ApiException.notFound("근무를 찾을 수 없습니다.");
        }
        shiftRepository.delete(shift);
    }

    /** 06시부터 오전, 14시부터 오후, 18시부터 마감. 새벽에는 시간대가 없다. */
    private static WorkSlot slotAt(LocalTime time) {
        int hour = time.getHour();
        if (hour >= 6 && hour < 14) {
            return WorkSlot.MORNING;
        }
        if (hour >= 14 && hour < 18) {
            return WorkSlot.AFTERNOON;
        }
        if (hour >= 18) {
            return WorkSlot.CLOSE;
        }
        return null;
    }

    private Map<UUID, StoreMember> membersOf(List<Shift> shifts) {
        List<UUID> ids = shifts.stream().map(Shift::getMemberId).distinct().toList();
        return memberRepository.findAllById(ids).stream().collect(Collectors.toMap(StoreMember::getId, Function.identity()));
    }

    private Map<UUID, User> usersOf(List<UUID> userIds) {
        return userRepository.findAllById(userIds).stream().collect(Collectors.toMap(User::getId, Function.identity()));
    }

    private static String memberName(User user) {
        if (user == null || user.getDeletedAt() != null) {
            return "탈퇴한 사용자";
        }
        return user.getName();
    }

    private static ShiftView toView(Shift shift, StoreMember member, Map<UUID, User> users) {
        User user = member == null ? null : users.get(member.getUserId());
        return toView(shift, memberName(user));
    }

    private static ShiftView toView(Shift shift, String memberName) {
        return new ShiftView(
                shift.getId(),
                shift.getStoreId(),
                shift.getMemberId(),
                memberName,
                shift.getWorkDate(),
                shift.getSlot(),
                shift.getCreatedAt()
        );
    }
}