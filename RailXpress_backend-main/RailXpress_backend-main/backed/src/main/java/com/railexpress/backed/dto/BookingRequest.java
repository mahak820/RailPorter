package com.railexpress.backed.dto;

public class BookingRequest {
    public String departureStation;
    public String arrivalStation;
    public String dateOfTransport;     // dd-MM-yyyy expected
    public String luggageTypeId;
    public Double weightKg;
    public Integer lengthCm;
    public Integer widthCm;
    public Integer heightCm;
    public Boolean isFragile;
    public Boolean containsBattery;
    public Boolean containsLiquids;
    public Boolean containsRestrictedItems;
    public String declaration;
    public String description;
    public String email;

    // optionally add getters/setters or use public fields for simplicity
}
