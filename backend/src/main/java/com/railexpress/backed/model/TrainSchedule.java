package com.railexpress.backed.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "train_schedules")
public class TrainSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "train_no")
    private String trainNo;

    @Column(name = "station_code")
    private String stationCode;

    @Column(name = "arrival_time")
    private String arrivalTime;

    @Column(name = "departure_time")
    private String departureTime;

    @Column(name = "halt_minutes")
    private Integer haltMinutes;

    @Column(name = "day_no")
    private Integer dayNo;

    @Column(name = "sequence_no")
    private Integer sequenceNo;

    public TrainSchedule() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTrainNo() { return trainNo; }
    public void setTrainNo(String trainNo) { this.trainNo = trainNo; }

    public String getStationCode() { return stationCode; }
    public void setStationCode(String stationCode) { this.stationCode = stationCode; }

    public String getArrivalTime() { return arrivalTime; }
    public void setArrivalTime(String arrivalTime) { this.arrivalTime = arrivalTime; }

    public String getDepartureTime() { return departureTime; }
    public void setDepartureTime(String departureTime) { this.departureTime = departureTime; }

    public Integer getHaltMinutes() { return haltMinutes; }
    public void setHaltMinutes(Integer haltMinutes) { this.haltMinutes = haltMinutes; }

    public Integer getDayNo() { return dayNo; }
    public void setDayNo(Integer dayNo) { this.dayNo = dayNo; }

    public Integer getSequenceNo() { return sequenceNo; }
    public void setSequenceNo(Integer sequenceNo) { this.sequenceNo = sequenceNo; }
}
