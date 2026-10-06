package com.nextshift.common;

import java.util.UUID;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public record AuthPrincipal(UUID id, String email) {
    public static AuthPrincipal current() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthPrincipal principal)) {
            throw ApiException.unauthorized("로그인이 필요합니다.");
        }
        return principal;
    }
}