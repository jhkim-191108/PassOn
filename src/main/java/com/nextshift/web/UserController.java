package com.nextshift.web;

import com.nextshift.api.Views.UserView;
import com.nextshift.common.AuthPrincipal;
import com.nextshift.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** 로그인한 본인 정보. 이름, 비밀번호, 탈퇴. */
@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /** 로그인한 내 정보를 돌려준다. */
    @GetMapping("/me")
    public UserView me() {
        return userService.me(AuthPrincipal.current());
    }

    /** 내 이름을 고친다. */
    @PatchMapping("/me")
    public UserView update(@Valid @RequestBody UpdateMeRequest request) {
        return userService.update(AuthPrincipal.current(), request.name());
    }

    /** 현재 비밀번호를 확인하고 새 비밀번호로 바꾼다. */
    @PatchMapping("/me/password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void password(@Valid @RequestBody PasswordRequest request) {
        userService.changePassword(AuthPrincipal.current(), request.currentPassword(), request.newPassword());
    }

    /** 탈퇴한다. 행은 남기고 리프레시 토큰만 모두 폐기한다. */
    @DeleteMapping("/me")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete() {
        userService.delete(AuthPrincipal.current());
    }
}