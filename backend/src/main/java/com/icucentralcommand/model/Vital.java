package com.icucentralcommand.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "vitals")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vital {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(name = "heart_rate", nullable = false)
    private Integer heartRate;

    @Column(nullable = false)
    private Integer spo2;

    @Column(name = "blood_pressure", nullable = false, length = 20)
    private String bloodPressure;

    @Column(nullable = false)
    private Double temperature;

    @Column(name = "respiratory_rate", nullable = false)
    private Integer respiratoryRate;

    @Column(name = "recorded_at")
    private LocalDateTime recordedAt;
}
