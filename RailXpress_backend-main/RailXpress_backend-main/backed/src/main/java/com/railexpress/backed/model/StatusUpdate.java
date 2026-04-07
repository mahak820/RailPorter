package com.railexpress.backed.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "status_updates")
public class StatusUpdate {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String bookingId;      // foreign id (Booking.id)
    private String bookingRef;     // copy for easy lookup
    private String location;       // free text (e.g., "Mumbai Yard")
    private String status;         // e.g., "IN_TRANSIT", "ARRIVED", "DELIVERED", "PICKED_UP"
    private String notes;          // optional human message, handler info
    private LocalDateTime createdAt;

    public StatusUpdate() {
        this.createdAt = LocalDateTime.now();
    }

    // getters and setters
    public String getId(){return id;}
    public void setId(String id){this.id=id;}
    public String getBookingId(){return bookingId;}
    public void setBookingId(String bookingId){this.bookingId=bookingId;}
    public String getBookingRef(){return bookingRef;}
    public void setBookingRef(String bookingRef){this.bookingRef=bookingRef;}
    public String getLocation(){return location;}
    public void setLocation(String location){this.location=location;}
    public String getStatus(){return status;}
    public void setStatus(String status){this.status=status;}
    public String getNotes(){return notes;}
    public void setNotes(String notes){this.notes=notes;}
    public LocalDateTime getCreatedAt(){return createdAt;}
    public void setCreatedAt(LocalDateTime createdAt){this.createdAt=createdAt;}
}
