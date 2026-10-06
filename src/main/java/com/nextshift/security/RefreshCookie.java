package com.nextshift.security;

import com.nextshift.config.AppProperties;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.time.Duration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

@Component
public class RefreshCookie {
    public static final String NAME = "refresh_token";
    private final Duration maxAge;

    public RefreshCookie(AppProperties properties) {
        this.maxAge = Duration.ofDays(properties.jwt().refreshDays());
    }

    public void write(HttpServletResponse response, String token) {
        response.addHeader(HttpHeaders.SET_COOKIE, cookie(token, maxAge).toString());
    }

    public void clear(HttpServletResponse response) {
        response.addHeader(HttpHeaders.SET_COOKIE, cookie("", Duration.ZERO).toString());
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

    private static ResponseCookie cookie(String token, Duration age) {
        return ResponseCookie.from(NAME, token)
                .httpOnly(true)
                .secure(false)
                .path("/api/auth")
                .maxAge(age)
                .sameSite("Lax")
                .build();
    }
}