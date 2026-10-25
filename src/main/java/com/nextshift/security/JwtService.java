package com.nextshift.security;

import com.nextshift.config.AppProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;
import javax.crypto.SecretKey;
import org.springframework.stereotype.Service;

/** 액세스 토큰 발급과 검증. subject에는 사용자 id만 넣는다. */
@Service
public class JwtService {
    private final SecretKey key;
    private final int accessMinutes;

    public JwtService(AppProperties properties) {
        this.key = Keys.hmacShaKeyFor(properties.jwt().secret().getBytes(StandardCharsets.UTF_8));
        this.accessMinutes = properties.jwt().accessMinutes();
    }

    public String accessToken(UUID userId) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(userId.toString())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(accessMinutes * 60L)))
                .signWith(key)
                .compact();
    }

    /** 웹소켓 주소에 액세스 토큰을 넣지 않도록, 그 매장 전용 1분 티켓을 만든다. */
    public String wsTicket(UUID userId, UUID storeId) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(userId.toString())
                .claim("purpose", "ws")
                .claim("storeId", storeId.toString())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(60)))
                .signWith(key)
                .compact();
    }

    public UUID userId(String token) {
        Claims payload = claims(token);
        if ("ws".equals(payload.get("purpose", String.class))) {
            throw new JwtException("액세스 토큰이 아닙니다.");
        }
        return UUID.fromString(payload.getSubject());
    }

    /** purpose가 ws인 티켓만 받는다. 액세스 토큰은 여기서 거절한다. */
    public WsTicket readWsTicket(String token) {
        Claims payload = claims(token);
        if (!"ws".equals(payload.get("purpose", String.class))) {
            throw new JwtException("웹소켓 티켓이 아닙니다.");
        }
        String storeId = payload.get("storeId", String.class);
        if (storeId == null || storeId.isBlank()) {
            throw new JwtException("웹소켓 티켓이 아닙니다.");
        }
        return new WsTicket(UUID.fromString(payload.getSubject()), UUID.fromString(storeId));
    }

    private Claims claims(String token) {
        return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
    }

    /** 액세스 토큰 유효 시간(분)을 반환한다. */
    public int accessMinutes() {
        return accessMinutes;
    }
}

/** 웹소켓 티켓에서 꺼낸 사용자와 매장. */
record WsTicket(UUID userId, UUID storeId) {}