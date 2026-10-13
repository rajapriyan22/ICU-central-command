package com.icucentralcommand.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "doctors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 100)
    private String department;

    @Column(nullable = false, length = 100)
    private String specialization;

    private String phone;
    private String email;

    @Column(nullable = false, length = 20)
    private String status; // ON_DUTY, AVAILABLE, ON_CALL, OFF_DUTY

    @Column(name = "assigned_patients_count")
    private Integer assignedPatientsCount;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
