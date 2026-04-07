package com.railexpress.backed.repository;

import com.railexpress.backed.model.StatusUpdate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StatusUpdateRepository extends JpaRepository<StatusUpdate, String> {
    List<StatusUpdate> findByBookingIdOrderByCreatedAtDesc(String bookingId);
    List<StatusUpdate> findByBookingRefOrderByCreatedAtDesc(String bookingRef);
}
