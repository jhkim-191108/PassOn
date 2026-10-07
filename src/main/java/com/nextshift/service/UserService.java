package com.nextshift.service;

import com.nextshift.api.Views.UserView;
import com.nextshift.common.ApiException;
import com.nextshift.common.AuthPrincipal;
import com.nextshift.domain.User;
import com.nextshift.repo.RefreshTokenRepository;
import com.nextshift.repo.UserRepository;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 본인 계정. 탈퇴는 행 삭제가 아니라 deletedAt을 찍고 리프레시 토큰을 모두 폐기한다. */
@Service
public class UserService {
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, RefreshTokenRepository refreshTokenRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /** 탈퇴하지 않은 내 계정을 돌려준다. */
    @Transactional(readOnly = true)
    public UserView me(AuthPrincipal principal) {
        return view(activeUser(principal));
    }

    /** 내 이름을 공백 없이 잘라 저장한다. */
    @Transactional
    public UserView update(AuthPrincipal principal, String name) {
        User user = activeUser(principal);
        user.setName(name.trim());
        return view(user);
    }

    /** 현재 비밀번호가 맞을 때만 해시를 갈아 끼운다. */
    @Transactional
    public void changePassword(AuthPrincipal principal, String currentPassword, String newPassword) {
        User user = activeUser(principal);
        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw ApiException.badRequest("현재 비밀번호가 올바르지 않습니다.");
        }
        user.setPasswordHash(passwordEncoder.encode(newPassword));
    }

    /** deletedAt을 찍고, 그 사용자의 살아있는 리프레시 토큰을 모두 폐기한다. */
    @Transactional
    public void delete(AuthPrincipal principal) {
        User user = activeUser(principal);
        user.setDeletedAt(OffsetDateTime.now(ZoneOffset.UTC));
        refreshTokenRepository.revokeActive(user.getId(), OffsetDateTime.now(ZoneOffset.UTC));
    }

    private User activeUser(AuthPrincipal principal) {
        return userRepository.findById(principal.id())
                .filter(user -> user.getDeletedAt() == null)
                .orElseThrow(() -> ApiException.unauthorized("로그인이 필요합니다."));
    }

    private static UserView view(User user) {
        return new UserView(user.getId(), user.getEmail(), user.getName());
    }
}