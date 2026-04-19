package com.railexpress.backed.service;

import com.railexpress.backed.dto.BookingRequest;
import com.railexpress.backed.dto.EstimateRequest;
import com.railexpress.backed.model.Booking;
import com.railexpress.backed.repository.BookingRepository;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;

    public BookingService(BookingRepository bookingRepository){
        this.bookingRepository = bookingRepository;
    }

    public Booking createBooking(BookingRequest req){
        Booking b = new Booking();
        b.setBookingRef("RX-" + UUID.randomUUID().toString().substring(0,8).toUpperCase());
        b.setDepartureStation(req.departureStation);
        b.setArrivalStation(req.arrivalStation);

        // parse date string dd-MM-yyyy into LocalDate
        try {
            if (req.dateOfTransport != null && !req.dateOfTransport.isBlank()) {
                java.time.format.DateTimeFormatter fmt = java.time.format.DateTimeFormatter.ofPattern("dd-MM-yyyy");
                b.setDateOfTransport(java.time.LocalDate.parse(req.dateOfTransport, fmt));
            }
        } catch (Exception ex) {
            // ignore parse error for now — controller/validation can handle later
            b.setDateOfTransport(null);
        }

        b.setLuggageTypeId(req.luggageTypeId);
        b.setWeightKg(req.weightKg);
        b.setLengthCm(req.lengthCm);
        b.setWidthCm(req.widthCm);
        b.setHeightCm(req.heightCm);
        b.setIsFragile(Boolean.TRUE.equals(req.isFragile));
        b.setContainsBattery(Boolean.TRUE.equals(req.containsBattery));
        b.setContainsLiquids(Boolean.TRUE.equals(req.containsLiquids));
        b.setContainsRestrictedItems(Boolean.TRUE.equals(req.containsRestrictedItems));
        b.setDeclaration(req.declaration);
        b.setStatus("CREATED");

        b.setTrainNo(req.trainNo);
        b.setTrainName(req.trainName);
        b.setTrainDepartureTime(req.trainDepartureTime);
        b.setEmail(req.email);

        // simple fee calc (same as frontend mock)
        double base = 50;
        double weightFactor = (req.weightKg != null ? req.weightKg * 10 : 0);
        double distanceFactor = 30;
        double total = base + weightFactor + distanceFactor;
        b.setFee(total);

        return bookingRepository.save(b);
    }

    public Booking getBooking(String id){
        return bookingRepository.findById(id).orElse(null);
    }

    public Object estimate(EstimateRequest r){
        double base = 50;
        double weightFactor = (r.weightKg != null ? r.weightKg * 10 : 0);
        double distanceFactor = 30;
        return new Object(){
            public final double total = base + weightFactor + distanceFactor;
            public final java.util.Map<String,Double> breakdown = new java.util.HashMap<>() {{
                put("base", base);
                put("weightFactor", weightFactor);
                put("distanceFactor", distanceFactor);
            }};
        };
    }
}
