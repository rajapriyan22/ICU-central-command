package com.icucentralcommand.dto;

import com.icucentralcommand.model.Alert;
import com.icucentralcommand.model.Patient;
import lombok.*;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorDashboardDTO {
    private String doctorName;
    private String department;
    private String specialization;

    private long totalAssignedPatients;
    private long criticalPatientsCount;
    private long stablePatientsCount;
    private long guardedPatientsCount;

    private List<PatientSummaryDTO> myPatients;
    private List<PatientSummaryDTO> criticalAttentionList;
    private List<Alert> clinicalAlerts;
    private List<VitalPreviewDTO> vitalTrendPreviews;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PatientSummaryDTO {
        private Long id;
        private String patientId;
        private String name;
        private Integer age;
        private String gender;
        private String conditionStatus;
        private String diagnosis;
        private String assignedBedNumber;
        private String assignedWardName;
        private String equipment;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class VitalPreviewDTO {
        private String patientName;
        private String patientCode;
        private int heartRate;
        private int spo2;
        private String bloodPressure;
        private double temperature;
    }
}
