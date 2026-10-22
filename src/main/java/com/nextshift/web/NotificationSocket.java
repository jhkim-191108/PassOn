package com.nextshift.web;

import com.fasterxml.jackson.annotation.JsonInclude;
import tools.jackson.databind.ObjectMapper;
import com.nextshift.api.Views.CardView;
import com.nextshift.api.Views.NotificationView;
import com.nextshift.api.Views.ShiftView;
import java.io.IOException;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.CopyOnWriteArraySet;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

/** 로그인한 멤버에게 새 알림을 밀어 준다. 같은 사용자가 탭을 여러 개 열어도 모두 받는다. */
@Component
public class NotificationSocket extends TextWebSocketHandler {
    private final ObjectMapper objectMapper;
    private final ConcurrentMap<UUID, Set<WebSocketSession>> sessions = new ConcurrentHashMap<>();

    public NotificationSocket(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    /** 연결이 되면 준비됐다는 메시지를 보내고 세션을 기억한다. */
    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        UUID userId = (UUID) session.getAttributes().get("userId");
        if (userId == null) {
            session.close(CloseStatus.POLICY_VIOLATION);
            return;
        }
        sessions.computeIfAbsent(userId, ignored -> new CopyOnWriteArraySet<>()).add(session);
        send(session, new LiveMessage("ready", null, null, null));
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        forget(session);
    }

    /** 그 사용자 중 이 매장을 보고 있는 연결에 알림 한 건을 보낸다. */
    public void send(UUID userId, UUID storeId, NotificationView notification) {
        Set<WebSocketSession> open = sessions.get(userId);
        if (open == null) {
            return;
        }
        LiveMessage message = new LiveMessage("notification", notification, null, null);
        for (WebSocketSession session : open) {
            if (!storeId.equals(session.getAttributes().get("storeId")) || !session.isOpen()) {
                continue;
            }
            try {
                send(session, message);
            } catch (IOException ex) {
                forget(session);
            }
        }
    }

    /** 그 매장을 보고 있는 연결에 미완료 카드를 보낸다. */
    public void cards(UUID storeId, List<CardView> cards) {
        broadcast(storeId, new LiveMessage("cards", null, cards, null));
    }

    /** 그 매장을 보고 있는 연결에 오늘 근무를 보낸다. */
    public void shifts(UUID storeId, List<ShiftView> shifts) {
        broadcast(storeId, new LiveMessage("shifts", null, null, shifts));
    }

    private void broadcast(UUID storeId, LiveMessage message) {
        for (Set<WebSocketSession> open : sessions.values()) {
            for (WebSocketSession session : open) {
                if (!storeId.equals(session.getAttributes().get("storeId")) || !session.isOpen()) {
                    continue;
                }
                try {
                    send(session, message);
                } catch (IOException ex) {
                    forget(session);
                }
            }
        }
    }

    private void send(WebSocketSession session, LiveMessage message) throws IOException {
        synchronized (session) {
            if (session.isOpen()) {
                session.sendMessage(new TextMessage(objectMapper.writeValueAsString(message)));
            }
        }
    }

    private void forget(WebSocketSession session) {
        UUID userId = (UUID) session.getAttributes().get("userId");
        if (userId == null) {
            return;
        }
        Set<WebSocketSession> open = sessions.get(userId);
        if (open == null) {
            return;
        }
        open.remove(session);
        if (open.isEmpty()) {
            sessions.remove(userId, open);
        }
    }

    /** ready는 연결 확인, notification은 알림, cards는 미완료 카드, shifts는 오늘 근무다. */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record LiveMessage(String type, NotificationView notification, List<CardView> cards, List<ShiftView> shifts) {}
}
