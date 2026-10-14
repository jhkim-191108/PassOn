package com.nextshift.web;

import com.nextshift.api.Views.PhotoView;
import com.nextshift.common.AuthPrincipal;
import com.nextshift.service.PhotoService;
import com.nextshift.service.PhotoService.Stored;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/** 인수인계 사진. 목록에는 주소만 있고, 파일은 한 장씩 받는다. */
@RestController
@RequestMapping("/api/handoffs/{handoffId}/photos")
public class PhotoController {
    private final PhotoService photoService;

    public PhotoController(PhotoService photoService) {
        this.photoService = photoService;
    }

    /** 사진 주소 목록을 첨부 순으로 돌려준다. */
    @GetMapping
    public List<PhotoView> list(@PathVariable UUID handoffId) {
        return photoService.list(AuthPrincipal.current(), handoffId);
    }

    /** 사진 한 장을 올린다. 필드 이름은 file이다. */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public PhotoView create(@PathVariable UUID handoffId, @RequestParam("file") MultipartFile file) {
        return photoService.create(AuthPrincipal.current(), handoffId, file);
    }

    /** 사진 파일 한 장을 돌려준다. */
    @GetMapping("/{photoId}")
    public ResponseEntity<byte[]> download(@PathVariable UUID handoffId, @PathVariable UUID photoId) {
        Stored stored = photoService.load(AuthPrincipal.current(), handoffId, photoId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"photo\"")
                .contentType(MediaType.parseMediaType(stored.contentType()))
                .body(stored.bytes());
    }

    /** 확정 전 사진을 지운다. */
    @DeleteMapping("/{photoId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID handoffId, @PathVariable UUID photoId) {
        photoService.delete(AuthPrincipal.current(), handoffId, photoId);
    }
}