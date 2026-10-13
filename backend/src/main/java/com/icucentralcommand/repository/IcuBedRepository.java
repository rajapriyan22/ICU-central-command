package com.icucentralcommand.repository;

import com.icucentralcommand.model.IcuBed;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface IcuBedRepository extends JpaRepository<IcuBed, Long> {
    Optional<IcuBed> findByBedNumber(String bedNumber);
    List<IcuBed> findByStatus(String status);
    List<IcuBed> findByWardId(Long wardId);
    
    long countByStatus(String status);

    @Query("SELECT b FROM IcuBed b WHERE " +
           "(:unitType IS NULL OR b.ward.unitType = :unitType) AND " +
           "(:floor IS NULL OR b.ward.floor = :floor) AND " +
           "(:status IS NULL OR b.status = :status) AND " +
           "(:search IS NULL OR LOWER(b.bedNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(b.ward.name) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<IcuBed> filterBeds(@Param("unitType") String unitType,
                            @Param("floor") String floor,
                            @Param("status") String status,
                            @Param("search") String search);
}
