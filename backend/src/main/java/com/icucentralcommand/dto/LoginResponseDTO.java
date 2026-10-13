package com.icucentralcommand.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponseDTO {
    private String token;
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String role; // ADMIN, DOCTOR, NURSE
    private String department;
    private String specialization;
    private String shift;
    private Boolean isActive;
}
