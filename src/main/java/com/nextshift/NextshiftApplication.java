package com.nextshift;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.boot.security.autoconfigure.UserDetailsServiceAutoConfiguration;

// 기본 사용자 자동 생성은 끄고, nextshift.* 설정을 AppProperties로 읽는다.
@SpringBootApplication(exclude = UserDetailsServiceAutoConfiguration.class)
@ConfigurationPropertiesScan
public class NextshiftApplication {
    public static void main(String[] args) {
        SpringApplication.run(NextshiftApplication.class, args);
    }
}