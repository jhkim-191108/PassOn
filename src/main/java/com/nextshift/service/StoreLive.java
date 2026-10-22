package com.nextshift.service;

import com.nextshift.web.NotificationSocket;
import java.util.UUID;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

/** 우측 패널에 카드와 오늘 근무를 보낸다. 저장이 확정된 뒤에 한 번만 보낸다. */
@Service
public class StoreLive {
    private final NotificationSocket sockets;
    private final CardService cardService;
    private final ShiftService shiftService;

    public StoreLive(NotificationSocket sockets, @Lazy CardService cardService, @Lazy ShiftService shiftService) {
        this.sockets = sockets;
        this.cardService = cardService;
        this.shiftService = shiftService;
    }

    /** 주요 인수인계와 오늘의 현황에 쓰는 미완료 카드 목록을 보낸다. */
    public void cards(UUID storeId) {
        afterCommit("cards", storeId, () -> sockets.cards(storeId, cardService.openCards(storeId)));
    }

    /** 오늘 근무 목록을 보낸다. */
    public void shifts(UUID storeId) {
        afterCommit("shifts", storeId, () -> sockets.shifts(storeId, shiftService.today(storeId)));
    }

    private void afterCommit(String kind, UUID storeId, Runnable send) {
        if (!TransactionSynchronizationManager.isSynchronizationActive()) {
            send.run();
            return;
        }
        String key = kind + ":" + storeId;
        if (TransactionSynchronizationManager.hasResource(key)) {
            return;
        }
        TransactionSynchronizationManager.bindResource(key, Boolean.TRUE);
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                send.run();
            }

            @Override
            public void afterCompletion(int status) {
                TransactionSynchronizationManager.unbindResourceIfPossible(key);
            }
        });
    }
}
