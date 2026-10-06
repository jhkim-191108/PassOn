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

    public int accessMinutes() {
        return accessMinutes;
    }
}