package com.railexpress.backed.controller;

import com.railexpress.backed.model.Station;
import com.railexpress.backed.service.StationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/stations")
@CrossOrigin(origins = "*")
public class StationController {

    private final StationService stationService;

    public StationController(StationService stationService) {
        this.stationService = stationService;
    }

    @GetMapping
    public ResponseEntity<List<Station>> search(@RequestParam(value = "search", required = false) String search) {
        if (search == null || search.isBlank()) {
            return ResponseEntity.ok(stationService.all());
        }
        return ResponseEntity.ok(stationService.search(search));
    }
}
