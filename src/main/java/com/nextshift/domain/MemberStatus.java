package com.nextshift.domain;

/** 매장 소속 상태. ACTIVE만 API를 사용할 수 있다. */
public enum MemberStatus {
    ACTIVE,
    SUSPENDED, // 정지. 다시 초대 코드로 들어올 수 없다.
    LEFT // 퇴사.
}