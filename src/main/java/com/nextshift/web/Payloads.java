package com.nextshift.web;

import com.nextshift.domain.MemberStatus;
import com.nextshift.domain.StoreRole;
import com.nextshift.domain.StoreType;
import com.nextshift.domain.CardType;
import com.nextshift.domain.Urgency;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.UUID;

/** 요청 본문. 검증 메시지는 그대로 클라이언트에 내려간다. */

record SignupRequest(
        @NotBlank(message = "이메일을 입력해 주세요.") @Email(message = "이메일 형식이 아닙니다.") String email,
        @NotBlank(message = "비밀번호를 입력해 주세요.") @Pattern(
                regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9\\s])\\S{8,72}$",
                message = "비밀번호는 8자 이상이며 영문 대문자, 소문자, 특수문자를 포함해야 합니다."
        )
        String password,
        @NotBlank(message = "이름을 입력해 주세요.") @Size(max = 40, message = "이름은 40자 이하입니다.") String name
) {}

/** 로그인. 실패 이유는 이메일/비밀번호를 구분하지 않는다. */
record LoginRequest(
        @NotBlank(message = "이메일을 입력해 주세요.") String email,
        @NotBlank(message = "비밀번호를 입력해 주세요.") String password
) {}

/** 내 이름 수정. */
record UpdateMeRequest(
        @NotBlank(message = "이름을 입력해 주세요.") @Size(max = 40, message = "이름은 40자 이하입니다.") String name
) {}

/** 비밀번호 변경. 현재 비밀번호를 같이 받는다. */
record PasswordRequest(
        @NotBlank(message = "현재 비밀번호를 입력해 주세요.") String currentPassword,
        @NotBlank(message = "새 비밀번호를 입력해 주세요.")
        @Pattern(
                regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9\\s])\\S{8,72}$",
                message = "비밀번호는 8자 이상이며 영문 대문자, 소문자, 특수문자를 포함해야 합니다."
        )
        String newPassword
) {}

/** 가입 전 이메일 중복 확인. */
record EmailCheckRequest(
        @NotBlank(message = "이메일을 입력해 주세요.") @Email(message = "이메일 형식이 아닙니다.") String email
) {}

/** 매장 생성·이름 수정. type이 없으면 서비스에서 CAFE로 둔다. */
record StoreRequest(
        @NotBlank(message = "매장 이름을 입력해 주세요.") @Size(max = 40, message = "매장 이름은 40자 이하입니다.") String name,
        StoreType type
) {}

/** 초대 코드로 매장 참여. OWNER로는 들어올 수 없다. */
record JoinStoreRequest(
        @NotBlank(message = "초대 코드를 입력해 주세요.") @Size(max = 16, message = "초대 코드를 확인해 주세요.") String code,
        @NotNull(message = "역할을 지정해 주세요.") StoreRole role
) {}

/** 멤버를 팀에 배정한다. null이면 미배정. */
record TeamRequest(UUID teamId) {}

/** 팀 이름 생성·변경. */
record TeamNameRequest(
        @NotBlank(message = "팀 이름을 입력해 주세요.")
        @Size(max = 20, message = "팀 이름은 20자 이하입니다.")
        String name
) {}

/** 이미 가입한 사용자를 매장에 직접 넣는다. */
record AddMemberRequest(
        @NotNull(message = "사용자를 지정해 주세요.") UUID userId,
        @NotNull(message = "역할을 지정해 주세요.") StoreRole role
) {}

/** 멤버 역할 변경. */
record RoleRequest(@NotNull(message = "역할을 지정해 주세요.") StoreRole role) {}

/** 멤버 상태 변경. 정지·퇴사에 쓴다. */
record StatusRequest(@NotNull(message = "상태를 지정해 주세요.") MemberStatus status) {}

/** 인수인계 원문 작성. */
record HandoffRequest(
        @NotNull(message = "매장을 지정해 주세요.") UUID storeId,
        @NotBlank(message = "인수인계 내용을 입력해 주세요.") @Size(max = 4000, message = "인수인계는 4000자 이하입니다.") String rawText
) {}

/** 아직 확정 전인 원문 수정. */
record HandoffPatchRequest(
        @NotBlank(message = "인수인계 내용을 입력해 주세요.") @Size(max= 4000, message = "인수인계는 4000자 이하입니다.") String rawText
) {}

/** 카드 일부만 고친다. 안 보낸 필드는 그대로 둔다. */
record CardPatchRequest(
        CardType type,
        @Size(max = 120, message = "제목은 120자 이하입니다.") String title,
        String body,
        Urgency urgency,
        Boolean needsReview
) {}

/** 공지 작성. pinned와 important는 생략할 수 있다. */
record NoticeRequest(
        @NotBlank(message = "공지 제목을 입력해 주세요.") @Size(max = 120, message = "제목은 120자 이하입니다.") String title,
        @NotBlank(message = "공지 내용을 입력해 주세요.") @Size(max = 4000, message = "내용은 4000자 이하 입니다.") String body,
        Boolean pinned,
        Boolean important
) {}

/** 공지 일부 수정. 안 보낸 필드는 그대로 둔다. */
record NoticePatchRequest(
        @Size(max = 120, message = "제목은 120자 이하입니다.") String title,
        @Size(max = 4000, message = "내용은 4000자 이하입니다.") String body,
        Boolean pinned,
        Boolean important
) {}



