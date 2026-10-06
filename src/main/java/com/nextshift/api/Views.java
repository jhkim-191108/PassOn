package com.nextshift.api;

import com.nextshift.domain.MemberStatus;
import com.nextshift.domain.ShiftTeam;
import com.nextshift.domain.StoreRole;
import com.nextshift.domain.StoreType;
import java.time.OffsetDateTime;
import java.util.UUID;

public final class Views {
    private Views() {}

    public record UserView(UUID id, String email, String name) {}

    public record AuthView(String accessToken, String tokenType, long expiresIn, UserView user) {}

    public record StoreView(
            UUID id,
            String name,
            StoreType type,
            StoreRole myRole,
            String inviteCode,
            OffsetDateTime createdAt
    ) {}

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