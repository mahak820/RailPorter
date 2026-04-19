package com.railexpress.backed.dto;

public class TrainSearchResponse {

    public String trainNo;
    public String trainName;
    public String fromCode;
    public String fromName;
    public String toCode;
    public String toName;
    public String departure;
    public String arrival;

    public TrainSearchResponse() {}

    public TrainSearchResponse(String trainNo, String trainName,
                               String fromCode, String fromName,
                               String toCode, String toName,
                               String departure, String arrival) {
        this.trainNo = trainNo;
        this.trainName = trainName;
        this.fromCode = fromCode;
        this.fromName = fromName;
        this.toCode = toCode;
        this.toName = toName;
        this.departure = departure;
        this.arrival = arrival;
    }
}
