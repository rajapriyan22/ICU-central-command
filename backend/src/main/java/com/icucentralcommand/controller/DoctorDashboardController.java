package com.icucentralcommand.controller;

import com.icucentralcommand.dto.DoctorDashboardDTO;
import com.icucentralcommand.service.DoctorDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/doctor")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DoctorDashboardController {

    private final DoctorDashboardService doctorDashboardService;

    @GetMapping("/dashboard")
    public ResponseEntity<DoctorDashboardDTO> getDoctorDashboard(@RequestParam(required = false, defaultValue = "doctor1") String username) {
        return ResponseEntity.ok(doctorDashboardService.getDoctorDashboard(username));
    }
}
