package com.nextshift.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;

/** 로그인 계정. 탈퇴해도 행은 남기고 deletedAt만 채운다. */
@Entity
@Table(name = "users")
public class User extends UuidEntity {
    @Column(nullable = false)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(nullable = false)
    private String name;

    /** 값이 있으면 탈퇴한 계정. 로그인도 이메일 중복 검사도 이 행을 건너뛴다. */
    @Column(name = "deleted_at")
    private OffsetDateTime deletedAt;

    /** 내게 업무가 배정됐을 때. */
    @Column(name = "notify_assignment", nullable = false)
    private boolean notifyAssignment = true;

    /** 긴급 업무가 등록됐을 때. */
    @Column(name = "notify_urgent", nullable = false)
    private boolean notifyUrgent = true;

    /** 내 업무에 메모가 추가됐을 때. */
    @Column(name = "notify_memo", nullable = false)
    private boolean notifyMemo = true;

    /** 내가 작성한 업무가 완료됐을 때. */
    @Column(name = "notify_completed", nullable = false)
    private boolean notifyCompleted = false;

    /** 로그인 이메일을 반환한다. */
    public String getEmail() {
        return email;
    }

    /** 로그인 이메일을 저장한다. */
    public void setEmail(String email) {
        this.email = email;
    }

    /** 비밀번호 해시를 반환한다. 원문은 저장하지 않는다. */
    public String getPasswordHash() {
        return passwordHash;
    }

    /** 비밀번호 해시를 저장한다. */
    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    /** 표시 이름을 반환한다. */
    public String getName() {
        return name;
    }

    /** 표시 이름을 저장한다. */
    public void setName(String name) {
        this.name = name;
    }

    /** 탈퇴 시각을 반환한다. null이면 아직 사용 중인 계정이다. */
    public OffsetDateTime getDeletedAt() {
        return deletedAt;
    }

    /** 탈퇴 시각을 저장한다. */
    public void setDeletedAt(OffsetDateTime deletedAt) {
        this.deletedAt = deletedAt;
    }

    /** 업무 배정 알림을 받을지 반환한다. */
    public boolean isNotifyAssignment() {
        return notifyAssignment;
    }

    /** 업무 배정 알림을 받을지 저장한다. */
    public void setNotifyAssignment(boolean notifyAssignment) {
        this.notifyAssignment = notifyAssignment;
    }

    /** 긴급 인수인계 알림을 받을지 반환한다. */
    public boolean isNotifyUrgent() {
        return notifyUrgent;
    }

    /** 긴급 인수인계 알림을 받을지 저장한다. */
    public void setNotifyUrgent(boolean notifyUrgent) {
        this.notifyUrgent = notifyUrgent;
    }

    /** 메모 알림을 받을지 반환한다. */
    public boolean isNotifyMemo() {
        return notifyMemo;
    }

    /** 메모 알림을 받을지 저장한다. */
    public void setNotifyMemo(boolean notifyMemo) {
        this.notifyMemo = notifyMemo;
    }

    /** 처리 완료 알림을 받을지 반환한다. */
    public boolean isNotifyCompleted() {
        return notifyCompleted;
    }

    /** 처리 완료 알림을 받을지 저장한다. */
    public void setNotifyCompleted(boolean notifyCompleted) {
        this.notifyCompleted = notifyCompleted;
    }
}