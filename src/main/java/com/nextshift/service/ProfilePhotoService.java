package com.nextshift.service;

import com.nextshift.common.ApiException;
import java.io.IOException;
import java.util.Locale;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/** 프로필 사진. 계정 행은 그대로 두고 파일만 profiles/{사용자ID}에 둔다. */
@Service
public class ProfilePhotoService {
    private static final int MAX_BYTES = 5 * 1024 * 1024;
    private static final String[] EXTENSIONS = {".jpg", ".png", ".webp", ".gif"};

    private final ImageFiles files;

    public ProfilePhotoService(ImageFiles files) {
        this.files = files;
    }

    /** 이 사용자의 사진 파일이 있으면 true. */
    public boolean exists(UUID userId) {
        return find(userId) != null;
    }

    /** jpeg, png, webp, gif 한 장으로 갈아 끼운다. 5MB 이하. */
    public void save(UUID userId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw ApiException.badRequest("사진 파일을 선택해 주세요.");
        }
        String contentType = normalize(file.getContentType());
        String extension = extension(contentType);
        if (extension == null) {
            throw ApiException.badRequest("jpeg, png, webp, gif 이미지만 올릴 수 있습니다.");
        }
        byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (IOException ex) {
            throw new IllegalStateException("사진을 읽지 못했습니다.", ex);
        }
        if (bytes.length == 0) {
            throw ApiException.badRequest("빈 파일은 올릴 수 없습니다.");
        }
        if (bytes.length > MAX_BYTES) {
            throw ApiException.badRequest("사진은 5MB 이하만 올릴 수 있습니다.");
        }
        delete(userId);
        String storedType = contentType.equals("image/jpg") ? "image/jpeg" : contentType;
        files.write(key(userId, extension), storedType, bytes);
    }

    /** 저장된 사진 바이트와 Content-Type. 없으면 404. */
    public Stored load(UUID userId) {
        String key = find(userId);
        if (key == null) {
            throw ApiException.notFound("프로필 사진이 없습니다.");
        }
        byte[] bytes = files.read(key);
        if (bytes == null) {
            throw ApiException.notFound("프로필 사진이 없습니다.");
        }
        return new Stored(contentType(key), bytes);
    }

    /** 사진 파일을 지운다. 없어도 그냥 끝낸다. */
    public void delete(UUID userId) {
        for (String extension : EXTENSIONS) {
            files.delete(key(userId, extension));
        }
    }

    private String find(UUID userId) {
        for (String extension : EXTENSIONS) {
            String key = key(userId, extension);
            if (files.exists(key)) {
                return key;
            }
        }
        return null;
    }

    private static String key(UUID userId, String extension) {
        return "profiles/" + userId + extension;
    }

    private static String contentType(String key) {
        String name = key.toLowerCase(Locale.ROOT);
        if (name.endsWith(".png")) {
            return "image/png";
        }
        if (name.endsWith(".webp")) {
            return "image/webp";
        }
        if (name.endsWith(".gif")) {
            return "image/gif";
        }
        return "image/jpeg";
    }

    private static String normalize(String contentType) {
        if (contentType == null) {
            return "";
        }
        String value = contentType.toLowerCase(Locale.ROOT).trim();
        int semicolon = value.indexOf(';');
        return semicolon < 0 ? value : value.substring(0, semicolon).trim();
    }

    private static String extension(String contentType) {
        return switch (contentType) {
            case "image/jpeg", "image/jpg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            case "image/gif" -> ".gif";
            default -> null;
        };
    }

    /** 응답으로 내려 줄 사진 본문. */
    public record Stored(String contentType, byte[] bytes) {}
}
