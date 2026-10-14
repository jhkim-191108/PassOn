package com.nextshift.service;

import com.nextshift.api.Views.PhotoView;
import com.nextshift.common.ApiException;
import com.nextshift.common.AuthPrincipal;
import com.nextshift.domain.Handoff;
import com.nextshift.domain.HandoffPhoto;
import com.nextshift.domain.HandoffStatus;
import com.nextshift.domain.StoreMember;
import com.nextshift.repo.HandoffPhotoRepository;
import com.nextshift.repo.HandoffRepository;
import com.nextshift.security.StoreGuard;
import java.io.IOException;
import java.nio.file.Path;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

/** 인수인계 사진. 파일은 handoffs/{사진ID}에 두고, 목록에는 주소만 돌려준다. */
@Service
public class PhotoService {
    private static final int MAX_PHOTOS = 3;
    private static final int MAX_BYTES = 5 * 1024 * 1024;

    private final HandoffPhotoRepository photoRepository;
    private final HandoffRepository handoffRepository;
    private final StoreGuard guard;
    private final ImageFiles files;

    public PhotoService(
            HandoffPhotoRepository photoRepository,
            HandoffRepository handoffRepository,
            StoreGuard guard,
            ImageFiles files
    ) {
        this.photoRepository = photoRepository;
        this.handoffRepository = handoffRepository;
        this.guard = guard;
        this.files = files;
    }

    /** 그 인수인계의 사진을 첨부 순으로 돌려준다. 파일 본문은 포함하지 않는다. */
    @Transactional(readOnly = true)
    public List<PhotoView> list(AuthPrincipal principal, UUID handoffId) {
        readable(principal, handoffId);
        return photoRepository.findByHandoffIdOrderByPositionAsc(handoffId).stream()
                .map(this::toView)
                .toList();
    }

    /** 사진을 한 장 저장한다. jpeg, png, webp, gif만 되고 5MB 이하, 최대 3장이다. */
    @Transactional
    public PhotoView create(AuthPrincipal principal, UUID handoffId, MultipartFile file) {
        Handoff handoff = editable(principal, handoffId);
        if (photoRepository.countByHandoffId(handoff.getId()) >= MAX_PHOTOS) {
            throw ApiException.conflict("사진은 3장까지 첨부할 수 있습니다.");
        }
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
        int position = photoRepository.findByHandoffIdOrderByPositionAsc(handoff.getId()).stream()
                .mapToInt(HandoffPhoto::getPosition)
                .max()
                .orElse(0) + 1;
        HandoffPhoto photo = new HandoffPhoto();
        photo.setHandoffId(handoff.getId());
        photo.setOriginalName(originalName(file.getOriginalFilename()));
        photo.setContentType(contentType.equals("image/jpg") ? "image/jpeg" : contentType);
        photo.setSizeBytes(bytes.length);
        photo.setPosition(position);
        photoRepository.save(photo);
        try {
            files.write(keyFor(photo), photo.getContentType(), bytes);
        } catch (RuntimeException ex) {
            photoRepository.delete(photo);
            if (ex instanceof IllegalStateException illegal) {
                throw illegal;
            }
            throw new IllegalStateException("사진을 저장하지 못했습니다.", ex);
        }
        return toView(photo);
    }

    /** 사진 파일 한 장을 돌려준다. */
    @Transactional(readOnly = true)
    public Stored load(AuthPrincipal principal, UUID handoffId, UUID photoId) {
        readable(principal, handoffId);
        HandoffPhoto photo = owned(handoffId, photoId);
        byte[] bytes = files.read(keyFor(photo));
        if (bytes == null) {
            throw ApiException.notFound("사진 파일을 찾을 수 없습니다.");
        }
        return new Stored(photo.getContentType(), bytes);
    }

    /** 확정 전 사진을 지운다. */
    @Transactional
    public void delete(AuthPrincipal principal, UUID handoffId, UUID photoId) {
        editable(principal, handoffId);
        HandoffPhoto photo = owned(handoffId, photoId);
        photoRepository.delete(photo);
        files.delete(keyFor(photo));
    }

    /** 인수인계를 실제로 지울 때 사진 행과 파일을 함께 지운다. */
    @Transactional
    public void deleteAll(UUID handoffId) {
        List<HandoffPhoto> photos = photoRepository.findByHandoffIdOrderByPositionAsc(handoffId);
        photoRepository.deleteAll(photos);
        for (HandoffPhoto photo : photos) {
            try {
                files.delete(keyFor(photo));
            } catch (RuntimeException ignored) {
                // 행은 이미 지웠다. 남은 파일은 다음 정리 때 비워도 된다.
            }
        }
    }

    private Handoff readable(AuthPrincipal principal, UUID handoffId) {
        Handoff handoff = handoffRepository.findById(handoffId)
                .orElseThrow(() -> ApiException.notFound("인수인계를 찾을 수 없습니다."));
        if (handoff.getDeletedAt() != null) {
            throw ApiException.notFound("인수인계를 찾을 수 없습니다.");
        }
        guard.requireActiveMember(handoff.getStoreId(), principal.id());
        return handoff;
    }

    private Handoff editable(AuthPrincipal principal, UUID handoffId) {
        Handoff handoff = readable(principal, handoffId);
        StoreMember actor = guard.requireActiveMember(handoff.getStoreId(), principal.id());
        guard.requireAuthored(actor, handoff.getAuthorId());
        if (handoff.getStatus() == HandoffStatus.CONFIRMED) {
            throw ApiException.conflict("확정된 인수인계의 사진은 바꿀 수 없습니다.");
        }
        if (handoff.getStatus() == HandoffStatus.ANALYZING) {
            throw ApiException.conflict("분석 중인 인수인계의 사진은 바꿀 수 없습니다.");
        }
        return handoff;
    }

    private HandoffPhoto owned(UUID handoffId, UUID photoId) {
        HandoffPhoto photo = photoRepository.findById(photoId)
                .orElseThrow(() -> ApiException.notFound("사진을 찾을 수 없습니다."));
        if (!photo.getHandoffId().equals(handoffId)) {
            throw ApiException.notFound("사진을 찾을 수 없습니다.");
        }
        return photo;
    }

    private PhotoView toView(HandoffPhoto photo) {
        return new PhotoView(
                photo.getId(),
                photo.getHandoffId(),
                photo.getOriginalName(),
                photo.getContentType(),
                photo.getSizeBytes(),
                photo.getPosition(),
                "/api/handoffs/" + photo.getHandoffId() + "/photos/" + photo.getId(),
                photo.getCreatedAt()
        );
    }

    private String keyFor(HandoffPhoto photo) {
        return "handoffs/" + photo.getId() + extension(photo.getContentType());
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

    private static String originalName(String name) {
        if (name == null || name.isBlank()) {
            return "photo";
        }
        String fileName = Path.of(name).getFileName().toString().replaceAll("[\\r\\n\"]", "");
        if (fileName.isBlank()) {
            return "photo";
        }
        return fileName.length() <= 200 ? fileName : fileName.substring(0, 200);
    }

    /** 다운로드용 파일 본문. */
    public record Stored(String contentType, byte[] bytes) {}
}