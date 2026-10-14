package com.nextshift.web;

import com.nextshift.api.Views.NotificationSettingsView;
import com.nextshift.api.Views.UserView;
import com.nextshift.common.AuthPrincipal;
import com.nextshift.service.ProfilePhotoService;
import com.nextshift.service.ProfilePhotoService.Stored;
import com.nextshift.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/** 로그인한 본인 정보. 이름, 비밀번호, 알림, 프로필 사진, 탈퇴. */
@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;
    private final ProfilePhotoService profilePhotoService;

    public UserController(UserService userService, ProfilePhotoService profilePhotoService) {
        this.userService = userService;
        this.profilePhotoService = profilePhotoService;
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

    /** 알림 켜기를 돌려준다. */
    @GetMapping("/me/notification-settings")
    public NotificationSettingsView notificationSettings() {
        return userService.notificationSettings(AuthPrincipal.current());
    }

    /** 보낸 알림만 바꾼다. */
    @PatchMapping("/me/notification-settings")
    public NotificationSettingsView updateNotificationSettings(@RequestBody NotificationSettingsRequest request) {
        return userService.updateNotificationSettings(
                AuthPrincipal.current(),
                request.assignment(),
                request.urgent(),
                request.memo(),
                request.completed()
        );
    }

    /** 프로필 사진을 올린다. 필드 이름은 file. jpeg, png, webp, gif, 5MB 이하. */
    @PostMapping(value = "/me/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public UserView uploadPhoto(@RequestParam("file") MultipartFile file) {
        AuthPrincipal principal = AuthPrincipal.current();
        profilePhotoService.save(principal.id(), file);
        return userService.me(principal);
    }

    /** 내 프로필 사진 파일을 돌려준다. */
    @GetMapping("/me/photo")
    public ResponseEntity<byte[]> photo() {
        Stored stored = profilePhotoService.load(AuthPrincipal.current().id());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"profile\"")
                .contentType(MediaType.parseMediaType(stored.contentType()))
                .body(stored.bytes());
    }

    /** 프로필 사진을 지운다. */
    @DeleteMapping("/me/photo")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePhoto() {
        profilePhotoService.delete(AuthPrincipal.current().id());
    }

    /** 탈퇴한다. 행은 남기고 리프레시 토큰만 모두 폐기한다. 사진 파일도 지운다. */
    @DeleteMapping("/me")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete() {
        userService.delete(AuthPrincipal.current());
    }
}