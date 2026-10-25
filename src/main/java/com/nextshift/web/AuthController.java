package com.nextshift.web;

import com.nextshift.api.Views.AuthView;
import com.nextshift.api.Views.WsTicketView;
import com.nextshift.common.AuthPrincipal;
import com.nextshift.security.JwtService;
import com.nextshift.security.RefreshCookie;
import com.nextshift.security.StoreGuard;
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

/** 가입·로그인·재발급·로그아웃. 리프레시 토큰은 응답 본문이 아니라 쿠키에 넣는다. */
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;
    private final RefreshCookie refreshCookie;
    private final JwtService jwtService;
    private final StoreGuard guard;

    public AuthController(AuthService authService, RefreshCookie refreshCookie, JwtService jwtService, StoreGuard guard) {
        this.authService = authService;
        this.refreshCookie = refreshCookie;
        this.jwtService = jwtService;
        this.guard = guard;
    }

    /** 가입하고 액세스 토큰과 리프레시 쿠키를 준다. */
    @PostMapping("/signup")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthView signup(
            @Valid @RequestBody SignupRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse response
    ) {
        return write(authService.signup(request.email(), request.password(), request.name()), httpRequest, response);
    }

    /** 로그인하고 토큰을 다시 발급한다. */
    @PostMapping("/login")
    public AuthView login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse response
    ) {
        return write(authService.login(request.email(), request.password()), httpRequest, response);
    }

    /** 쿠키의 리프레시 토큰으로 새 액세스 토큰을 받는다. */
    @PostMapping("/refresh")
    public AuthView refresh(HttpServletRequest request, HttpServletResponse response) {
        return write(authService.refresh(refreshCookie.read(request)), request, response);
    }

    /** 리프레시 토큰을 폐기하고 쿠키를 지운다. */
    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(HttpServletRequest request, HttpServletResponse response) {
        authService.logout(refreshCookie.read(request));
        refreshCookie.clear(request, response);
    }

    /** 웹소켓용 1분 티켓. 액세스 토큰은 주소에 넣지 않는다. */
    @PostMapping("/ws-ticket")
    public WsTicketView wsTicket(@Valid @RequestBody WsTicketRequest request) {
        AuthPrincipal principal = AuthPrincipal.current();
        guard.requireActiveMember(request.storeId(), principal.id());
        return new WsTicketView(jwtService.wsTicket(principal.id(), request.storeId()));
    }

    /** 가입 전 이메일 중복을 확인한다. 이미 있으면 409다. */
    @PostMapping("/email-check")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void checkEmail(@Valid @RequestBody EmailCheckRequest request) {
        authService.checkEmail(request.email());
    }

    /** 액세스 토큰은 JSON으로, 리프레시 토큰은 쿠키로 나눈다. */
    private AuthView write(Issued issued, HttpServletRequest request, HttpServletResponse response) {
        refreshCookie.write(request, response, issued.refreshToken());
        return issued.auth();
    }
}