package com.icucentralcommand.controller;

import com.icucentralcommand.model.Alert;
import com.icucentralcommand.service.AlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
public class AlertController {

    private final AlertService alertService;

    @GetMapping
    public ResponseEntity<List<Alert>> getAllAlerts(@RequestParam(required = false) String category) {
        return ResponseEntity.ok(alertService.getAllAlerts(category));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Alert> markAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(alertService.markAsRead(id));
    }

    @PostMapping
    public ResponseEntity<Alert> createAlert(@RequestBody Alert alert) {
        return new ResponseEntity<>(alertService.createAlert(alert), HttpStatus.CREATED);
    }
}
