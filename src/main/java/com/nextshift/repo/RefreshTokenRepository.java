package com.nextshift.repo;

import com.nextshift.domain.RefreshToken;
import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

/** 리프레시 토큰은 해시로 찾고, 탈퇴 시 그 사용자의 살아있는 토큰을 한 번에 폐기한다. */
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {
    Optional<RefreshToken> findByTokenHash(String tokenHash);

    @Modifying
    @Query("update RefreshToken t set t.revokedAt = :now where t.userId = :userId and t.revokedAt is null")
    void revokeActive(UUID userId, OffsetDateTime now);
}