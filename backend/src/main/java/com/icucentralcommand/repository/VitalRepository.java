package com.icucentralcommand.repository;

import com.icucentralcommand.model.Vital;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface VitalRepository extends JpaRepository<Vital, Long> {
    List<Vital> findByPatientIdOrderByRecordedAtDesc(Long patientId);
    Optional<Vital> findFirstByPatientIdOrderByRecordedAtDesc(Long patientId);
}
