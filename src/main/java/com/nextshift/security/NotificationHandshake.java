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

/** 웹소켓 연결 전에 티켓과 매장 멤버를 확인한다. 액세스 토큰은 주소로 받지 않는다. */
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

    /** 티켓이 맞고 그 매장의 활동 멤버면 연결을 허용한다. */
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
        String store = servletRequest.getServletRequest().getParameter("storeId");
        if (store == null || store.isBlank()) {
            return false;
        }
        try {
            UUID storeId = UUID.fromString(store);
            UUID userId = userId(servletRequest, storeId);
            User user = userRepository.findById(userId).orElse(null);
            if (user == null || user.getDeletedAt() != null) {
                return false;
            }
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

    /** 헤더의 액세스 토큰 또는 쿼리의 짧은 티켓. 쿼리에는 액세스 토큰을 받지 않는다. */
    private UUID userId(ServletServerHttpRequest request, UUID storeId) {
        String header = request.getServletRequest().getHeader(HttpHeaders.AUTHORIZATION);
        if (header != null && header.startsWith("Bearer ")) {
            return jwtService.userId(header.substring(7));
        }
        String ticket = request.getServletRequest().getParameter("ticket");
        if (ticket == null || ticket.isBlank()) {
            throw new IllegalArgumentException("티켓이 없습니다.");
        }
        WsTicket parsed = jwtService.readWsTicket(ticket);
        if (!storeId.equals(parsed.storeId())) {
            throw new IllegalArgumentException("티켓의 매장이 다릅니다.");
        }
        return parsed.userId();
    }
}
