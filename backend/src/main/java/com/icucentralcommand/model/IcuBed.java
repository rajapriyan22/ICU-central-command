package com.icucentralcommand.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "icu_beds")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IcuBed {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "bed_number", nullable = false, unique = true, length = 20)
    private String bedNumber;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ward_id", nullable = false)
    private Ward ward;

    @Column(nullable = false, length = 20)
    private String status; // AVAILABLE, OCCUPIED, CLEANING, MAINTENANCE

    @Column(name = "cleaning_est_minutes")
    private Integer cleaningEstMinutes;

    private String equipment;
    private String notes;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;
}
