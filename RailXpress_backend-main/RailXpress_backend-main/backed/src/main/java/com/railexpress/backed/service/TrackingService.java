package com.railexpress.backed.service;

import com.railexpress.backed.model.Booking;
import com.railexpress.backed.model.StatusUpdate;
import com.railexpress.backed.repository.BookingRepository;
import com.railexpress.backed.repository.StatusUpdateRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TrackingService {

    private final StatusUpdateRepository statusRepo;
    private final BookingRepository bookingRepo;

    public TrackingService(StatusUpdateRepository statusRepo, BookingRepository bookingRepo){
        this.statusRepo = statusRepo;
        this.bookingRepo = bookingRepo;
    }

    public StatusUpdate pushStatus(String bookingId, String status, String location, String notes){
        Booking b = bookingRepo.findById(bookingId).orElse(null);
        StatusUpdate u = new StatusUpdate();
        u.setBookingId(bookingId);
        u.setBookingRef(b != null ? b.getBookingRef() : null);
        u.setStatus(status);
        u.setLocation(location);
        u.setNotes(notes);
        StatusUpdate saved = statusRepo.save(u);

        // optional: update booking.status and booking.fee/status fields
        if (b != null) {
            b.setStatus(status);
            bookingRepo.save(b);
        }
        return saved;
    }

    public List<StatusUpdate> getStatusTimelineByBookingId(String bookingId){
        return statusRepo.findByBookingIdOrderByCreatedAtDesc(bookingId);
    }

    public List<StatusUpdate> getStatusTimelineByBookingRef(String bookingRef){
        return statusRepo.findByBookingRefOrderByCreatedAtDesc(bookingRef);
    }

    public StatusUpdate getLatestByBookingId(String bookingId){
        List<StatusUpdate> list = getStatusTimelineByBookingId(bookingId);
        return list.isEmpty() ? null : list.get(0);
    }

    public StatusUpdate getLatestByBookingRef(String bookingRef){
        List<StatusUpdate> list = getStatusTimelineByBookingRef(bookingRef);
        return list.isEmpty() ? null : list.get(0);
    }
}
