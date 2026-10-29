package com.icucentralcommand.service;

import com.icucentralcommand.dto.LoginRequestDTO;
import com.icucentralcommand.dto.LoginResponseDTO;
import com.icucentralcommand.exception.AuthenticationFailedException;
import com.icucentralcommand.model.User;
import com.icucentralcommand.repository.UserRepository;
import com.icucentralcommand.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final String dummyHash;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.dummyHash = passwordEncoder.encode(UUID.randomUUID().toString());
    }

    public LoginResponseDTO login(LoginRequestDTO request) {
        String identifier = request.getUsernameOrEmail() != null ? request.getUsernameOrEmail().trim() : "";
        String rawPassword = request.getPassword() != null ? request.getPassword() : "";

        Optional<User> userOpt = userRepository.findByUsername(identifier);
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByEmail(identifier);
        }

        boolean passwordMatches;
        if (userOpt.isPresent()) {
            passwordMatches = passwordEncoder.matches(rawPassword, userOpt.get().getPassword());
        } else {
            passwordEncoder.matches(rawPassword, dummyHash);
            passwordMatches = false;
        }

        if (userOpt.isEmpty() || !passwordMatches) {
            throw new AuthenticationFailedException("Invalid username/email or password.");
        }

        User user = userOpt.get();

        if (Boolean.FALSE.equals(user.getIsActive())) {
            throw new AuthenticationFailedException("Account is deactivated. Please contact Administrator.");
        }

        String role = user.getRole() != null ? user.getRole().trim().toUpperCase() : "";
        String token = jwtService.generateToken(user.getId(), user.getUsername(), role);

        return LoginResponseDTO.builder()
                .token(token)
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(role)
                .department(user.getDepartment())
                .specialization(user.getSpecialization())
                .shift(user.getShift())
                .isActive(user.getIsActive())
                .build();
    }
}
