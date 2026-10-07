package com.nextshift.security;

import com.nextshift.config.AppProperties;
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

    public UUID userId(String token) {
        String subject = Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload().getSubject();
        return UUID.fromString(subject);
    }

    /** 액세스 토큰 유효 시간(분)을 반환한다. */
    public int accessMinutes() {
        return accessMinutes;
    }
}