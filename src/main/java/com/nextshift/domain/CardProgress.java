package com.nextshift.domain;

/** 카드 진행 상태. 완료가 확인보다 우선이다. */
public enum CardProgress {
    OPEN,
    IN_PROGRESS,
    DONE
}