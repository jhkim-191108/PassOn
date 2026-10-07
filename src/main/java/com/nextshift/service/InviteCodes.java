package com.nextshift.service;

import com.nextshift.repo.StoreRepository;
import java.security.SecureRandom;
import org.springframework.stereotype.Component;

/** 6자리 초대 코드. 헷갈리는 0, O, 1, I는 빼 두었다. */
@Component
public class InviteCodes {
    private static final String ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

    private final StoreRepository storeRepository;
    private final SecureRandom random = new SecureRandom();

    public InviteCodes(StoreRepository storeRepository) {
        this.storeRepository = storeRepository;
    }

    public String next() {
        for (int attempt = 0; attempt < 8; attempt++) {
            StringBuilder builder = new StringBuilder(6);
            for (int i = 0; i < 6; i++) {
                builder.append(ALPHABET.charAt(random.nextInt(ALPHABET.length())));
            }
            String code = builder.toString();
            if (!storeRepository.existsByInviteCode(code)) {
                return code;
            }
        }
        throw new IllegalStateException("초대 코드를 만들지 못했습니다.");
    }
}