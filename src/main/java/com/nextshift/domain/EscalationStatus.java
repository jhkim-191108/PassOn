package com.nextshift.domain;

/** 위임 처리 상태. */
public enum EscalationStatus {
    PENDING, // 오너 처리 대기
    RESOLVED // 오너가 처리 완료
}