package com.icucentralcommand.controller;

import com.icucentralcommand.model.Vital;
import com.icucentralcommand.service.VitalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vitals")
@RequiredArgsConstructor
public class VitalController {

    private final VitalService vitalService;

    @GetMapping("/{patientId}")
    public ResponseEntity<List<Vital>> getPatientVitals(@PathVariable Long patientId) {
        return ResponseEntity.ok(vitalService.getPatientVitals(patientId));
    }

    @GetMapping("/{patientId}/latest")
    public ResponseEntity<Vital> getLatestVitalForPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(vitalService.getLatestVitalForPatient(patientId));
    }

    @GetMapping("/live")
    public ResponseEntity<Map<String, Object>> getLiveTelemetryDashboard() {
        return ResponseEntity.ok(vitalService.getLiveTelemetryDashboard());
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamLiveVitals() {
        return vitalService.subscribeLiveStream();
    }

    @PostMapping("/{patientId}/simulate")
    public ResponseEntity<Vital> simulateVital(@PathVariable Long patientId) {
        return ResponseEntity.ok(vitalService.generateSimulatedVital(patientId));
    }
}
