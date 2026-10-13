package com.icucentralcommand.repository;

import com.icucentralcommand.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PatientRepository extends JpaRepository<Patient, Long> {
    Optional<Patient> findByPatientId(String patientId);
    List<Patient> findByConditionStatus(String conditionStatus);

    long countByConditionStatus(String conditionStatus);

    @Query("SELECT p FROM Patient p WHERE " +
           "(:status IS NULL OR p.conditionStatus = :status) AND " +
           "(:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.patientId) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.diagnosis) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Patient> filterPatients(@Param("status") String status, @Param("search") String search);
}
