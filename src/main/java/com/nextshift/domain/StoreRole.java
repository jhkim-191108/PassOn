package com.nextshift.domain;

/** 매장 안 권한. OWNER가 가장 넓고 STAFF는 본인 글 위주다. */
public enum StoreRole {
    OWNER, // 매장 생성자. 삭제와 매니저 지정이 가능하다.
    MANAGER, // 직원과 매장 정보를 관리한다.
    STAFF // 일반 근무자.
}