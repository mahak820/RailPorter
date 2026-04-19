package com.railexpress.backed.service;

import com.railexpress.backed.dto.TrainRouteStop;
import com.railexpress.backed.dto.TrainSearchResponse;
import com.railexpress.backed.model.Station;
import com.railexpress.backed.model.Train;
import com.railexpress.backed.model.TrainSchedule;
import com.railexpress.backed.repository.StationRepository;
import com.railexpress.backed.repository.TrainRepository;
import com.railexpress.backed.repository.TrainScheduleRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class TrainService {

    private final TrainRepository trainRepository;
    private final TrainScheduleRepository scheduleRepository;
    private final StationRepository stationRepository;

    public TrainService(TrainRepository trainRepository,
                        TrainScheduleRepository scheduleRepository,
                        StationRepository stationRepository) {
        this.trainRepository = trainRepository;
        this.scheduleRepository = scheduleRepository;
        this.stationRepository = stationRepository;
    }

    public List<TrainSearchResponse> searchTrains(String from, String to) {
        String fromUp = from == null ? null : from.trim().toUpperCase();
        String toUp = to == null ? null : to.trim().toUpperCase();
        List<Train> trains = trainRepository.findTrainsBetween(fromUp, toUp);
        Map<String, String> stationNames = loadStationNameMap();

        List<TrainSearchResponse> out = new ArrayList<>();
        for (Train t : trains) {
            out.add(new TrainSearchResponse(
                    t.getTrainNo(),
                    t.getTrainName(),
                    t.getFromCode(),
                    stationNames.getOrDefault(t.getFromCode(), t.getFromCode()),
                    t.getToCode(),
                    stationNames.getOrDefault(t.getToCode(), t.getToCode()),
                    t.getDepartureTime(),
                    t.getArrivalTime()
            ));
        }
        return out;
    }

    public List<TrainRouteStop> getRoute(String trainNo) {
        List<TrainSchedule> stops = scheduleRepository.findByTrainNoOrderBySequenceNoAsc(trainNo);
        Map<String, String> stationNames = loadStationNameMap();

        List<TrainRouteStop> out = new ArrayList<>();

        if (!stops.isEmpty()) {
            for (TrainSchedule s : stops) {
                out.add(new TrainRouteStop(
                        s.getSequenceNo(),
                        s.getStationCode(),
                        stationNames.getOrDefault(s.getStationCode(), s.getStationCode()),
                        s.getArrivalTime(),
                        s.getDepartureTime(),
                        s.getHaltMinutes(),
                        s.getDayNo()
                ));
            }
            return out;
        }

        // Fallback for trains loaded from the bulk JSON dataset (no halt data).
        // Return the origin + destination as a 2-stop route.
        Train t = trainRepository.findById(trainNo).orElse(null);
        if (t == null) return out;
        out.add(new TrainRouteStop(
                1,
                t.getFromCode(),
                stationNames.getOrDefault(t.getFromCode(), t.getFromCode()),
                null,
                t.getDepartureTime(),
                0,
                1
        ));
        out.add(new TrainRouteStop(
                2,
                t.getToCode(),
                stationNames.getOrDefault(t.getToCode(), t.getToCode()),
                t.getArrivalTime(),
                null,
                0,
                1
        ));
        return out;
    }

    public Train getTrain(String trainNo) {
        return trainRepository.findById(trainNo).orElse(null);
    }

    private Map<String, String> loadStationNameMap() {
        Map<String, String> map = new HashMap<>();
        for (Station s : stationRepository.findAll()) {
            map.put(s.getCode(), s.getName());
        }
        return map;
    }
}
