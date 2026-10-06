package com.nextshift.web;

import com.nextshift.api.Views.AuthView;
import com.nextshift.security.RefreshCookie;
import com.nextshift.service.AuthService;
import com.nextshift.service.AuthService.Issued;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;
    private final RefreshCookie refreshCookie;

    public AuthController(AuthService authService, RefreshCookie refreshCookie) {
        this.authService = authService;
        this.refreshCookie = refreshCookie;
    }

    @PostMapping("/signup")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthView signup(@Valid @RequestBody SignupRequest request, HttpServletResponse response) {
        return write(authService.signup(request.email(), request.password(), request.name()), response);
    }

    @PostMapping("/login")
    public AuthView login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        return write(authService.login(request.email(), request.password()), response);
    }

    @PostMapping("/refresh")
    public AuthView refresh(HttpServletRequest request, HttpServletResponse response) {
        return write(authService.refresh(refreshCookie.read(request)), response);
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(HttpServletRequest request, HttpServletResponse response) {
        authService.logout(refreshCookie.read(request));
        refreshCookie.clear(response);
    }

    @PostMapping("/email-check")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void checkEmail(@Valid @RequestBody EmailCheckRequest request) {
        authService.checkEmail(request.email());
    }

    private AuthView write(Issued issued, HttpServletResponse response) {
        refreshCookie.write(response, issued.refreshToken());
        return issued.auth();
    }
}