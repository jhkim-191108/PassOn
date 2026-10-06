package com.nextshift.common;

import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<Map<String, Object>> api(ApiException ex) {
        return ResponseEntity.status(ex.getStatus()).body(body(ex.getStatus().value(), ex.getCode(), ex.getMessage()));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> unreadable(HttpMessageNotReadableException ex) {
        return ResponseEntity.badRequest().body(body(400, "BAD_REQUEST", "요청 본문을 읽을 수 없습니다."));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> invalid(MethodArgumentNotValidException ex) {
        Map<String, String> fields = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error -> fields.put(error.getField(), error.getDefaultMessage()));
        Map<String, Object> payload = body(400, "VALIDATION_ERROR", "요청 값을 확인해 주세요.");
        payload.put("fields", fields);
        return ResponseEntity.badRequest().body(payload);
    }

    private static Map<String, Object> body(int status, String code, String message) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("status", status);
        payload.put("code", code);
        payload.put("message", message);
        return payload;
    }
}