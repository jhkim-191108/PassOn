package com.nextshift.security;

import com.nextshift.domain.StoreRole;
import java.util.UUID;

public final class PermissionMatrix {
    private PermissionMatrix() {}

    public static boolean canUpdateStore(StoreRole role) {
        return role == StoreRole.OWNER || role == StoreRole.MANAGER;
    }

    public static boolean canDeleteStore(StoreRole role) {
        return role == StoreRole.OWNER;
    }

    public static boolean canModifyMember(StoreRole actor, StoreRole target) {
        return switch (actor) {
            case OWNER -> target != StoreRole.OWNER;
            case MANAGER -> target == StoreRole.STAFF;
            case STAFF -> false;
        };
    }

    public static boolean canAssign(StoreRole actor, StoreRole assigned) {
        return switch (actor) {
            case OWNER -> assigned == StoreRole.MANAGER || assigned == StoreRole.STAFF;
            case MANAGER -> assigned == StoreRole.STAFF;
            case STAFF -> false;
        };
    }

    public static boolean canMutateAuthored(StoreRole role, UUID authorId, UUID userId) {
        if (role == StoreRole.OWNER || role == StoreRole.MANAGER) {
            return true;
        }
        return authorId.equals(userId);
    }

    public static String scope(StoreRole role) {
        return role == StoreRole.STAFF ? "OWN" : "STORE";
    }
}