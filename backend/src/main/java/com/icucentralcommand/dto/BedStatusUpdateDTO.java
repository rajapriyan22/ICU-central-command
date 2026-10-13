package com.icucentralcommand.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BedStatusUpdateDTO {
    private String status; // AVAILABLE, CLEANING, MAINTENANCE
    private Integer cleaningEstMinutes;
    private String notes;
}
