package com.nextshift.service;

import com.nextshift.api.Views.AuthView;
import com.nextshift.api.Views.UserView;
import com.nextshift.common.ApiException;
import com.nextshift.config.AppProperties;
import com.nextshift.domain.RefreshToken;
import com.nextshift.domain.User;
import com.nextshift.repo.RefreshTokenRepository;
import com.nextshift.repo.UserRepository;
import com.nextshift.security.JwtService;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Locale;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 가입과 로그인. 리프레시 토큰 원문은 저장하지 않고 SHA-256 해시만 남긴다. */
@Service
public class AuthService {
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AppProperties properties;
    private final SecureRandom random = new SecureRandom();

    public AuthService(
            UserRepository userRepository,
            RefreshTokenRepository refreshTokenRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AppProperties properties
    ) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.properties = properties;
    }

    /** 이메일을 소문자로 맞춘 뒤 계정을 만들고 토큰을 발급한다. */
    @Transactional
    public Issued signup(String email, String password, String name) {
        String normalized = normalizeEmail(email);
        if (userRepository.existsByEmailAndDeletedAtIsNull(normalized)) {
            throw ApiException.conflict("이미 가입된 이메일입니다.");
        }
        User user = new User();
        user.setEmail(normalized);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setName(name.trim());
        userRepository.save(user);
        return issue(user);
    }

    /** 이메일과 비밀번호가 맞으면 토큰을 발급한다. 실패 이유는 구분하지 않는다. */
    @Transactional
    public Issued login(String email, String password) {
        User user = userRepository.findByEmailAndDeletedAtIsNull(normalizeEmail(email))
                .orElseThrow(() -> ApiException.unauthorized("이메일 또는 비밀번호가 올바르지 않습니다."));
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw ApiException.unauthorized("이메일 또는 비밀번호가 올바르지 않습니다.");
        }
        return issue(user);
    }

    /** 쿠키의 리프레시 토큰을 한 번 쓰고 폐기한 뒤 새 쌍을 발급한다. */
    @Transactional
    public Issued refresh(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            throw ApiException.unauthorized("로그인이 필요합니다.");
        }
        RefreshToken current = refreshTokenRepository.findByTokenHash(sha256(rawToken))
                .orElseThrow(() -> ApiException.unauthorized("로그인이 필요합니다."));
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        if (current.getRevokedAt() != null || current.getExpiresAt().isBefore(now)) {
            throw ApiException.unauthorized("로그인이 필요합니다.");
        }
        User user = userRepository.findById(current.getUserId())
                .filter(found -> found.getDeletedAt() == null)
                .orElseThrow(() -> ApiException.unauthorized("로그인이 필요합니다."));
        current.setRevokedAt(now);
        return issue(user);
    }

    /** 쿠키로 온 리프레시 토큰을 폐기한다. 이미 폐기됐으면 그대로 둔다. */
    @Transactional
    public void logout(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            throw ApiException.unauthorized("로그인이 필요합니다.");
        }
        refreshTokenRepository.findByTokenHash(sha256(rawToken)).ifPresent(token -> {
            if (token.getRevokedAt() == null) {
                token.setRevokedAt(OffsetDateTime.now(ZoneOffset.UTC));
            }
        });
    }

    /** 탈퇴하지 않은 같은 이메일이 있으면 409를 던진다. */
    @Transactional(readOnly = true)
    public void checkEmail(String email) {
        if (userRepository.existsByEmailAndDeletedAtIsNull(normalizeEmail(email))) {
            throw ApiException.conflict("이미 가입된 이메일입니다.");
        }
    }

    /** 액세스 JWT와 새 리프레시 토큰을 같이 만든다. 재발급 때는 이전 토큰을 먼저 폐기한다. */
    private Issued issue(User user) {
        String raw = newRefreshToken();
        RefreshToken token = new RefreshToken();
        token.setUserId(user.getId());
        token.setTokenHash(sha256(raw));
        token.setExpiresAt(OffsetDateTime.now(ZoneOffset.UTC).plusDays(properties.jwt().refreshDays()));
        refreshTokenRepository.save(token);
        UserView view = new UserView(user.getId(), user.getEmail(), user.getName());
        return new Issued(new AuthView(jwtService.accessToken(user.getId()), "Bearer", jwtService.accessMinutes() * 60L, view), raw);
    }

    private String newRefreshToken() {
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    static String sha256(String raw) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(raw.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (Exception ex) {
            throw new IllegalStateException(ex);
        }
    }

    static String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    /** auth는 응답 본문, refreshToken은 쿠키에 쓸 원문. */
    public record Issued(AuthView auth, String refreshToken) {}
}