package com.icucentralcommand.service;

import com.icucentralcommand.exception.ResourceNotFoundException;
import com.icucentralcommand.model.Alert;
import com.icucentralcommand.model.Patient;
import com.icucentralcommand.model.Vital;
import com.icucentralcommand.repository.AlertRepository;
import com.icucentralcommand.repository.PatientRepository;
import com.icucentralcommand.repository.VitalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
@RequiredArgsConstructor
public class VitalService {

    private final VitalRepository vitalRepository;
    private final PatientRepository patientRepository;
    private final AlertRepository alertRepository;
    private final AlertService alertService;

    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();
    private final Random random = new Random();

    public List<Vital> getPatientVitals(Long patientId) {
        return vitalRepository.findByPatientIdOrderByRecordedAtDesc(patientId);
    }

    public Vital getLatestVitalForPatient(Long patientId) {
        return vitalRepository.findFirstByPatientIdOrderByRecordedAtDesc(patientId)
                .orElseGet(() -> generateSimulatedVital(patientId));
    }

    public SseEmitter subscribeLiveStream() {
        SseEmitter emitter = new SseEmitter(0L); // 0L means no timeout
        emitters.add(emitter);

        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> emitters.remove(emitter));
        emitter.onError((e) -> emitters.remove(emitter));

        // Immediately send initial payload upon subscription
        try {
            emitter.send(SseEmitter.event().name("message").data(getLiveTelemetryDashboard()));
        } catch (IOException e) {
            emitters.remove(emitter);
        }

        return emitter;
    }

    public Map<String, Object> getLiveTelemetryDashboard() {
        List<Patient> patients = patientRepository.findAll();
        List<Map<String, Object>> liveList = new ArrayList<>();

        for (Patient p : patients) {
            Vital v = getLatestVitalForPatient(p.getId());
            Map<String, Object> item = new HashMap<>();
            item.put("patientId", p.getId());
            item.put("patientCode", p.getPatientId());
            item.put("patientName", p.getName());
            item.put("age", p.getAge());
            item.put("gender", p.getGender());
            item.put("condition", p.getConditionStatus());
            item.put("equipment", p.getEquipmentRequired());
            item.put("heartRate", v.getHeartRate());
            item.put("spo2", v.getSpo2());
            item.put("bloodPressure", v.getBloodPressure());
            item.put("temperature", v.getTemperature());
            item.put("respiratoryRate", v.getRespiratoryRate());
            item.put("recordedAt", v.getRecordedAt());
            item.put("isDemoSimulation", true);
            liveList.add(item);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("mode", "DEMO_SIMULATION");
        response.put("status", "ACTIVE");
        response.put("patients", liveList);
        return response;
    }

    @Scheduled(fixedRate = 3000)
    public void streamLiveTelemetryPulse() {
        List<Patient> patients = patientRepository.findAll();
        if (patients.isEmpty()) return;

        for (Patient p : patients) {
            Vital lastVital = vitalRepository.findFirstByPatientIdOrderByRecordedAtDesc(p.getId())
                    .orElse(null);

            boolean isCritical = "CRITICAL".equalsIgnoreCase(p.getConditionStatus());

            int hr;
            int spo2;
            int sys;
            int dia;

            if (lastVital != null) {
                // Controlled micro-fluctuations (smooth changes: -2 to +2 bpm, -1 to +1 % SpO2)
                int hrDelta = random.nextInt(5) - 2;
                hr = Math.max(55, Math.min(160, lastVital.getHeartRate() + hrDelta));

                int spo2Delta = random.nextInt(3) - 1;
                spo2 = Math.max(85, Math.min(100, lastVital.getSpo2() + spo2Delta));

                String[] bpParts = lastVital.getBloodPressure().split("/");
                int oldSys = bpParts.length > 0 ? Integer.parseInt(bpParts[0]) : 120;
                int oldDia = bpParts.length > 1 ? Integer.parseInt(bpParts[1]) : 80;

                sys = Math.max(90, Math.min(180, oldSys + (random.nextInt(3) - 1)));
                dia = Math.max(60, Math.min(110, oldDia + (random.nextInt(3) - 1)));
            } else {
                hr = isCritical ? 115 + random.nextInt(15) : 72 + random.nextInt(15);
                spo2 = isCritical ? 91 + random.nextInt(3) : 97 + random.nextInt(3);
                sys = isCritical ? 135 + random.nextInt(15) : 118 + random.nextInt(10);
                dia = isCritical ? 88 + random.nextInt(10) : 78 + random.nextInt(8);
            }

            double temp = 36.5 + (random.nextInt(15) / 10.0);
            int rr = isCritical ? 20 + random.nextInt(6) : 15 + random.nextInt(4);

            Vital newVital = Vital.builder()
                    .patient(p)
                    .heartRate(hr)
                    .spo2(spo2)
                    .bloodPressure(sys + "/" + dia)
                    .temperature(temp)
                    .respiratoryRate(rr)
                    .recordedAt(LocalDateTime.now())
                    .build();

            vitalRepository.save(newVital);

            // Deduplicated Alert Generation Integration
            if (spo2 < 93) {
                boolean hasUnreadSpO2Alert = alertRepository.existsByPatientIdAndCategoryAndIsReadFalse(p.getId(), "CRITICAL");
                if (!hasUnreadSpO2Alert) {
                    alertService.createAlert(Alert.builder()
                            .title("Low SpO2 Alert")
                            .description("Patient " + p.getName() + " (" + p.getPatientId() + ") SpO2 dropped to " + spo2 + "%")
                            .category("CRITICAL")
                            .patient(p)
                            .isRead(false)
                            .timestamp(LocalDateTime.now())
                            .build());
                }
            } else if (hr > 125) {
                boolean hasUnreadHrAlert = alertRepository.existsByPatientIdAndCategoryAndIsReadFalse(p.getId(), "WARNING");
                if (!hasUnreadHrAlert) {
                    alertService.createAlert(Alert.builder()
                            .title("Elevated Heart Rate")
                            .description("Patient " + p.getName() + " (" + p.getPatientId() + ") HR reached " + hr + " bpm")
                            .category("WARNING")
                            .patient(p)
                            .isRead(false)
                            .timestamp(LocalDateTime.now())
                            .build());
                }
            }
        }

        // Broadcast to SSE clients if any are connected
        if (!emitters.isEmpty()) {
            Map<String, Object> payload = getLiveTelemetryDashboard();
            List<SseEmitter> deadEmitters = new ArrayList<>();

            for (SseEmitter emitter : emitters) {
                try {
                    emitter.send(SseEmitter.event().name("message").data(payload));
                } catch (Exception e) {
                    deadEmitters.add(emitter);
                }
            }
            emitters.removeAll(deadEmitters);
        }
    }

    public Vital generateSimulatedVital(Long patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id " + patientId));

        boolean isCritical = "CRITICAL".equalsIgnoreCase(patient.getConditionStatus());

        int hr = isCritical ? 105 + random.nextInt(25) : 70 + random.nextInt(20);
        int spo2 = isCritical ? 90 + random.nextInt(4) : 96 + random.nextInt(4);
        int sys = isCritical ? 130 + random.nextInt(25) : 115 + random.nextInt(15);
        int dia = isCritical ? 85 + random.nextInt(15) : 75 + random.nextInt(10);
        double temp = 36.5 + (random.nextInt(20) / 10.0);
        int rr = isCritical ? 20 + random.nextInt(8) : 14 + random.nextInt(5);

        Vital vital = Vital.builder()
                .patient(patient)
                .heartRate(hr)
                .spo2(spo2)
                .bloodPressure(sys + "/" + dia)
                .temperature(temp)
                .respiratoryRate(rr)
                .recordedAt(LocalDateTime.now())
                .build();

        return vitalRepository.save(vital);
    }
}
