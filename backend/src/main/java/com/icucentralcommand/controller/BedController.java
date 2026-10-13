package com.icucentralcommand.controller;

import com.icucentralcommand.dto.BedStatusUpdateDTO;
import com.icucentralcommand.dto.IcuBedDTO;
import com.icucentralcommand.service.BedService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/beds")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BedController {

    private final BedService bedService;

    @GetMapping
    public ResponseEntity<List<IcuBedDTO>> getAllBeds(
            @RequestParam(required = false) String unitType,
            @RequestParam(required = false) String floor,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(bedService.getAllBeds(unitType, floor, status, search));
    }

    @GetMapping("/{id}")
    public ResponseEntity<IcuBedDTO> getBedById(@PathVariable Long id) {
        return ResponseEntity.ok(bedService.getBedById(id));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<IcuBedDTO> updateBedStatus(@PathVariable Long id, @RequestBody BedStatusUpdateDTO dto) {
        return ResponseEntity.ok(bedService.updateBedStatus(id, dto));
    }

    @PostMapping
    public ResponseEntity<IcuBedDTO> createBed(@RequestBody IcuBedDTO dto) {
        return new ResponseEntity<>(bedService.createBed(dto), HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBed(@PathVariable Long id) {
        bedService.deleteBed(id);
        return ResponseEntity.noContent().build();
    }
}
