package com.railexpress.backed.dto;

public class TrainRouteStop {

    public Integer sequenceNo;
    public String stationCode;
    public String stationName;
    public String arrivalTime;
    public String departureTime;
    public Integer haltMinutes;
    public Integer dayNo;

    public TrainRouteStop() {}

    public TrainRouteStop(Integer sequenceNo, String stationCode, String stationName,
                          String arrivalTime, String departureTime,
                          Integer haltMinutes, Integer dayNo) {
        this.sequenceNo = sequenceNo;
        this.stationCode = stationCode;
        this.stationName = stationName;
        this.arrivalTime = arrivalTime;
        this.departureTime = departureTime;
        this.haltMinutes = haltMinutes;
        this.dayNo = dayNo;
    }
}
