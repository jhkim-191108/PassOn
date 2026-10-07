package com.nextshift.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/** application.properties의 nextshift.* 묶음. */
@ConfigurationProperties(prefix = "nextshift")
public record AppProperties(Jwt jwt, OpenAi openai, Ai ai) {
    /** secret은 HMAC 키. accessMinutes는 액세스 토큰, refreshDays는 쿠키 수명. */
    public record Jwt(String secret, int accessMinutes, int refreshDays) {}

    /** 인수인계 원문을 카드로 나눌 때 쓸 모델. 키는 설정에만 둔다. */
    public record OpenAi(String apiKey, String model) {}

    /** 사용자별 하루 AI 분석 횟수 상한. */
    public record Ai(int dailyLimit) {}

}