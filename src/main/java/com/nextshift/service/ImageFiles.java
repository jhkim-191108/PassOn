package com.nextshift.service;

import com.google.cloud.storage.Blob;
import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/** 사진 파일. 버킷 이름이 있으면 Cloud Storage에 두고, 없으면 upload-dir에 둔다. */
@Service
public class ImageFiles {
    private final Path root;
    private final String bucket;
    private final Storage storage;

    public ImageFiles(
            @Value("${nextshift.upload-dir:uploads}") String uploadDir,
            @Value("${nextshift.storage.bucket:}") String bucket
    ) {
        this.root = Path.of(uploadDir).toAbsolutePath().normalize();
        this.bucket = bucket == null ? "" : bucket.trim();
        this.storage = this.bucket.isEmpty() ? null : StorageOptions.getDefaultInstance().getService();
    }

    /** 같은 이름의 파일이 있으면 덮어쓴다. */
    public void write(String key, String contentType, byte[] bytes) {
        if (storage == null) {
            writeDisk(key, bytes);
            return;
        }
        try {
            BlobInfo info = BlobInfo.newBuilder(BlobId.of(bucket, key))
                    .setContentType(contentType)
                    .build();
            storage.create(info, bytes);
        } catch (RuntimeException ex) {
            throw new IllegalStateException("사진을 저장하지 못했습니다.", ex);
        }
    }

    /** 없으면 null. */
    public byte[] read(String key) {
        if (storage == null) {
            return readDisk(key);
        }
        try {
            Blob blob = storage.get(BlobId.of(bucket, key));
            if (blob == null) {
                return null;
            }
            return blob.getContent();
        } catch (RuntimeException ex) {
            throw new IllegalStateException("사진을 읽지 못했습니다.", ex);
        }
    }

    public boolean exists(String key) {
        if (storage == null) {
            return Files.exists(path(key));
        }
        try {
            return storage.get(BlobId.of(bucket, key)) != null;
        } catch (RuntimeException ex) {
            throw new IllegalStateException("사진을 확인하지 못했습니다.", ex);
        }
    }

    /** 없어도 그냥 끝낸다. */
    public void delete(String key) {
        if (storage == null) {
            try {
                Files.deleteIfExists(path(key));
            } catch (IOException ex) {
                throw new IllegalStateException("사진을 지우지 못했습니다.", ex);
            }
            return;
        }
        try {
            storage.delete(BlobId.of(bucket, key));
        } catch (RuntimeException ex) {
            throw new IllegalStateException("사진을 지우지 못했습니다.", ex);
        }
    }

    private void writeDisk(String key, byte[] bytes) {
        Path path = path(key);
        try {
            Files.createDirectories(path.getParent());
            Files.write(path, bytes);
        } catch (IOException ex) {
            throw new IllegalStateException("사진을 저장하지 못했습니다.", ex);
        }
    }

    private byte[] readDisk(String key) {
        Path path = path(key);
        if (!Files.exists(path)) {
            return null;
        }
        try {
            return Files.readAllBytes(path);
        } catch (IOException ex) {
            throw new IllegalStateException("사진을 읽지 못했습니다.", ex);
        }
    }

    private Path path(String key) {
        Path path = root.resolve(key).normalize();
        if (!path.startsWith(root)) {
            throw new IllegalStateException("사진을 저장하지 못했습니다.");
        }
        return path;
    }
}
