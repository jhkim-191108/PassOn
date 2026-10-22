package com.nextshift.security;

import com.nextshift.common.ApiException;
import com.nextshift.domain.User;
import com.nextshift.repo.UserRepository;
import io.jsonwebtoken.JwtException;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpHeaders;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

/** 웹소켓 연결 전에 액세스 토큰과 매장 멤버를 확인한다. */
@Component
public class NotificationHandshake implements HandshakeInterceptor {
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final StoreGuard guard;

    public NotificationHandshake(JwtService jwtService, UserRepository userRepository, StoreGuard guard) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.guard = guard;
    }

    /** 토큰이 맞고 그 매장의 활동 멤버면 연결을 허용한다. */
    @Override
    public boolean beforeHandshake(
            ServerHttpRequest request,
            ServerHttpResponse response,
            WebSocketHandler wsHandler,
            Map<String, Object> attributes
    ) {
        if (!(request instanceof ServletServerHttpRequest servletRequest)) {
            return false;
        }
        String token = token(servletRequest);
        String store = servletRequest.getServletRequest().getParameter("storeId");
        if (token == null || store == null || store.isBlank()) {
            return false;
        }
        try {
            User user = userRepository.findById(jwtService.userId(token)).orElse(null);
            if (user == null || user.getDeletedAt() != null) {
                return false;
            }
            UUID storeId = UUID.fromString(store);
            guard.requireActiveMember(storeId, user.getId());
            attributes.put("userId", user.getId());
            attributes.put("storeId", storeId);
            return true;
        } catch (JwtException | IllegalArgumentException | ApiException ex) {
            return false;
        }
    }

    @Override
    public void afterHandshake(
            ServerHttpRequest request,
            ServerHttpResponse response,
            WebSocketHandler wsHandler,
            Exception exception
    ) {
    }

    private static String token(ServletServerHttpRequest request) {
        String header = request.getServletRequest().getHeader(HttpHeaders.AUTHORIZATION);
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        String query = request.getServletRequest().getParameter("token");
        if (query == null || query.isBlank()) {
            return null;
        }
        return query;
    }
}
