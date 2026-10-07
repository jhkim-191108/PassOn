package com.nextshift.domain;

/** 카드 중요도. AI가 먼저 정하고, 작성자가 고칠 수 있다. */
public enum Urgency {
    NOW, // 당장
    TODAY, // 오늘 안
    LATER // 나중에
}