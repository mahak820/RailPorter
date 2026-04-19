package com.railexpress.backed.controller;

import com.railexpress.backed.dto.TrainRouteStop;
import com.railexpress.backed.dto.TrainSearchResponse;
import com.railexpress.backed.model.Train;
import com.railexpress.backed.service.TrainService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class TrainController {

    private final TrainService trainService;

    public TrainController(TrainService trainService) {
        this.trainService = trainService;
    }

    // #1 Train Search: GET /api/trains?from=NDLS&to=BPL&date=2026-04-20
    @GetMapping("/trains")
    public ResponseEntity<?> searchTrains(@RequestParam("from") String from,
                                          @RequestParam("to") String to,
                                          @RequestParam(value = "date", required = false) String date) {
        if (from == null || from.isBlank() || to == null || to.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "from and to are required"));
        }
        List<TrainSearchResponse> trains = trainService.searchTrains(from, to);
        java.util.Map<String, Object> body = new java.util.HashMap<>();
        body.put("from", from.toUpperCase());
        body.put("to", to.toUpperCase());
        body.put("date", date); // may be null — HashMap allows null values
        body.put("count", trains.size());
        body.put("trains", trains);
        return ResponseEntity.ok(body);
    }

    // #2 Train Route / Halt: GET /api/train/12919/route
    @GetMapping("/train/{trainNo}/route")
    public ResponseEntity<?> getRoute(@PathVariable("trainNo") String trainNo) {
        Train train = trainService.getTrain(trainNo);
        if (train == null) {
            return ResponseEntity.status(404).body(Map.of("message", "Train not found: " + trainNo));
        }
        List<TrainRouteStop> route = trainService.getRoute(trainNo);
        return ResponseEntity.ok(Map.of(
                "trainNo", train.getTrainNo(),
                "trainName", train.getTrainName(),
                "stops", route
        ));
    }
}
