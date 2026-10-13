package com.icucentralcommand.dto;

import lombok.*;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardSummaryDTO {
    // KPI metrics
    private long totalBeds;
    private long availableBeds;
    private long occupiedBeds;
    private long cleaningBeds;
    private long maintenanceBeds;

    private long totalPatients;
    private long criticalPatients;
    private long stablePatients;
    private long guardedPatients;

    // Bed Status Distribution
    private Map<String, Long> bedStatusDistribution;

    // Ward Availability Breakdown
    private List<WardAvailabilityDTO> wardAvailability;

    // Bed Turnover History (Admissions vs Discharges last 7 days)
    private List<TurnoverDataDTO> turnoverHistory;

    // Recent Activity Log
    private List<ActivityDTO> recentActivity;

    // System Status Indicators
    private Map<String, String> systemStatus;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class WardAvailabilityDTO {
        private String wardName;
        private int totalBeds;
        private long occupied;
        private long available;
        private long maintenance;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TurnoverDataDTO {
        private String date;
        private int admissions;
        private int discharges;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ActivityDTO {
        private String id;
        private String type; // ADMISSION, ASSIGNMENT, RELEASE, CLEANING
        private String title;
        private String detail;
        private String timeAgo;
    }
}
