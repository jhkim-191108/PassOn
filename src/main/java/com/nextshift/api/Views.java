package com.nextshift.api;

import com.nextshift.domain.CardType;
import com.nextshift.domain.HandoffStatus;
import com.nextshift.domain.MemberStatus;
import com.nextshift.domain.ShiftTeam;
import com.nextshift.domain.StoreRole;
import com.nextshift.domain.StoreType;
import com.nextshift.domain.Urgency;
import java.time.OffsetDateTime;
import java.util.UUID;

/** API 응답 모양. 엔티티를 그대로 내보내지 않기 위해 따로 둔다. */
public final class Views {
    private Views() {}

    /** 로그인 사용자 요약. */
    public record UserView(UUID id, String email, String name) {}

    /** accessToken만 본문에 있다. refresh는 쿠키로 나간다. expiresIn은 초. */
    public record AuthView(String accessToken, String tokenType, long expiresIn, UserView user) {}

    /** 매장 한 건. inviteCode는 STAFF에게 null. */
    public record StoreView(
            UUID id,
            String name,
            StoreType type,
            StoreRole myRole,
            String inviteCode,
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
            ShiftTeam team,
            OffsetDateTime createdAt
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

    /** 인수인계에서 잘라 낸 카드 한 장. */
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
            OffsetDateTime updatedAt
    ) {}
}