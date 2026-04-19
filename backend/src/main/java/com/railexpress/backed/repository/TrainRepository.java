package com.railexpress.backed.repository;

import com.railexpress.backed.model.Train;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TrainRepository extends JpaRepository<Train, String> {

    /**
     * Trains that either:
     *   (a) have :from as their origin and :to as their destination (direct pair), OR
     *   (b) pass through BOTH :from and :to (with :from before :to in the schedule sequence).
     *
     * Case (a) covers the bulk dataset (10k trains without detailed schedules).
     * Case (b) covers trains that have explicit route/halt data seeded in data.sql.
     */
    @Query("SELECT DISTINCT t FROM Train t WHERE " +
           "  (t.fromCode = :from AND t.toCode = :to) " +
           "  OR t.trainNo IN (" +
           "    SELECT s1.trainNo FROM TrainSchedule s1, TrainSchedule s2 " +
           "    WHERE s1.trainNo = s2.trainNo " +
           "      AND s1.stationCode = :from " +
           "      AND s2.stationCode = :to " +
           "      AND s1.sequenceNo < s2.sequenceNo " +
           "  ) " +
           "ORDER BY t.trainNo")
    List<Train> findTrainsBetween(@Param("from") String from, @Param("to") String to);
}
