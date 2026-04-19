package com.railexpress.backed.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "trains")
public class Train {

    @Id
    @jakarta.persistence.Column(name = "train_no")
    private String trainNo;

    @jakarta.persistence.Column(name = "train_name")
    private String trainName;

    @jakarta.persistence.Column(name = "from_code")
    private String fromCode;

    @jakarta.persistence.Column(name = "to_code")
    private String toCode;

    @jakarta.persistence.Column(name = "departure_time")
    private String departureTime;

    @jakarta.persistence.Column(name = "arrival_time")
    private String arrivalTime;

    public Train() {}

    public Train(String trainNo, String trainName, String fromCode, String toCode,
                 String departureTime, String arrivalTime) {
        this.trainNo = trainNo;
        this.trainName = trainName;
        this.fromCode = fromCode;
        this.toCode = toCode;
        this.departureTime = departureTime;
        this.arrivalTime = arrivalTime;
    }

    public String getTrainNo() { return trainNo; }
    public void setTrainNo(String trainNo) { this.trainNo = trainNo; }

    public String getTrainName() { return trainName; }
    public void setTrainName(String trainName) { this.trainName = trainName; }

    public String getFromCode() { return fromCode; }
    public void setFromCode(String fromCode) { this.fromCode = fromCode; }

    public String getToCode() { return toCode; }
    public void setToCode(String toCode) { this.toCode = toCode; }

    public String getDepartureTime() { return departureTime; }
    public void setDepartureTime(String departureTime) { this.departureTime = departureTime; }

    public String getArrivalTime() { return arrivalTime; }
    public void setArrivalTime(String arrivalTime) { this.arrivalTime = arrivalTime; }
}
