package com.icucentralcommand.config;

import com.icucentralcommand.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class DemoAccountInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private static final Map<String, String> DEMO_PASSWORDS = Map.of(
            "admin", "Admin@123",
            "doctor1", "Doctor@123",
            "doctor2", "Doctor@123",
            "nurse1", "Nurse@123",
            "nurse2", "Nurse@123"
    );

    @Override
    public void run(ApplicationArguments args) {
        DEMO_PASSWORDS.forEach((username, password) -> userRepository.findByUsername(username).ifPresent(user -> {
            if (!passwordEncoder.matches(password, user.getPassword())) {
                user.setPassword(passwordEncoder.encode(password));
                userRepository.save(user);
            }
        }));
    }
}
