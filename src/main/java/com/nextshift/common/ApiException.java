package com.nextshift.common;

import org.springframework.http.HttpStatus;

/** API가 돌려주는 업무 오류. HTTP 상태와 코드, 메시지를 같이 가진다. */
public class ApiException extends RuntimeException {
    private final HttpStatus status;
    private final String code;

    public ApiException(HttpStatus status, String code, String message) {
        super(message);
        this.status = status;
        this.code = code;
    }

    /** HTTP 상태 코드를 반환한다. */
    public HttpStatus getStatus() {
        return status;
    }

    /** 클라이언트가 구분할 오류 코드를 반환한다. */
    public String getCode() {
        return code;
    }

    public static ApiException unauthorized(String message) {
        return new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", message);
    }

    public static ApiException conflict(String message) {
        return new ApiException(HttpStatus.CONFLICT, "CONFLICT", message);
    }

    public static ApiException badRequest(String message) {
        return new ApiException(HttpStatus.BAD_REQUEST, "BAD_REQUEST", message);
    }

    public static ApiException forbidden(String message) {
        return new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", message);
    }
    public static ApiException notFound(String message) {
        return new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", message);
    }
    public static ApiException tooMany(String message) {
        return new ApiException(HttpStatus.TOO_MANY_REQUESTS, "TOO_MANY_REQUESTS", message);
    }
}