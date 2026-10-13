package com.icucentralcommand.service;

import com.icucentralcommand.dto.IcuBedDTO;
import com.icucentralcommand.dto.NurseDashboardDTO;
import com.icucentralcommand.dto.NurseDashboardDTO.CleaningBedDTO;
import com.icucentralcommand.model.Alert;
import com.icucentralcommand.model.IcuBed;
import com.icucentralcommand.repository.AlertRepository;
import com.icucentralcommand.repository.IcuBedRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NurseDashboardService {

    private final IcuBedRepository bedRepository;
    private final BedService bedService;
    private final AlertRepository alertRepository;

    public NurseDashboardDTO getNurseDashboard(String username) {
        long totalBeds = bedRepository.count();
        long availableBeds = bedRepository.countByStatus("AVAILABLE");
        long occupiedBeds = bedRepository.countByStatus("OCCUPIED");
        long cleaningBeds = bedRepository.countByStatus("CLEANING");
        long maintenanceBeds = bedRepository.countByStatus("MAINTENANCE");

        List<IcuBedDTO> allBedDTOs = bedService.getAllBeds(null, null, null, null);

        List<CleaningBedDTO> cleaningMonitors = new ArrayList<>();
        for (IcuBed b : bedRepository.findByStatus("CLEANING")) {
            cleaningMonitors.add(CleaningBedDTO.builder()
                    .bedId(b.getId())
                    .bedNumber(b.getBedNumber())
                    .wardName(b.getWard().getName())
                    .estMinutesRemaining(b.getCleaningEstMinutes() != null ? b.getCleaningEstMinutes() : 30)
                    .build());
        }

        List<Alert> operationalAlerts = alertRepository.findAllByOrderByTimestampDesc();

        return NurseDashboardDTO.builder()
                .nurseName("Priya Sharma")
                .department("ICU - 1st Floor")
                .shift("Morning")
                .totalIcuBeds(totalBeds)
                .availableBedsCount(availableBeds)
                .occupiedBedsCount(occupiedBeds)
                .cleaningBedsCount(cleaningBeds)
                .maintenanceBedsCount(maintenanceBeds)
                .myIcuBeds(allBedDTOs)
                .cleaningMonitors(cleaningMonitors)
                .operationalAlerts(operationalAlerts)
                .build();
    }
}
