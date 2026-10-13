package com.icucentralcommand.service;

import com.icucentralcommand.exception.ResourceNotFoundException;
import com.icucentralcommand.model.BedAssignment;
import com.icucentralcommand.model.Doctor;
import com.icucentralcommand.model.Patient;
import com.icucentralcommand.repository.BedAssignmentRepository;
import com.icucentralcommand.repository.DoctorRepository;
import com.icucentralcommand.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final BedAssignmentRepository bedAssignmentRepository;

    public List<Patient> getAllPatients(String status, String search) {
        String cleanStatus = (status != null && !status.isBlank() && !status.equalsIgnoreCase("ALL")) ? status : null;
        String cleanSearch = (search != null && !search.isBlank()) ? search.trim() : null;
        return patientRepository.filterPatients(cleanStatus, cleanSearch);
    }

    public Patient getPatientById(Long id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id " + id));
    }

    @Transactional
    public Patient createPatient(Patient patient, Long doctorId) {
        if (patient.getName() == null || patient.getName().trim().isBlank()) {
            throw new IllegalArgumentException("Patient name is required.");
        }
        if (patient.getAge() == null || patient.getAge() <= 0) {
            throw new IllegalArgumentException("Valid patient age is required.");
        }
        if (patient.getGender() == null || patient.getGender().trim().isBlank()) {
            throw new IllegalArgumentException("Patient gender is required.");
        }

        if (patient.getPatientId() != null && !patient.getPatientId().trim().isBlank()) {
            String cleanId = patient.getPatientId().trim().toUpperCase();
            if (patientRepository.findByPatientId(cleanId).isPresent()) {
                throw new IllegalArgumentException("Patient ID '" + cleanId + "' is already registered in the system.");
            }
            patient.setPatientId(cleanId);
        } else {
            String generatedId;
            do {
                generatedId = "P" + (1000 + (int)(Math.random() * 9000));
            } while (patientRepository.findByPatientId(generatedId).isPresent());
            patient.setPatientId(generatedId);
        }

        Long targetDoctorId = doctorId;
        if (targetDoctorId == null && patient.getAssignedDoctor() != null && patient.getAssignedDoctor().getId() != null) {
            targetDoctorId = patient.getAssignedDoctor().getId();
        }

        if (targetDoctorId != null) {
            final Long finalDoctorId = targetDoctorId;
            Doctor doctor = doctorRepository.findById(finalDoctorId)
                    .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id " + finalDoctorId));
            patient.setAssignedDoctor(doctor);
        }

        if (patient.getAdmissionTime() == null) {
            patient.setAdmissionTime(LocalDateTime.now());
        }
        if (patient.getConditionStatus() == null || patient.getConditionStatus().trim().isBlank()) {
            patient.setConditionStatus("STABLE");
        } else {
            patient.setConditionStatus(patient.getConditionStatus().trim().toUpperCase());
        }
        return patientRepository.save(patient);
    }

    @Transactional
    public Patient updatePatient(Long id, Patient updated) {
        Patient patient = getPatientById(id);
        patient.setName(updated.getName());
        patient.setAge(updated.getAge());
        patient.setGender(updated.getGender());
        patient.setConditionStatus(updated.getConditionStatus());
        patient.setDiagnosis(updated.getDiagnosis());
        patient.setEquipmentRequired(updated.getEquipmentRequired());
        patient.setNotes(updated.getNotes());
        if (updated.getAssignedDoctor() != null) {
            patient.setAssignedDoctor(updated.getAssignedDoctor());
        }
        return patientRepository.save(patient);
    }

    @Transactional
    public void deletePatient(Long id) {
        if (!patientRepository.existsById(id)) {
            throw new ResourceNotFoundException("Patient not found with id " + id);
        }
        patientRepository.deleteById(id);
    }

    public Map<String, Object> getPatientFullDetails(Long id) {
        Patient patient = getPatientById(id);
        Map<String, Object> details = new HashMap<>();
        details.put("patient", patient);

        Optional<BedAssignment> assignmentOpt = bedAssignmentRepository.findByPatientIdAndStatus(id, "ACTIVE");
        if (assignmentOpt.isPresent()) {
            BedAssignment ba = assignmentOpt.get();
            details.put("assignedBed", ba.getBed());
            details.put("assignedWard", ba.getBed().getWard());
            details.put("assignedAt", ba.getAssignedAt());
        } else {
            details.put("assignedBed", null);
            details.put("assignedWard", null);
        }
        return details;
    }
}
