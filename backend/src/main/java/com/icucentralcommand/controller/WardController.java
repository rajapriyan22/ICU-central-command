package com.icucentralcommand.controller;

import com.icucentralcommand.dto.DashboardSummaryDTO.WardAvailabilityDTO;
import com.icucentralcommand.model.Ward;
import com.icucentralcommand.service.WardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wards")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class WardController {

    private final WardService wardService;

    @GetMapping
    public ResponseEntity<List<Ward>> getAllWards() {
        return ResponseEntity.ok(wardService.getAllWards());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ward> getWardById(@PathVariable Long id) {
        return ResponseEntity.ok(wardService.getWardById(id));
    }

    @GetMapping("/availability")
    public ResponseEntity<List<WardAvailabilityDTO>> getWardAvailabilitySummary() {
        return ResponseEntity.ok(wardService.getWardAvailabilitySummary());
    }

    @PostMapping
    public ResponseEntity<Ward> createWard(@RequestBody Ward ward) {
        return new ResponseEntity<>(wardService.createWard(ward), HttpStatus.CREATED);
    }
}
