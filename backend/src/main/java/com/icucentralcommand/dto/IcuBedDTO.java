package com.icucentralcommand.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IcuBedDTO {
    private Long id;
    private String bedNumber;
    private Long wardId;
    private String wardName;
    private String floor;
    private String unitType;
    private String status; // AVAILABLE, OCCUPIED, CLEANING, MAINTENANCE
    private Integer cleaningEstMinutes;
    private String equipment;
    private String notes;

    // Occupied Patient Info if assigned
    private Long patientId;
    private String patientCode;
    private String patientName;
    private Integer patientAge;
    private String patientGender;
    private String patientCondition;
    private String patientEquipment;
}
