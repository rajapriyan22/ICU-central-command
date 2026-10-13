package com.icucentralcommand.service;

import com.icucentralcommand.dto.DoctorDashboardDTO;
import com.icucentralcommand.dto.DoctorDashboardDTO.*;
import com.icucentralcommand.model.Alert;
import com.icucentralcommand.model.BedAssignment;
import com.icucentralcommand.model.Patient;
import com.icucentralcommand.model.Vital;
import com.icucentralcommand.repository.AlertRepository;
import com.icucentralcommand.repository.BedAssignmentRepository;
import com.icucentralcommand.repository.PatientRepository;
import com.icucentralcommand.repository.VitalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorDashboardService {

    private final PatientRepository patientRepository;
    private final BedAssignmentRepository bedAssignmentRepository;
    private final AlertRepository alertRepository;
    private final VitalRepository vitalRepository;

    public DoctorDashboardDTO getDoctorDashboard(String username) {
        // Fetch doctor's patients
        List<Patient> allPatients = patientRepository.findAll();
        List<PatientSummaryDTO> myPatients = new ArrayList<>();
        List<PatientSummaryDTO> criticalAttention = new ArrayList<>();
        List<VitalPreviewDTO> vitalPreviews = new ArrayList<>();

        long criticalCount = 0;
        long stableCount = 0;
        long guardedCount = 0;

        for (Patient p : allPatients) {
            if ("CRITICAL".equalsIgnoreCase(p.getConditionStatus())) criticalCount++;
            else if ("STABLE".equalsIgnoreCase(p.getConditionStatus())) stableCount++;
            else guardedCount++;

            Optional<BedAssignment> assignment = bedAssignmentRepository.findByPatientIdAndStatus(p.getId(), "ACTIVE");
            String bedNum = assignment.isPresent() ? assignment.get().getBed().getBedNumber() : "Unassigned";
            String wardName = assignment.isPresent() ? assignment.get().getBed().getWard().getName() : "N/A";

            PatientSummaryDTO dto = PatientSummaryDTO.builder()
                    .id(p.getId())
                    .patientId(p.getPatientId())
                    .name(p.getName())
                    .age(p.getAge())
                    .gender(p.getGender())
                    .conditionStatus(p.getConditionStatus())
                    .diagnosis(p.getDiagnosis())
                    .assignedBedNumber(bedNum)
                    .assignedWardName(wardName)
                    .equipment(p.getEquipmentRequired())
                    .build();

            myPatients.add(dto);
            if ("CRITICAL".equalsIgnoreCase(p.getConditionStatus())) {
                criticalAttention.add(dto);
            }

            Optional<Vital> vOpt = vitalRepository.findFirstByPatientIdOrderByRecordedAtDesc(p.getId());
            if (vOpt.isPresent()) {
                Vital v = vOpt.get();
                vitalPreviews.add(VitalPreviewDTO.builder()
                        .patientName(p.getName())
                        .patientCode(p.getPatientId())
                        .heartRate(v.getHeartRate())
                        .spo2(v.getSpo2())
                        .bloodPressure(v.getBloodPressure())
                        .temperature(v.getTemperature())
                        .build());
            }
        }

        List<Alert> clinicalAlerts = alertRepository.findAllByOrderByTimestampDesc();

        return DoctorDashboardDTO.builder()
                .doctorName("Dr. Arun Kumar")
                .department("Critical Care")
                .specialization("Intensive Care Medicine")
                .totalAssignedPatients(myPatients.size())
                .criticalPatientsCount(criticalCount)
                .stablePatientsCount(stableCount)
                .guardedPatientsCount(guardedCount)
                .myPatients(myPatients)
                .criticalAttentionList(criticalAttention)
                .clinicalAlerts(clinicalAlerts)
                .vitalTrendPreviews(vitalPreviews)
                .build();
    }
}
