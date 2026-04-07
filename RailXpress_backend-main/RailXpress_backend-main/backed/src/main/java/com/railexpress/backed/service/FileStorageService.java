package com.railexpress.backed.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;

@Service
public class FileStorageService {

    private final Path uploadDir;

    public FileStorageService(@Value("${file.upload-dir:uploads}") String uploadDir) {
        this.uploadDir = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.uploadDir);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create upload dir", ex);
        }
    }

    /**
     * Store a single file on disk. Returns stored path as string.
     */
    public String storeFile(MultipartFile file, String bookingId) {
        String filename = StringUtils.cleanPath(file.getOriginalFilename());
        // prefix with booking id to avoid collisions
        String storedName = bookingId + "_" + System.currentTimeMillis() + "_" + filename;
        Path target = this.uploadDir.resolve(storedName);
        try {
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            return target.toString();
        } catch (IOException e) {
            throw new RuntimeException("Could not store file " + filename, e);
        }
    }
}
