package com.nextshift.web;

import com.nextshift.api.Views.NotificationView;
import com.nextshift.common.AuthPrincipal;
import com.nextshift.service.NotificationService;
import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

/** 내 알림 목록과 읽음 처리. */
@RestController
public class NotificationController {
    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    /** 그 매장에서 내가 받은 알림을 최신순으로 돌려준다. */
    @GetMapping("/api/stores/{storeId}/notifications")
    public List<NotificationView> list(@PathVariable UUID storeId) {
        return notificationService.list(AuthPrincipal.current(), storeId);
    }

    /** 알림 한 건을 읽음 처리한다. */
    @PostMapping("/api/notifications/{notificationId}/read")
    public NotificationView read(@PathVariable UUID notificationId) {
        return notificationService.read(AuthPrincipal.current(), notificationId);
    }

    /** 그 매장의 안 읽은 알림을 모두 읽음 처리하고 개수를 돌려준다. */
    @PostMapping("/api/stores/{storeId}/notifications/read-all")
    public int readAll(@PathVariable UUID storeId) {
        return notificationService.readAll(AuthPrincipal.current(), storeId);
    }
}