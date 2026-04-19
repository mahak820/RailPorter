package com.railexpress.backed.model;


import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String bookingRef;
    private String departureStation;
    private String arrivalStation;

    @JsonFormat(pattern = "dd-MM-yyyy")
    private LocalDate dateOfTransport; // stores and returns as dd-MM-yyyy

    private String luggageTypeId;
    private Double weightKg;
    private Integer lengthCm;
    private Integer widthCm;
    private Integer heightCm;
    private Boolean isFragile;
    private Boolean containsBattery;
    private Boolean containsLiquids;
    private Boolean containsRestrictedItems;

    @Column(length = 2000)
    private String declaration;

    private String status;
    private Double fee;

    private String trainNo;
    private String trainName;
    private String trainDepartureTime;

    private String email;

    private LocalDateTime createdAt;

    public Booking() {
        this.createdAt = LocalDateTime.now();
        this.status = "CREATED";
    }

    // Getters & Setters

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getBookingRef() {
        return bookingRef;
    }

    public void setBookingRef(String bookingRef) {
        this.bookingRef = bookingRef;
    }

    public String getDepartureStation() {
        return departureStation;
    }

    public void setDepartureStation(String departureStation) {
        this.departureStation = departureStation;
    }

    public String getArrivalStation() {
        return arrivalStation;
    }

    public void setArrivalStation(String arrivalStation) {
        this.arrivalStation = arrivalStation;
    }

    public LocalDate getDateOfTransport() {
        return dateOfTransport;
    }

    public void setDateOfTransport(LocalDate dateOfTransport) {
        this.dateOfTransport = dateOfTransport;
    }

    public String getLuggageTypeId() {
        return luggageTypeId;
    }

    public void setLuggageTypeId(String luggageTypeId) {
        this.luggageTypeId = luggageTypeId;
    }

    public Double getWeightKg() {
        return weightKg;
    }

    public void setWeightKg(Double weightKg) {
        this.weightKg = weightKg;
    }

    public Integer getLengthCm() {
        return lengthCm;
    }

    public void setLengthCm(Integer lengthCm) {
        this.lengthCm = lengthCm;
    }

    public Integer getWidthCm() {
        return widthCm;
    }

    public void setWidthCm(Integer widthCm) {
        this.widthCm = widthCm;
    }

    public Integer getHeightCm() {
        return heightCm;
    }

    public void setHeightCm(Integer heightCm) {
        this.heightCm = heightCm;
    }

    public Boolean getIsFragile() {
        return isFragile;
    }

    public void setIsFragile(Boolean isFragile) {
        this.isFragile = isFragile;
    }

    public Boolean getContainsBattery() {
        return containsBattery;
    }

    public void setContainsBattery(Boolean containsBattery) {
        this.containsBattery = containsBattery;
    }

    public Boolean getContainsLiquids() {
        return containsLiquids;
    }

    public void setContainsLiquids(Boolean containsLiquids) {
        this.containsLiquids = containsLiquids;
    }

    public Boolean getContainsRestrictedItems() {
        return containsRestrictedItems;
    }

    public void setContainsRestrictedItems(Boolean containsRestrictedItems) {
        this.containsRestrictedItems = containsRestrictedItems;
    }

    public String getDeclaration() {
        return declaration;
    }

    public void setDeclaration(String declaration) {
        this.declaration = declaration;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Double getFee() {
        return fee;
    }

    public void setFee(Double fee) {
        this.fee = fee;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getTrainNo() { return trainNo; }
    public void setTrainNo(String trainNo) { this.trainNo = trainNo; }

    public String getTrainName() { return trainName; }
    public void setTrainName(String trainName) { this.trainName = trainName; }

    public String getTrainDepartureTime() { return trainDepartureTime; }
    public void setTrainDepartureTime(String trainDepartureTime) { this.trainDepartureTime = trainDepartureTime; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
