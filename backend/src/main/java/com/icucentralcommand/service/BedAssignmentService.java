package com.icucentralcommand.service;

import com.icucentralcommand.dto.BedAssignmentRequestDTO;
import com.icucentralcommand.exception.BedOccupiedException;
import com.icucentralcommand.exception.InvalidAssignmentException;
import com.icucentralcommand.exception.ResourceNotFoundException;
import com.icucentralcommand.model.Alert;
import com.icucentralcommand.model.BedAssignment;
import com.icucentralcommand.model.IcuBed;
import com.icucentralcommand.model.Patient;
import com.icucentralcommand.repository.AlertRepository;
import com.icucentralcommand.repository.BedAssignmentRepository;
import com.icucentralcommand.repository.IcuBedRepository;
import com.icucentralcommand.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BedAssignmentService {

    private final BedAssignmentRepository bedAssignmentRepository;
    private final IcuBedRepository bedRepository;
    private final PatientRepository patientRepository;
    private final AlertRepository alertRepository;

    @Transactional
    public BedAssignment assignBed(BedAssignmentRequestDTO request) {
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id " + request.getPatientId()));

        IcuBed bed = bedRepository.findById(request.getBedId())
                .orElseThrow(() -> new ResourceNotFoundException("Bed not found with id " + request.getBedId()));

        if ("OCCUPIED".equalsIgnoreCase(bed.getStatus())) {
            throw new BedOccupiedException("Bed " + bed.getBedNumber() + " is currently occupied!");
        }

        if ("MAINTENANCE".equalsIgnoreCase(bed.getStatus())) {
            throw new InvalidAssignmentException("Bed " + bed.getBedNumber() + " is under maintenance and cannot be assigned.");
        }

        // Check if patient already has active assignment
        Optional<BedAssignment> existingOpt = bedAssignmentRepository.findByPatientIdAndStatus(patient.getId(), "ACTIVE");
        if (existingOpt.isPresent()) {
            BedAssignment prev = existingOpt.get();
            prev.setStatus("TRANSFERRED");
            prev.setReleasedAt(LocalDateTime.now());
            bedAssignmentRepository.save(prev);

            // Release previous bed
            IcuBed prevBed = prev.getBed();
            prevBed.setStatus("CLEANING");
            prevBed.setCleaningEstMinutes(30);
            bedRepository.save(prevBed);
        }

        // Update bed status to OCCUPIED
        bed.setStatus("OCCUPIED");
        bed.setCleaningEstMinutes(0);
        if (request.getNotes() != null) {
            bed.setNotes(request.getNotes());
        }
        bedRepository.save(bed);

        // Create assignment record
        BedAssignment assignment = BedAssignment.builder()
                .patient(patient)
                .bed(bed)
                .assignedAt(LocalDateTime.now())
                .status("ACTIVE")
                .notes(request.getNotes() != null ? request.getNotes() : "Assigned via ICU Central Command")
                .build();

        BedAssignment saved = bedAssignmentRepository.save(assignment);

        // Record audit alert
        Alert alert = Alert.builder()
                .title("Bed assigned")
                .description(patient.getName() + " assigned to " + bed.getBedNumber())
                .category("INFORMATION")
                .timestamp(LocalDateTime.now())
                .isRead(false)
                .bed(bed)
                .patient(patient)
                .build();
        alertRepository.save(alert);

        return saved;
    }

    @Transactional
    public BedAssignment releaseBed(Long assignmentId, String targetBedStatus) {
        BedAssignment assignment = bedAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found with id " + assignmentId));

        assignment.setStatus("RELEASED");
        assignment.setReleasedAt(LocalDateTime.now());
        bedAssignmentRepository.save(assignment);

        IcuBed bed = assignment.getBed();
        String nextStatus = (targetBedStatus != null && !targetBedStatus.isBlank()) ? targetBedStatus.toUpperCase() : "CLEANING";
        bed.setStatus(nextStatus);
        if ("CLEANING".equals(nextStatus)) {
            bed.setCleaningEstMinutes(30);
        } else {
            bed.setCleaningEstMinutes(0);
        }
        bedRepository.save(bed);

        // Record audit alert
        Alert alert = Alert.builder()
                .title("Bed released")
                .description(assignment.getPatient().getName() + " released from " + bed.getBedNumber())
                .category("INFORMATION")
                .timestamp(LocalDateTime.now())
                .isRead(false)
                .bed(bed)
                .patient(assignment.getPatient())
                .build();
        alertRepository.save(alert);

        return assignment;
    }

    @Transactional
    public BedAssignment releaseBedByBedId(Long bedId, String targetBedStatus) {
        BedAssignment assignment = bedAssignmentRepository.findByBedIdAndStatus(bedId, "ACTIVE")
                .orElseThrow(() -> new ResourceNotFoundException("No active assignment found for bed id " + bedId));

        return releaseBed(assignment.getId(), targetBedStatus);
    }

    public List<BedAssignment> getActiveAssignments() {
        return bedAssignmentRepository.findByStatus("ACTIVE");
    }
}
