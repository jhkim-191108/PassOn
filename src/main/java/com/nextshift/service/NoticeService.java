package com.nextshift.service;

import com.nextshift.api.Views.NoticeView;
import com.nextshift.common.ApiException;
import com.nextshift.common.AuthPrincipal;
import com.nextshift.domain.MemberStatus;
import com.nextshift.domain.Notice;
import com.nextshift.domain.NoticePriority;
import com.nextshift.domain.StoreMember;
import com.nextshift.domain.User;
import com.nextshift.repo.NoticeRepository;
import com.nextshift.repo.StoreMemberRepository;
import com.nextshift.repo.UserRepository;
import com.nextshift.security.StoreGuard;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 매장 공지. 쓰기는 매장 수정 권한이 있는 사람만, 읽기는 활동 멤버면 된다. */
@Service
public class NoticeService {
    private static final Comparator<Notice> LIST_ORDER = Comparator
            .comparing(Notice::isPinned).reversed()
            .thenComparingInt(notice -> priorityRank(notice.getPriority()))
            .thenComparing(Notice::getCreatedAt, Comparator.reverseOrder());

    private final NoticeRepository noticeRepository;
    private final UserRepository userRepository;
    private final StoreMemberRepository memberRepository;
    private final NotificationService notificationService;
    private final StoreGuard guard;

    public NoticeService(
            NoticeRepository noticeRepository,
            UserRepository userRepository,
            StoreMemberRepository memberRepository,
            NotificationService notificationService,
            StoreGuard guard
    ) {
        this.noticeRepository = noticeRepository;
        this.userRepository = userRepository;
        this.memberRepository = memberRepository;
        this.notificationService = notificationService;
        this.guard = guard;
    }

    /** 오너 또는 매니저가 공지를 저장한다. priority를 빼면 일반이다. 긴급이면 다른 멤버에게 알린다. */
    @Transactional
    public NoticeView create(
            AuthPrincipal principal,
            UUID storeId,
            String title,
            String body,
            Boolean pinned,
            NoticePriority priority
    ) {
        var member = guard.requireActiveMember(storeId, principal.id());
        guard.requireStoreUpdate(member);
        Notice notice = new Notice();
        notice.setStoreId(storeId);
        notice.setAuthorId(principal.id());
        notice.setTitle(title.trim());
        notice.setBody(body.trim());
        notice.setPinned(Boolean.TRUE.equals(pinned));
        notice.setPriority(priority == null ? NoticePriority.NORMAL : priority);
        noticeRepository.save(notice);
        if (notice.getPriority() == NoticePriority.URGENT) {
            notifyUrgent(storeId, principal.id(), notice.getTitle());
        }
        return toView(notice, authorName(principal.id()));
    }

    /** 활동 멤버에게 그 매장 공지를 고정, 긴급, 최신 순으로 돌려준다. priority가 있으면 그 단계만 남긴다. */
    @Transactional(readOnly = true)
    public List<NoticeView> list(AuthPrincipal principal, UUID storeId, NoticePriority priority) {
        guard.requireActiveMember(storeId, principal.id());
        List<Notice> notices = new ArrayList<>(noticeRepository.findByStoreId(storeId));
        if (priority != null) {
            notices.removeIf(notice -> notice.getPriority() != priority);
        }
        notices.sort(LIST_ORDER);
        Map<UUID, User> authors = userRepository.findAllById(notices.stream().map(Notice::getAuthorId).collect(Collectors.toSet()))
                .stream()
                .collect(Collectors.toMap(User::getId, Function.identity()));
        return notices.stream().map(notice -> toView(notice, nameOf(authors.get(notice.getAuthorId())))).toList();
    }

    /** 그 공지 매장의 활동 멤버만 한 건을 본다. */
    @Transactional(readOnly = true)
    public NoticeView get(AuthPrincipal principal, UUID noticeId) {
        Notice notice = require(noticeId);
        guard.requireActiveMember(notice.getStoreId(), principal.id());
        return toView(notice, authorName(notice.getAuthorId()));
    }

    /** 보낸 값만 고친다. 빈 제목이나 본문은 거절한다. 일반이나 중요에서 긴급으로 올리면 알린다. */
    @Transactional
    public NoticeView update(
            AuthPrincipal principal,
            UUID noticeId,
            String title,
            String body,
            Boolean pinned,
            NoticePriority priority
    ) {
        if (title == null && body == null && pinned == null && priority == null) {
            throw ApiException.badRequest("바꿀 값이 없습니다.");
        }
        Notice notice = require(noticeId);
        var member = guard.requireActiveMember(notice.getStoreId(), principal.id());
        guard.requireStoreUpdate(member);
        NoticePriority previous = notice.getPriority();
        if (title != null) {
            String trimmed = title.trim();
            if (trimmed.isBlank()) {
                throw ApiException.badRequest("공지 제목을 입력해 주세요.");
            }
            notice.setTitle(trimmed);
        }
        if (body != null) {
            String trimmed = body.trim();
            if (trimmed.isBlank()) {
                throw ApiException.badRequest("공지 내용을 입력해 주세요.");
            }
            notice.setBody(trimmed);
        }
        if (pinned != null) {
            notice.setPinned(pinned);
        }
        if (priority != null) {
            notice.setPriority(priority);
        }
        if (previous != NoticePriority.URGENT && notice.getPriority() == NoticePriority.URGENT) {
            notifyUrgent(notice.getStoreId(), principal.id(), notice.getTitle());
        }
        return toView(notice, authorName(notice.getAuthorId()));
    }

    /** 매장 수정 권한이 있는 사람만 공지를 지운다. */
    @Transactional
    public void delete(AuthPrincipal principal, UUID noticeId) {
        Notice notice = require(noticeId);
        var member = guard.requireActiveMember(notice.getStoreId(), principal.id());
        guard.requireStoreUpdate(member);
        noticeRepository.delete(notice);
    }

    private void notifyUrgent(UUID storeId, UUID actorId, String title) {
        for (StoreMember member : memberRepository.findByStoreIdOrderByCreatedAtAsc(storeId)) {
            if (member.getStatus() != MemberStatus.ACTIVE) {
                continue;
            }
            notificationService.urgentNotice(storeId, actorId, member.getUserId(), title);
        }
    }

    private Notice require(UUID noticeId) {
        return noticeRepository.findById(noticeId).orElseThrow(() -> ApiException.notFound("공지를 찾을 수 없습니다."));
    }

    private String authorName(UUID userId) {
        return userRepository.findById(userId).map(this::nameOf).orElse("탈퇴한 사용자");
    }

    /** 탈퇴한 계정이면 이름 대신 "탈퇴한 사용자"를 쓴다. */
    private String nameOf(User user) {
        if (user == null || user.getDeletedAt() != null) {
            return "탈퇴한 사용자";
        }
        return user.getName();
    }

    private static int priorityRank(NoticePriority priority) {
        return switch (priority) {
            case URGENT -> 0;
            case IMPORTANT -> 1;
            case NORMAL -> 2;
        };
    }

    private static NoticeView toView(Notice notice, String authorName) {
        return new NoticeView(
                notice.getId(),
                notice.getStoreId(),
                notice.getAuthorId(),
                authorName,
                notice.getTitle(),
                notice.getBody(),
                notice.isPinned(),
                notice.getPriority(),
                notice.getCreatedAt(),
                notice.getUpdatedAt()
        );
    }
}
