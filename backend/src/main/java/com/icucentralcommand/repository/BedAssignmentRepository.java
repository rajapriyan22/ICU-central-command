package com.icucentralcommand.repository;

import com.icucentralcommand.model.BedAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface BedAssignmentRepository extends JpaRepository<BedAssignment, Long> {
    Optional<BedAssignment> findByPatientIdAndStatus(Long patientId, String status);
    Optional<BedAssignment> findByBedIdAndStatus(Long bedId, String status);
    List<BedAssignment> findByStatus(String status);
}
