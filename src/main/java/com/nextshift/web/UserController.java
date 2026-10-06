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

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public UserView me() {
        return userService.me(AuthPrincipal.current());
    }

    @PatchMapping("/me")
    public UserView update(@Valid @RequestBody UpdateMeRequest request) {
        return userService.update(AuthPrincipal.current(), request.name());
    }

    @PatchMapping("/me/password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void password(@Valid @RequestBody PasswordRequest request) {
        userService.changePassword(AuthPrincipal.current(), request.currentPassword(), request.newPassword());
    }

    @DeleteMapping("/me")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete() {
        userService.delete(AuthPrincipal.current());
    }
}