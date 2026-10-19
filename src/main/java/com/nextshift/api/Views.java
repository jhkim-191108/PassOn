package com.nextshift.api;

import com.nextshift.domain.CardProgress;
import com.nextshift.domain.CardRevisionField;
import com.nextshift.domain.CardType;
import com.nextshift.domain.EscalationPriority;
import com.nextshift.domain.EscalationStatus;
import com.nextshift.domain.HandoffStatus;
import com.nextshift.domain.MemberStatus;
import com.nextshift.domain.NoticePriority;
import com.nextshift.domain.NotificationType;
import com.nextshift.domain.StoreRole;
import com.nextshift.domain.StoreType;
import com.nextshift.domain.TrashKind;
import com.nextshift.domain.Urgency;
import com.nextshift.domain.WorkSlot;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

/** API 응답 모양. 엔티티를 그대로 내보내지 않기 위해 따로 둔다. */
public final class Views {
    private Views() {}

    /** 로그인 사용자 요약. photo는 프로필 사진이 디스크에 있을 때 true. */
    public record UserView(UUID id, String email, String name, boolean photo) {}

    /** accessToken만 본문에 있다. refresh는 쿠키로 나간다. expiresIn은 초. */
    public record AuthView(String accessToken, String tokenType, long expiresIn, UserView user) {}

    /**
     * 매장 한 건.
     * inviteCode와 invitePath는 STAFF에게 null.
     * 화면의 초대 링크는 사이트 주소 뒤에 invitePath를 붙인다.
     */
    public record StoreView(
            UUID id,
            String name,
            StoreType type,
            StoreRole myRole,
            String inviteCode,
            String invitePath,
            OffsetDateTime createdAt
    ) {}

    /** 매장 멤버. 탈퇴한 계정이면 이름만 바뀌고 이메일은 비운다. */
    public record MemberView(
            UUID id,
            UUID storeId,
            UUID userId,
            String name,
            String email,
            StoreRole role,
            MemberStatus status,
            UUID teamId,
            String teamName,
            OffsetDateTime createdAt,
            OffsetDateTime leftAt,
            List<WorkSlot> workSlots,
            boolean fullTime
    ) {}

    /** 매장 팀. memberCount는 재직 중인 배정 인원이다. */
    public record TeamView(
            UUID id,
            UUID storeId,
            String name,
            long memberCount,
            OffsetDateTime createdAt
    ) {}

    /** 근무표 한 칸. slot은 오전 MORNING, 오후 AFTERNOON, 마감 CLOSE. */
    public record ShiftView(
            UUID id,
            UUID storeId,
            UUID memberId,
            String memberName,
            LocalDate workDate,
            WorkSlot slot,
            OffsetDateTime createdAt
    ) {}

    /** 지금 근무 중. slot이 null이면 새벽이라 해당 시간대가 없다. */
    public record OnDutyView(
            LocalDate workDate,
            WorkSlot slot,
            List<ShiftView> shifts
    ) {}

    /** 인수인계 목록용. 카드 수와 내가 읽었는지를 같이 담는다. */
    public record HandoffView(
            UUID id,
            UUID storeId,
            UUID authorId,
            String authorName,
            String rawText,
            HandoffStatus status,
            String analyzeError,
            OffsetDateTime analyzedAt,
            OffsetDateTime confirmedAt,
            UUID confirmedBy,
            OffsetDateTime createdAt,
            OffsetDateTime updatedAt,
            boolean read,
            long cardCount,
            long openCardCount
    ) {}

    /** 인수인계에서 잘라 낸 카드 한 장. progress는 OPEN, IN_PROGRESS, DONE. edited가 true면 수정됨. */
    public record CardView(
            UUID id,
            UUID handoffId,
            CardType type,
            String title,
            String body,
            Urgency urgency,
            boolean needsReview,
            String sourceQuote,
            int position,
            OffsetDateTime completedAt,
            UUID completedBy,
            OffsetDateTime createdAt,
            OffsetDateTime updatedAt,
            String authorName,
            EscalationStatus escalationStatus,
            EscalationPriority escalationPriority,
            UUID assigneeMemberId,
            String assigneeName,
            OffsetDateTime acknowledgedAt,
            UUID acknowledgedBy,
            String acknowledgedByName,
            CardProgress progress,
            boolean edited
    ) {}

    /** 카드 내용이 바뀐 기록 한 줄. */
    public record CardRevisionView(
            UUID id,
            UUID cardId,
            CardRevisionField field,
            String beforeValue,
            String afterValue,
            UUID editorId,
            String editorName,
            OffsetDateTime createdAt
    ) {}

    /** 카드 아래에 붙은 후속 메모. */
    public record MemoView(
            UUID id,
            UUID cardId,
            UUID authorId,
            String authorName,
            String body,
            OffsetDateTime createdAt
    ) {}

    /** 내가 받은 알림 한 건. read가 true면 이미 읽었다. */
    public record NotificationView(
            UUID id,
            UUID storeId,
            NotificationType type,
            UUID handoffId,
            UUID cardId,
            String title,
            String body,
            boolean read,
            OffsetDateTime createdAt
    ) {}

    /** 인수인계 사진 한 장. path로 파일을 받는다. */
    public record PhotoView(
            UUID id,
            UUID handoffId,
            String originalName,
            String contentType,
            long sizeBytes,
            int position,
            String path,
            OffsetDateTime createdAt
    ) {}

    /** 매장 공지. pinned는 목록 위, priority는 일반·중요·긴급. */
    public record NoticeView(
            UUID id,
            UUID storeId,
            UUID authorId,
            String authorName,
            String title,
            String body,
            boolean pinned,
            NoticePriority priority,
            OffsetDateTime createdAt,
            OffsetDateTime updatedAt
    ) {}

    /** 오너에게 올라간 카드. authorName은 인수인계를 쓴 사람이다. */
    public record EscalationView(
            UUID id,
            UUID storeId,
            UUID cardId,
            String title,
            String body,
            String authorName,
            UUID requestedBy,
            String requestedByName,
            EscalationPriority priority,
            EscalationStatus status,
            OffsetDateTime createdAt,
            OffsetDateTime resolvedAt
    ) {}

    /** 내 알림 켜기. assignment 업무 배정, urgent 긴급, memo 메모, completed 처리 완료. */
    public record NotificationSettingsView(
            boolean assignment,
            boolean urgent,
            boolean memo,
            boolean completed
    ) {}

    /** 휴지통 한 줄. kept가 true면 2주가 지나도 지우지 않는다. */
    public record TrashItemView(
            TrashKind kind,
            UUID id,
            UUID storeId,
            UUID handoffId,
            String title,
            UUID deletedBy,
            String deletedByName,
            OffsetDateTime deletedAt,
            OffsetDateTime restoreUntil,
            boolean kept
    ) {}

    /** 영구 보관 체크 결과. */
    public record KeepView(
            TrashKind kind,
            UUID id,
            boolean kept,
            OffsetDateTime keptAt
    ) {}

    /** 2주가 지난 미보관 항목을 지운 개수. */
    public record PurgeView(int handoffs, int cards) {}

    /**
     * 기록 조회 한 줄.
     * action은 CREATED 작성, UPDATED 수정, COMPLETED 처리, DELETED 삭제.
     */
    public record RecordView(
            String action,
            UUID id,
            UUID storeId,
            UUID handoffId,
            UUID cardId,
            String title,
            String actorName,
            OffsetDateTime at
    ) {}
}