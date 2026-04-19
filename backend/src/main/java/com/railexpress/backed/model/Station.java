package com.railexpress.backed.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "stations")
public class Station {

    @Id
    private String code;

    private String name;

    private String state;

    public Station() {}

    public Station(String code, String name, String state) {
        this.code = code;
        this.name = name;
        this.state = state;
    }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
}
