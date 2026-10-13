package com.icucentralcommand.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "alerts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Alert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String title;

    private String description;

    @Column(nullable = false, length = 20)
    private String category; // CRITICAL, WARNING, INFORMATION

    private LocalDateTime timestamp;

    @Column(name = "is_read")
    private Boolean isRead;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "bed_id")
    private IcuBed bed;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "patient_id")
    private Patient patient;
}
