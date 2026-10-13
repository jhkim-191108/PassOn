package com.nextshift.domain;

/** 오너에게 올린 위임의 우선순위. 카드의 NOW, TODAY, LATER와는 다른 값이다. */
public enum EscalationPriority {
    IMPORTANT, // 중요
    URGENT // 긴급
}