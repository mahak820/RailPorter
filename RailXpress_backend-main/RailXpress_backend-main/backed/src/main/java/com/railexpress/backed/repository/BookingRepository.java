package com.railexpress.backed.repository;

import com.railexpress.backed.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingRepository extends JpaRepository<Booking, String> {
    Booking findByBookingRef(String bookingRef);
}
