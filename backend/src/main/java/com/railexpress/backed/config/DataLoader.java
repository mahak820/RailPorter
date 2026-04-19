package com.railexpress.backed.config;

import com.fasterxml.jackson.core.JsonFactory;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonToken;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Loads the full Indian Railways dataset (stations + trains) from JSON resources
 * into H2 on first startup. Skips if data is already present.
 *
 * Data source: https://github.com/datameet/railways (CC0)
 */
@Component
public class DataLoader implements CommandLineRunner {

    private final JdbcTemplate jdbc;
    private final ObjectMapper mapper = new ObjectMapper();

    public DataLoader(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public void run(String... args) throws Exception {
        long t0 = System.currentTimeMillis();

        Long stationCount = jdbc.queryForObject("SELECT COUNT(*) FROM stations", Long.class);
        if (stationCount == null || stationCount <= 500) {
            System.out.println("[DataLoader] Importing stations from data/stations.json ...");
            int s = loadStations();
            System.out.println("[DataLoader] Inserted " + s + " stations");
        } else {
            System.out.println("[DataLoader] Stations already populated (" + stationCount + "). Skipping.");
        }

        Long trainCount = jdbc.queryForObject("SELECT COUNT(*) FROM trains", Long.class);
        if (trainCount == null || trainCount <= 500) {
            System.out.println("[DataLoader] Importing trains from data/trains.json ...");
            int t = loadTrains();
            System.out.println("[DataLoader] Inserted " + t + " trains");
        } else {
            System.out.println("[DataLoader] Trains already populated (" + trainCount + "). Skipping.");
        }

        Long scheduleCount = jdbc.queryForObject("SELECT COUNT(*) FROM train_schedules", Long.class);
        if (scheduleCount == null || scheduleCount <= 5000) {
            System.out.println("[DataLoader] Importing schedules from data/schedules.json (streaming) ...");
            int sc = loadSchedules();
            System.out.println("[DataLoader] Inserted " + sc + " schedule stops");
        } else {
            System.out.println("[DataLoader] Schedules already populated (" + scheduleCount + "). Skipping.");
        }

        ensureIndexes();

        long elapsed = (System.currentTimeMillis() - t0) / 1000;
        System.out.println("[DataLoader] Dataset import complete in " + elapsed + "s");
    }

    /**
     * Creates indexes needed for fast train search. Idempotent (IF NOT EXISTS).
     * Without these, the schedule self-join against 417k rows takes several seconds
     * per query; with them it drops to tens of milliseconds.
     */
    private void ensureIndexes() {
        System.out.println("[DataLoader] Ensuring search indexes exist ...");
        jdbc.execute("CREATE INDEX IF NOT EXISTS idx_sched_station ON train_schedules(station_code)");
        jdbc.execute("CREATE INDEX IF NOT EXISTS idx_sched_train ON train_schedules(train_no)");
        jdbc.execute("CREATE INDEX IF NOT EXISTS idx_sched_train_seq ON train_schedules(train_no, sequence_no)");
        jdbc.execute("CREATE INDEX IF NOT EXISTS idx_sched_station_train ON train_schedules(station_code, train_no, sequence_no)");
        jdbc.execute("CREATE INDEX IF NOT EXISTS idx_trains_route ON trains(from_code, to_code)");
        jdbc.execute("CREATE INDEX IF NOT EXISTS idx_stations_name ON stations(name)");
    }

    private int loadStations() throws Exception {
        try (InputStream is = new ClassPathResource("data/stations.json").getInputStream()) {
            JsonNode root = mapper.readTree(is);
            JsonNode features = root.get("features");

            List<Object[]> rows = new ArrayList<>();
            Set<String> seen = new HashSet<>();

            for (JsonNode f : features) {
                JsonNode props = f.get("properties");
                if (props == null) continue;
                String code = textOrNull(props, "code");
                String name = textOrNull(props, "name");
                String state = textOrNull(props, "state");
                if (code == null || name == null || code.isBlank() || name.isBlank()) continue;
                if (code.startsWith("XX-")) continue; // skip placeholder codes in dataset
                if (!seen.add(code)) continue;
                rows.add(new Object[]{code, name, state});
            }

            String sql = "MERGE INTO stations (code, name, state) KEY(code) VALUES (?, ?, ?)";
            jdbc.batchUpdate(sql, rows);
            return rows.size();
        }
    }

    private int loadTrains() throws Exception {
        try (InputStream is = new ClassPathResource("data/trains.json").getInputStream()) {
            JsonNode root = mapper.readTree(is);
            JsonNode features = root.get("features");

            List<Object[]> rows = new ArrayList<>();
            Set<String> seen = new HashSet<>();

            for (JsonNode f : features) {
                JsonNode props = f.get("properties");
                if (props == null) continue;
                String number = textOrNull(props, "number");
                String name = textOrNull(props, "name");
                String fromCode = textOrNull(props, "from_station_code");
                String toCode = textOrNull(props, "to_station_code");
                String dep = truncTime(textOrNull(props, "departure"));
                String arr = truncTime(textOrNull(props, "arrival"));

                if (number == null || number.isBlank()) continue;
                if (fromCode == null || toCode == null) continue;
                if (!seen.add(number)) continue;
                rows.add(new Object[]{number, name, fromCode, toCode, dep, arr});
            }

            String sql = "MERGE INTO trains (train_no, train_name, from_code, to_code, departure_time, arrival_time) " +
                         "KEY(train_no) VALUES (?, ?, ?, ?, ?, ?)";
            jdbc.batchUpdate(sql, rows);
            return rows.size();
        }
    }

    /**
     * Streams schedules.json (82 MB, ~500k records), groups halts by train,
     * sorts each train's halts by (day, departure/arrival time) to assign
     * sequence_no, and batch-inserts everything into train_schedules.
     */
    private int loadSchedules() throws Exception {
        Map<String, List<Object[]>> byTrain = new HashMap<>();

        JsonFactory factory = new JsonFactory();
        try (InputStream is = new ClassPathResource("data/schedules.json").getInputStream();
             JsonParser parser = factory.createParser(is)) {

            if (parser.nextToken() != JsonToken.START_ARRAY) {
                throw new IllegalStateException("Expected top-level array in schedules.json");
            }

            while (parser.nextToken() == JsonToken.START_OBJECT) {
                String trainNo = null, stationCode = null, arrival = null, departure = null;
                int day = 1;

                while (parser.nextToken() != JsonToken.END_OBJECT) {
                    String field = parser.currentName();
                    parser.nextToken(); // advance to the value token
                    if (field == null) continue;
                    switch (field) {
                        case "train_number": trainNo = parser.getValueAsString(); break;
                        case "station_code": stationCode = parser.getValueAsString(); break;
                        case "arrival":      arrival = parser.getValueAsString(); break;
                        case "departure":    departure = parser.getValueAsString(); break;
                        case "day":          day = parser.getValueAsInt(1); break;
                        default:             parser.skipChildren();
                    }
                }

                if (trainNo == null || stationCode == null || trainNo.isBlank() || stationCode.isBlank()) {
                    continue;
                }

                String arr = truncTime(arrival);
                String dep = truncTime(departure);
                int haltMin = computeHalt(arr, dep);

                byTrain.computeIfAbsent(trainNo, k -> new ArrayList<>())
                       .add(new Object[]{stationCode, arr, dep, haltMin, day});
            }
        }

        // Sort each train's halts and assign sequence numbers
        List<Object[]> rows = new ArrayList<>(byTrain.size() * 10);
        Comparator<Object[]> halt_cmp = (a, b) -> {
            int da = (int) a[4], db = (int) b[4];
            if (da != db) return Integer.compare(da, db);
            String ta = (String) a[2]; // departure
            if (ta == null) ta = (String) a[1]; // fall back to arrival
            if (ta == null) ta = "00:00";
            String tb = (String) b[2];
            if (tb == null) tb = (String) b[1];
            if (tb == null) tb = "00:00";
            return ta.compareTo(tb);
        };

        for (Map.Entry<String, List<Object[]>> entry : byTrain.entrySet()) {
            String trainNo = entry.getKey();
            List<Object[]> stops = entry.getValue();
            stops.sort(halt_cmp);
            int seq = 1;
            for (Object[] stop : stops) {
                rows.add(new Object[]{
                        trainNo,
                        stop[0],  // station_code
                        stop[1],  // arrival
                        stop[2],  // departure
                        stop[3],  // halt_minutes
                        stop[4],  // day_no
                        seq++     // sequence_no
                });
            }
        }

        String sql = "INSERT INTO train_schedules " +
                     "(train_no, station_code, arrival_time, departure_time, halt_minutes, day_no, sequence_no) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?)";

        // Insert in chunks of 5000 to keep transaction size reasonable
        final int CHUNK = 5000;
        for (int i = 0; i < rows.size(); i += CHUNK) {
            List<Object[]> slice = rows.subList(i, Math.min(i + CHUNK, rows.size()));
            jdbc.batchUpdate(sql, slice);
        }
        return rows.size();
    }

    private static int computeHalt(String arrival, String departure) {
        if (arrival == null || departure == null) return 0;
        try {
            int ah = Integer.parseInt(arrival.substring(0, 2));
            int am = Integer.parseInt(arrival.substring(3, 5));
            int dh = Integer.parseInt(departure.substring(0, 2));
            int dm = Integer.parseInt(departure.substring(3, 5));
            int diff = (dh * 60 + dm) - (ah * 60 + am);
            if (diff < 0) diff += 24 * 60;
            return diff;
        } catch (Exception e) {
            return 0;
        }
    }

    private static String textOrNull(JsonNode node, String field) {
        JsonNode v = node.get(field);
        if (v == null || v.isNull()) return null;
        String s = v.asText();
        return (s == null || s.isEmpty()) ? null : s;
    }

    private static String truncTime(String t) {
        if (t == null) return null;
        if ("None".equalsIgnoreCase(t)) return null;
        return t.length() >= 5 ? t.substring(0, 5) : t;
    }
}
