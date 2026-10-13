package com.icucentralcommand.service;

import com.icucentralcommand.dto.BedStatusUpdateDTO;
import com.icucentralcommand.dto.IcuBedDTO;
import com.icucentralcommand.exception.ResourceNotFoundException;
import com.icucentralcommand.model.BedAssignment;
import com.icucentralcommand.model.IcuBed;
import com.icucentralcommand.model.Patient;
import com.icucentralcommand.model.Ward;
import com.icucentralcommand.repository.BedAssignmentRepository;
import com.icucentralcommand.repository.IcuBedRepository;
import com.icucentralcommand.repository.WardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BedService {

    private final IcuBedRepository bedRepository;
    private final WardRepository wardRepository;
    private final BedAssignmentRepository bedAssignmentRepository;

    public List<IcuBedDTO> getAllBeds(String unitType, String floor, String status, String search) {
        String cleanUnit = (unitType != null && !unitType.isBlank() && !unitType.equalsIgnoreCase("All Wards")) ? unitType : null;
        String cleanFloor = (floor != null && !floor.isBlank() && !floor.equalsIgnoreCase("All Floors")) ? floor : null;
        String cleanStatus = (status != null && !status.isBlank() && !status.equalsIgnoreCase("All Status")) ? status : null;
        String cleanSearch = (search != null && !search.isBlank()) ? search.trim() : null;

        List<IcuBed> beds = bedRepository.filterBeds(cleanUnit, cleanFloor, cleanStatus, cleanSearch);

        return beds.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public IcuBedDTO getBedById(Long id) {
        IcuBed bed = bedRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bed not found with id " + id));
        return convertToDTO(bed);
    }

    @Transactional
    public IcuBedDTO updateBedStatus(Long id, BedStatusUpdateDTO dto) {
        IcuBed bed = bedRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bed not found with id " + id));

        bed.setStatus(dto.getStatus());
        if (dto.getCleaningEstMinutes() != null) {
            bed.setCleaningEstMinutes(dto.getCleaningEstMinutes());
        }
        if (dto.getNotes() != null) {
            bed.setNotes(dto.getNotes());
        }

        bedRepository.save(bed);
        return convertToDTO(bed);
    }

    @Transactional
    public IcuBedDTO createBed(IcuBedDTO dto) {
        Ward ward = wardRepository.findById(dto.getWardId())
                .orElseThrow(() -> new ResourceNotFoundException("Ward not found with id " + dto.getWardId()));

        IcuBed bed = IcuBed.builder()
                .bedNumber(dto.getBedNumber())
                .ward(ward)
                .status(dto.getStatus() != null ? dto.getStatus() : "AVAILABLE")
                .cleaningEstMinutes(0)
                .equipment(dto.getEquipment() != null ? dto.getEquipment() : "Standard ICU Monitor")
                .notes(dto.getNotes())
                .build();

        IcuBed saved = bedRepository.save(bed);
        return convertToDTO(saved);
    }

    @Transactional
    public void deleteBed(Long id) {
        if (!bedRepository.existsById(id)) {
            throw new ResourceNotFoundException("Bed not found with id " + id);
        }
        bedRepository.deleteById(id);
    }

    public IcuBedDTO convertToDTO(IcuBed bed) {
        IcuBedDTO dto = IcuBedDTO.builder()
                .id(bed.getId())
                .bedNumber(bed.getBedNumber())
                .wardId(bed.getWard().getId())
                .wardName(bed.getWard().getName())
                .floor(bed.getWard().getFloor())
                .unitType(bed.getWard().getUnitType())
                .status(bed.getStatus())
                .cleaningEstMinutes(bed.getCleaningEstMinutes())
                .equipment(bed.getEquipment())
                .notes(bed.getNotes())
                .build();

        if ("OCCUPIED".equals(bed.getStatus())) {
            Optional<BedAssignment> assignmentOpt = bedAssignmentRepository.findByBedIdAndStatus(bed.getId(), "ACTIVE");
            if (assignmentOpt.isPresent()) {
                Patient p = assignmentOpt.get().getPatient();
                dto.setPatientId(p.getId());
                dto.setPatientCode(p.getPatientId());
                dto.setPatientName(p.getName());
                dto.setPatientAge(p.getAge());
                dto.setPatientGender(p.getGender());
                dto.setPatientCondition(p.getConditionStatus());
                dto.setPatientEquipment(p.getEquipmentRequired());
            }
        }

        return dto;
    }
}
