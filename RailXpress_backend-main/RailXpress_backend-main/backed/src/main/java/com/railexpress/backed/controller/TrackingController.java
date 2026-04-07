package com.railexpress.backed.controller;

import com.railexpress.backed.model.Booking;
import com.railexpress.backed.model.StatusUpdate;
import com.railexpress.backed.repository.BookingRepository;
import com.railexpress.backed.repository.StatusUpdateRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/track")
@CrossOrigin(origins = "*")
public class TrackingController {

    private final StatusUpdateRepository statusRepo;
    private final BookingRepository bookingRepo;

    public TrackingController(StatusUpdateRepository statusRepo, BookingRepository bookingRepo) {
        this.statusRepo = statusRepo;
        this.bookingRepo = bookingRepo;
    }

    /**
     * Push a status update. bookingIdOrRef may be an internal UUID or an RX bookingRef.
     */
    @PostMapping("/booking/{bookingIdOrRef}/status")
    public ResponseEntity<?> pushStatus(
            @PathVariable String bookingIdOrRef,
            @RequestBody Map<String, String> body
    ) {
        String status = body.get("status");
        String location = body.getOrDefault("location", "");
        String notes = body.getOrDefault("notes", "");
        if (status == null || status.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "status is required"));
        }

        // Try to resolve the Booking entity by id (UUID) first, then by bookingRef (RX-...)
        Booking booking = null;
        try {
            booking = bookingRepo.findById(bookingIdOrRef).orElse(null);
        } catch (Exception ignored) { }

        if (booking == null) {
            booking = bookingRepo.findByBookingRef(bookingIdOrRef);
        }

        String resolvedBookingId = null;
        String resolvedBookingRef = null;

        if (booking != null) {
            // Found an entity -> use its proper UUID and bookingRef
            resolvedBookingId = booking.getId();
            resolvedBookingRef = booking.getBookingRef();
        } else {
            // No booking entity found -> decide what caller passed
            if (bookingIdOrRef != null && bookingIdOrRef.startsWith("RX-")) {
                resolvedBookingRef = bookingIdOrRef;
            } else {
                resolvedBookingId = bookingIdOrRef;
            }
        }

        StatusUpdate u = new StatusUpdate();
        u.setBookingId(resolvedBookingId);
        u.setBookingRef(resolvedBookingRef);
        u.setStatus(status);
        u.setLocation(location);
        u.setNotes(notes);

        StatusUpdate saved = statusRepo.save(u);

        // If we found the booking entity, update its status too
        if (booking != null) {
            booking.setStatus(status);
            bookingRepo.save(booking);
        }

        return ResponseEntity.ok(saved);
    }

    @GetMapping("/booking/{bookingId}/timeline")
    public ResponseEntity<?> timelineById(@PathVariable String bookingId) {
        List<StatusUpdate> list = statusRepo.findByBookingIdOrderByCreatedAtDesc(bookingId);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/ref/{bookingRef}/timeline")
    public ResponseEntity<?> timelineByRef(@PathVariable String bookingRef) {
        List<StatusUpdate> list = statusRepo.findByBookingRefOrderByCreatedAtDesc(bookingRef);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/ref/{bookingRef}/latest")
    public ResponseEntity<?> latestByRef(@PathVariable String bookingRef) {
        List<StatusUpdate> list = statusRepo.findByBookingRefOrderByCreatedAtDesc(bookingRef);
        if (list == null || list.isEmpty()) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(list.get(0));
    }
}
