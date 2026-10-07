package com.nextshift.security;

import com.nextshift.domain.StoreRole;
import java.util.UUID;

/** 역할별 허용 범위. OWNER는 다른 OWNER를 건드리지 못하고, MANAGER는 STAFF만 다룬다. */
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

    /** 매니저 이상은 매장 글을 고칠 수 있고, 직원은 본인 글만 고친다. */
    public static boolean canMutateAuthored(StoreRole role, UUID authorId, UUID userId) {
        if (role == StoreRole.OWNER || role == StoreRole.MANAGER) {
            return true;
        }
        return authorId.equals(userId);
    }

    /** STAFF는 본인 범위(OWN), 그 위는 매장 전체(STORE). */
    public static String scope(StoreRole role) {
        return role == StoreRole.STAFF ? "OWN" : "STORE";
    }
}