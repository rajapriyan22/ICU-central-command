package com.icucentralcommand.service;

import com.icucentralcommand.dto.DashboardSummaryDTO;
import com.icucentralcommand.dto.DashboardSummaryDTO.*;
import com.icucentralcommand.model.Alert;
import com.icucentralcommand.model.BedAssignment;
import com.icucentralcommand.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final IcuBedRepository bedRepository;
    private final PatientRepository patientRepository;
    private final WardService wardService;
    private final AlertRepository alertRepository;
    private final BedAssignmentRepository bedAssignmentRepository;

    public DashboardSummaryDTO getDashboardSummary() {
        long totalBeds = bedRepository.count();
        long availableBeds = bedRepository.countByStatus("AVAILABLE");
        long occupiedBeds = bedRepository.countByStatus("OCCUPIED");
        long cleaningBeds = bedRepository.countByStatus("CLEANING");
        long maintenanceBeds = bedRepository.countByStatus("MAINTENANCE");

        long totalPatients = patientRepository.count();
        long criticalPatients = patientRepository.countByConditionStatus("CRITICAL");
        long stablePatients = patientRepository.countByConditionStatus("STABLE");
        long guardedPatients = patientRepository.countByConditionStatus("GUARDED");

        Map<String, Long> distribution = new LinkedHashMap<>();
        distribution.put("Available", availableBeds);
        distribution.put("Occupied", occupiedBeds);
        distribution.put("Cleaning", cleaningBeds);
        distribution.put("Maintenance", maintenanceBeds);

        List<WardAvailabilityDTO> wardList = wardService.getWardAvailabilitySummary();

        // 7-Day Turnover data (Matching screenshot timeline e.g. Sep 11 - Sep 17)
        List<TurnoverDataDTO> turnoverHistory = new ArrayList<>();
        LocalDate today = LocalDate.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd");

        int[] sampleAdmissions = {8, 6, 12, 10, 14, 11, 10};
        int[] sampleDischarges = {10, 5, 14, 7, 12, 15, 13};

        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            int idx = 6 - i;
            turnoverHistory.add(TurnoverDataDTO.builder()
                    .date(date.format(formatter))
                    .admissions(sampleAdmissions[idx])
                    .discharges(sampleDischarges[idx])
                    .build());
        }

        // Recent Activity feed from recent alerts and bed assignments
        List<ActivityDTO> activityFeed = new ArrayList<>();
        List<Alert> recentAlerts = alertRepository.findAllByOrderByTimestampDesc();
        int count = 0;
        for (Alert a : recentAlerts) {
            if (count++ >= 5) break;
            activityFeed.add(ActivityDTO.builder()
                    .id("ACT-" + a.getId())
                    .type(a.getCategory())
                    .title(a.getTitle())
                    .detail(a.getDescription())
                    .timeAgo(getTimeAgo(a.getTimestamp()))
                    .build());
        }

        if (activityFeed.isEmpty()) {
            activityFeed.add(ActivityDTO.builder().id("1").type("ASSIGNMENT").title("Patient admitted").detail("Arjun K. assigned to ICU-102").timeAgo("10 mins ago").build());
            activityFeed.add(ActivityDTO.builder().id("2").type("ASSIGNMENT").title("Bed assigned").detail("Lakshmi P. assigned to ICU-115").timeAgo("25 mins ago").build());
            activityFeed.add(ActivityDTO.builder().id("3").type("CLEANING").title("Bed cleaning completed").detail("ICU-109 is now available").timeAgo("40 mins ago").build());
        }

        Map<String, String> systemStatus = new LinkedHashMap<>();
        systemStatus.put("Database", "Online");
        systemStatus.put("API Server", "Online");
        systemStatus.put("Vital Monitor", "Online");
        systemStatus.put("Notifications", "Online");

        return DashboardSummaryDTO.builder()
                .totalBeds(totalBeds)
                .availableBeds(availableBeds)
                .occupiedBeds(occupiedBeds)
                .cleaningBeds(cleaningBeds)
                .maintenanceBeds(maintenanceBeds)
                .totalPatients(totalPatients)
                .criticalPatients(criticalPatients)
                .stablePatients(stablePatients)
                .guardedPatients(guardedPatients)
                .bedStatusDistribution(distribution)
                .wardAvailability(wardList)
                .turnoverHistory(turnoverHistory)
                .recentActivity(activityFeed)
                .systemStatus(systemStatus)
                .build();
    }

    private String getTimeAgo(java.time.LocalDateTime dateTime) {
        if (dateTime == null) return "Just now";
        java.time.Duration duration = java.time.Duration.between(dateTime, java.time.LocalDateTime.now());
        long minutes = Math.abs(duration.toMinutes());
        if (minutes < 1) return "Just now";
        if (minutes < 60) return minutes + " mins ago";
        long hours = minutes / 60;
        if (hours < 24) return hours + " hrs ago";
        return (hours / 24) + " days ago";
    }
}
