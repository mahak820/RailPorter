package com.railexpress.backed.repository;

import com.railexpress.backed.model.Station;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface StationRepository extends JpaRepository<Station, String> {

    @Query("SELECT s FROM Station s " +
           "WHERE LOWER(s.name) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "   OR LOWER(s.code) LIKE LOWER(CONCAT(:q, '%')) " +
           "ORDER BY " +
           "  CASE WHEN LOWER(s.code) = LOWER(:q) THEN 0 " +
           "       WHEN LOWER(s.code) LIKE LOWER(CONCAT(:q, '%')) THEN 1 " +
           "       WHEN LOWER(s.name) LIKE LOWER(CONCAT(:q, '%')) THEN 2 " +
           "       ELSE 3 END, " +
           "  s.name")
    List<Station> search(@Param("q") String q);
}
