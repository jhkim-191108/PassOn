package com.nextshift.web;

import com.nextshift.domain.MemberStatus;
import com.nextshift.domain.ShiftTeam;
import com.nextshift.domain.StoreRole;
import com.nextshift.domain.StoreType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.UUID;

record SignupRequest(
        @NotBlank(message = "이메일을 입력해 주세요.") @Email(message = "이메일 형식이 아닙니다.") String email,
        @NotBlank(message = "비밀번호를 입력해 주세요.") @Pattern(
                regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9\\s])\\S{8,72}$",
                message = "비밀번호는 8자 이상이며 영문 대문자, 소문자, 특수문자를 포함해야 합니다."
        )
        String password,
        @NotBlank(message = "이름을 입력해 주세요.") @Size(max = 40, message = "이름은 40자 이하입니다.") String name
) {}

record LoginRequest(
        @NotBlank(message = "이메일을 입력해 주세요.") String email,
        @NotBlank(message = "비밀번호를 입력해 주세요.") String password
) {}

record UpdateMeRequest(
        @NotBlank(message = "이름을 입력해 주세요.") @Size(max = 40, message = "이름은 40자 이하입니다.") String name
) {}

record PasswordRequest(
        @NotBlank(message = "현재 비밀번호를 입력해 주세요.") String currentPassword,
        @NotBlank(message = "새 비밀번호를 입력해 주세요.")
        @Pattern(
                regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9\\s])\\S{8,72}$",
                message = "비밀번호는 8자 이상이며 영문 대문자, 소문자, 특수문자를 포함해야 합니다."
        )
        String newPassword
) {}

record EmailCheckRequest(
        @NotBlank(message = "이메일을 입력해 주세요.") @Email(message = "이메일 형식이 아닙니다.") String email
) {}

record StoreRequest(
        @NotBlank(message = "매장 이름을 입력해 주세요.") @Size(max = 40, message = "매장 이름은 40자 이하입니다.") String name,
        StoreType type
) {}

record JoinStoreRequest(
        @NotBlank(message = "초대 코드를 입력해 주세요.") @Size(max = 16, message = "초대 코드를 확인해 주세요.") String code,
        @NotNull(message = "역할을 지정해 주세요.") StoreRole role
) {}

record TeamRequest(ShiftTeam team) {}

record AddMemberRequest(
        @NotNull(message = "사용자를 지정해 주세요.") UUID userId,
        @NotNull(message = "역할을 지정해 주세요.") StoreRole role
) {}

record RoleRequest(@NotNull(message = "역할을 지정해 주세요.") StoreRole role) {}

record StatusRequest(@NotNull(message = "상태를 지정해 주세요.") MemberStatus status) {}

record HandoffRequest(
        @NotNull(message = "매장을 지정해 주세요.") UUID storeid,
        @NotBlank(message = "인수인계 내용을 입력해 주세요.") @size(max = 4000, message = "인수인계는 4000자 이하입니다.") String rawText
) {}

record HandoffPatchRequest(
        @NotBlank(message = "인수인계 내용을 입력해 주세요.") @Size(max= 4000, message = "인수인계는 4000자 이하입니다.") String rawText
) {}

record CardPatchRequest(
        CardType type,
        @Size(max = 120, message = "제목은 120자 이하입니다.") String title,
        String body,
        Urgency urgency,
        Boolean needsReview
) {}



