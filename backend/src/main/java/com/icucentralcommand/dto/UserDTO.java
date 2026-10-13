package com.icucentralcommand.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDTO {
    private Long id;
    private String username;
    private String email;
    private String password;
    private String fullName;
    private String role; // ADMIN, DOCTOR, NURSE
    private String department;
    private String specialization;
    private String shift;
    private Boolean isActive;
}
