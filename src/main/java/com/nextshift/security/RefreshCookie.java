package com.nextshift.security;

import com.nextshift.config.AppProperties;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.time.Duration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

/** 리프레시 토큰 쿠키. HttpOnly라 브라우저 스크립트에서는 읽지 못한다. */
@Component
public class RefreshCookie {
    public static final String NAME = "refresh_token";
    private final Duration maxAge;

    public RefreshCookie(AppProperties properties) {
        this.maxAge = Duration.ofDays(properties.jwt().refreshDays());
    }

    public void write(HttpServletRequest request, HttpServletResponse response, String token) {
        response.addHeader(HttpHeaders.SET_COOKIE, cookie(token, maxAge, request).toString());
    }

    public void clear(HttpServletRequest request, HttpServletResponse response) {
        response.addHeader(HttpHeaders.SET_COOKIE, cookie("", Duration.ZERO, request).toString());
    }

    public String read(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }
        for (Cookie cookie : cookies) {
            if (NAME.equals(cookie.getName()) && cookie.getValue() != null && !cookie.getValue().isBlank()) {
                return cookie.getValue();
            }
        }
        return null;
    }

    /**
     * HTTPS에서는 화면과 API 주소가 달라도 갱신 요청에 쿠키가 실린다.
     * 로컬 http API는 같은 사이트 요청만 받으므로 Lax로 둔다.
     */
    private static ResponseCookie cookie(String token, Duration age, HttpServletRequest request) {
        boolean https = https(request);
        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from(NAME, token)
                .httpOnly(true)
                .secure(https)
                .path("/api/auth")
                .maxAge(age)
                .sameSite(https ? "None" : "Lax");
        if (https) {
            builder.partitioned(true);
        }
        return builder.build();
    }

    /** Cloud Run은 TLS를 앞에서 끊어서 앱에는 http로 들어온다. */
    private static boolean https(HttpServletRequest request) {
        if (request.isSecure()) {
            return true;
        }
        String proto = request.getHeader("X-Forwarded-Proto");
        if (proto == null || proto.isBlank()) {
            return false;
        }
        return "https".equalsIgnoreCase(proto.split(",")[0].trim());
    }
}