package com.nextshift.repo;

import com.nextshift.domain.User;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

/** 탈퇴한 계정(deletedAt이 있는 행)은 이메일 조회에서 빠진다. */
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmailAndDeletedAtIsNull(String email);

    boolean existsByEmailAndDeletedAtIsNull(String email);
}