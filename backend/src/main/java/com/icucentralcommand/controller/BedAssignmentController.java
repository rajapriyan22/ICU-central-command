package com.icucentralcommand.controller;

import com.icucentralcommand.dto.BedAssignmentRequestDTO;
import com.icucentralcommand.model.BedAssignment;
import com.icucentralcommand.service.BedAssignmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bed-assignments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BedAssignmentController {

    private final BedAssignmentService bedAssignmentService;

    @PostMapping
    public ResponseEntity<BedAssignment> assignBed(@RequestBody BedAssignmentRequestDTO request) {
        return new ResponseEntity<>(bedAssignmentService.assignBed(request), HttpStatus.CREATED);
    }

    @PostMapping("/{id}/release")
    public ResponseEntity<BedAssignment> releaseBed(
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "CLEANING") String targetStatus) {
        return ResponseEntity.ok(bedAssignmentService.releaseBed(id, targetStatus));
    }

    @PostMapping("/beds/{bedId}/release")
    public ResponseEntity<BedAssignment> releaseBedByBedId(
            @PathVariable Long bedId,
            @RequestParam(required = false, defaultValue = "CLEANING") String targetStatus) {
        return ResponseEntity.ok(bedAssignmentService.releaseBedByBedId(bedId, targetStatus));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<BedAssignment> deleteAssignment(
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "AVAILABLE") String targetStatus) {
        return ResponseEntity.ok(bedAssignmentService.releaseBed(id, targetStatus));
    }

    @GetMapping("/active")
    public ResponseEntity<List<BedAssignment>> getActiveAssignments() {
        return ResponseEntity.ok(bedAssignmentService.getActiveAssignments());
    }
}
