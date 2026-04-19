package com.railexpress.backed.service;

import com.railexpress.backed.model.Station;
import com.railexpress.backed.repository.StationRepository;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
public class StationService {

    private final StationRepository stationRepository;

    public StationService(StationRepository stationRepository) {
        this.stationRepository = stationRepository;
    }

    public List<Station> search(String q) {
        if (q == null || q.trim().length() < 1) return Collections.emptyList();
        List<Station> results = stationRepository.search(q.trim());
        return results.size() > 20 ? results.subList(0, 20) : results;
    }

    public List<Station> all() {
        return stationRepository.findAll();
    }
}
