package com.icucentralcommand.controller;

import com.icucentralcommand.model.Patient;
import com.icucentralcommand.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PatientController {

    private final PatientService patientService;

    @GetMapping
    public ResponseEntity<List<Patient>> getAllPatients(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(patientService.getAllPatients(status, search));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Patient> getPatientById(@PathVariable Long id) {
        return ResponseEntity.ok(patientService.getPatientById(id));
    }

    @GetMapping("/{id}/details")
    public ResponseEntity<Map<String, Object>> getPatientFullDetails(@PathVariable Long id) {
        return ResponseEntity.ok(patientService.getPatientFullDetails(id));
    }

    @PostMapping
    public ResponseEntity<Patient> createPatient(@RequestBody Patient patient, @RequestParam(required = false) Long doctorId) {
        return new ResponseEntity<>(patientService.createPatient(patient, doctorId), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Patient> updatePatient(@PathVariable Long id, @RequestBody Patient patient) {
        return ResponseEntity.ok(patientService.updatePatient(id, patient));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePatient(@PathVariable Long id) {
        patientService.deletePatient(id);
        return ResponseEntity.noContent().build();
    }
}
