package com.nextshift.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "nextshift")
public record AppProperties(Jwt jwt, OpenAi openai, Ai ai) {
    public record Jwt(String secret, int accessMinutes, int refreshDays) {}

    public record OpenAi(String apiKey, String model) {}

    public record Ai(int dailyLimit) {}

}