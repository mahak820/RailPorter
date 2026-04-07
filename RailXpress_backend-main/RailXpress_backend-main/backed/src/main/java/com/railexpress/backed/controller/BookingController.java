package com.railexpress.backed.controller;

import com.railexpress.backed.dto.BookingRequest;
import com.railexpress.backed.dto.EstimateRequest;
import com.railexpress.backed.model.Booking;
import com.railexpress.backed.service.BookingService;
import com.railexpress.backed.service.FileStorageService;
import com.railexpress.backed.service.EmailService;
import com.railexpress.backed.util.QRGenerator;
import com.google.zxing.WriterException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    private final BookingService bookingService;
    private final FileStorageService fileStorage;
    private final EmailService emailService;

    public BookingController(BookingService bookingService,
                             FileStorageService fileStorage,
                             EmailService emailService) {
        this.bookingService = bookingService;
        this.fileStorage = fileStorage;
        this.emailService = emailService;
    }

    @PostMapping("/estimate")
    public ResponseEntity<?> estimate(@RequestBody EstimateRequest req) {
        return ResponseEntity.ok(bookingService.estimate(req));
    }

    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody BookingRequest req) {
        try {
            Booking created = bookingService.createBooking(req);

            // create QR payload
            Map<String, Object> qrPayload = Map.of(
                    "bookingId", created.getId(),
                    "bookingRef", created.getBookingRef(),
                    "departure", created.getDepartureStation(),
                    "arrival", created.getArrivalStation(),
                    "date", created.getDateOfTransport() != null ? created.getDateOfTransport().toString() : null,
                    "amount", created.getFee()
            );

            byte[] png = null;
            String base64 = null;
            try {
                png = QRGenerator.generateQRCodePngBytesFromMap(qrPayload, 300, 300);
                base64 = Base64.getEncoder().encodeToString(png);
            } catch (Exception qrEx) {
                // If QR generation fails, log and continue — booking was created successfully
                qrEx.printStackTrace();
            }

            // Send confirmation email asynchronously if email provided in request
            try {
                if (req.email != null && !req.email.isBlank()) {
                    // sendBookingConfirmation handles null png (will send body without attachment)
                    emailService.sendBookingConfirmation(req.email, created, png);
                } else {
                    System.out.println("No email provided in booking request; skipping confirmation email.");
                }
            } catch (Exception mailEx) {
                // do not fail booking creation because of mail issues
                System.out.println("Warning: sending booking confirmation failed (email will not block booking).");
                mailEx.printStackTrace();
            }

            // Respond to client with booking and qrBase64 (may be null if qr generation failed)
            return ResponseEntity.ok(Map.of("booking", created, "qrBase64", base64));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "Failed to create booking", "error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/upload")
    public ResponseEntity<?> uploadFiles(@PathVariable String id, @RequestParam("files") List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            return ResponseEntity.badRequest().body("No files sent");
        }
        List<String> stored = files.stream()
                .map(f -> fileStorage.storeFile(f, id))
                .collect(Collectors.toList());
        return ResponseEntity.ok(Map.of("uploaded", stored));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getBooking(@PathVariable String id) {
        Booking b = bookingService.getBooking(id);
        if (b == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(b);
    }

    /**
     * Returns the QR as image/png for a booking id.
     */
    @GetMapping("/{id}/qr")
    public ResponseEntity<byte[]> getBookingQr(@PathVariable String id) {
        try {
            Booking b = bookingService.getBooking(id);
            if (b == null) return ResponseEntity.notFound().build();

            Map<String, Object> qrPayload = Map.of(
                    "bookingId", b.getId(),
                    "bookingRef", b.getBookingRef(),
                    "departure", b.getDepartureStation(),
                    "arrival", b.getArrivalStation(),
                    "date", b.getDateOfTransport() != null ? b.getDateOfTransport().toString() : null,
                    "amount", b.getFee()
            );

            try {
                byte[] png = QRGenerator.generateQRCodePngBytesFromMap(qrPayload, 500, 500);
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.IMAGE_PNG);
                return ResponseEntity.ok().headers(headers).body(png);
            } catch (Exception e) {
                e.printStackTrace();
                return ResponseEntity.status(500).body(null);
            }
        } catch (Exception outer) {
            outer.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }
}
