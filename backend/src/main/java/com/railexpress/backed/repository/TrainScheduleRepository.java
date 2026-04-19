package com.railexpress.backed.repository;

import com.railexpress.backed.model.TrainSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TrainScheduleRepository extends JpaRepository<TrainSchedule, Long> {

    List<TrainSchedule> findByTrainNoOrderBySequenceNoAsc(String trainNo);
}
