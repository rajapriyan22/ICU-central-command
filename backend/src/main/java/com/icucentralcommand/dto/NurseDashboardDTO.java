package com.icucentralcommand.dto;

import com.icucentralcommand.model.Alert;
import lombok.*;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NurseDashboardDTO {
    private String nurseName;
    private String department;
    private String shift;

    private long totalIcuBeds;
    private long availableBedsCount;
    private long occupiedBedsCount;
    private long cleaningBedsCount;
    private long maintenanceBedsCount;

    private List<IcuBedDTO> myIcuBeds;
    private List<CleaningBedDTO> cleaningMonitors;
    private List<Alert> operationalAlerts;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CleaningBedDTO {
        private Long bedId;
        private String bedNumber;
        private String wardName;
        private int estMinutesRemaining;
    }
}
