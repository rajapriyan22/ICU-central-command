package com.icucentralcommand.controller;

import com.icucentralcommand.dto.NurseDashboardDTO;
import com.icucentralcommand.service.NurseDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/nurse")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class NurseDashboardController {

    private final NurseDashboardService nurseDashboardService;

    @GetMapping("/dashboard")
    public ResponseEntity<NurseDashboardDTO> getNurseDashboard(@RequestParam(required = false, defaultValue = "nurse1") String username) {
        return ResponseEntity.ok(nurseDashboardService.getNurseDashboard(username));
    }
}
