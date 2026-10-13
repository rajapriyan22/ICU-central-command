package com.icucentralcommand.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BedAssignmentRequestDTO {
    private Long patientId;
    private Long bedId;
    private String notes;
}
