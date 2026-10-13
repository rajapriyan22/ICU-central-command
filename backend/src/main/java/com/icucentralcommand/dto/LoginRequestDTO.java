package com.icucentralcommand.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginRequestDTO {
    private String usernameOrEmail;
    private String password;
}
