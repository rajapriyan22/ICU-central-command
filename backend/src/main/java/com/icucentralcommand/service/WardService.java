package com.icucentralcommand.service;

import com.icucentralcommand.dto.DashboardSummaryDTO.WardAvailabilityDTO;
import com.icucentralcommand.exception.ResourceNotFoundException;
import com.icucentralcommand.model.IcuBed;
import com.icucentralcommand.model.Ward;
import com.icucentralcommand.repository.IcuBedRepository;
import com.icucentralcommand.repository.WardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WardService {

    private final WardRepository wardRepository;
    private final IcuBedRepository bedRepository;

    public List<Ward> getAllWards() {
        return wardRepository.findAll();
    }

    public Ward getWardById(Long id) {
        return wardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ward not found with id " + id));
    }

    public List<WardAvailabilityDTO> getWardAvailabilitySummary() {
        List<Ward> wards = wardRepository.findAll();
        return wards.stream().map(ward -> {
            List<IcuBed> beds = bedRepository.findByWardId(ward.getId());
            long occupied = beds.stream().filter(b -> "OCCUPIED".equalsIgnoreCase(b.getStatus())).count();
            long available = beds.stream().filter(b -> "AVAILABLE".equalsIgnoreCase(b.getStatus())).count();
            long maintenance = beds.stream().filter(b -> "MAINTENANCE".equalsIgnoreCase(b.getStatus())).count();

            return WardAvailabilityDTO.builder()
                    .wardName(ward.getName())
                    .totalBeds(ward.getCapacity() != null ? ward.getCapacity() : beds.size())
                    .occupied(occupied)
                    .available(available)
                    .maintenance(maintenance)
                    .build();
        }).collect(Collectors.toList());
    }

    public Ward createWard(Ward ward) {
        return wardRepository.save(ward);
    }
}
