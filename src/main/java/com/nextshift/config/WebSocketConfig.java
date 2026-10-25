package com.nextshift.config;

import com.nextshift.security.NotificationHandshake;
import com.nextshift.web.NotificationSocket;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

/** 알림 웹소켓. 브라우저는 헤더를 못 넣으므로 짧은 티켓을 쿼리로 받는다. */
@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {
    private final NotificationSocket socket;
    private final NotificationHandshake handshake;

    public WebSocketConfig(NotificationSocket socket, NotificationHandshake handshake) {
        this.socket = socket;
        this.handshake = handshake;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(socket, "/ws")
                .addInterceptors(handshake)
                .setAllowedOriginPatterns(
                        "http://localhost:*",
                        "http://127.0.0.1:*",
                        "https://localhost:*",
                        "https://127.0.0.1:*",
                        "https://*.run.app"
                );
    }
}
