package com.nextshift.domain;

/** 인수인계가 원문에서 카드로 확정되기까지의 단계. */
public enum HandoffStatus {
    DRAFT, // 원문만 저장됨
    ANALYZING, // AI 분석 중
    ANALYZED, // 카드가 만들어짐
    FAILED, // 분석 실패
    CONFIRMED // 작성자가 카드를 확정함
}