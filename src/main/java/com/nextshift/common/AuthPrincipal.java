package com.nextshift.common;

import java.util.UUID;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/** 로그인된 사용자. 필터가 SecurityContext에 넣고, 컨트롤러는 current()로 꺼낸다. */
public record AuthPrincipal(UUID id, String email) {
    public static AuthPrincipal current() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthPrincipal principal)) {
            throw ApiException.unauthorized("로그인이 필요합니다.");
        }
        return principal;
    }
}