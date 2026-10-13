package com.icucentralcommand.service;

import com.icucentralcommand.dto.UserDTO;
import com.icucentralcommand.exception.ResourceNotFoundException;
import com.icucentralcommand.model.Doctor;
import com.icucentralcommand.model.User;
import com.icucentralcommand.repository.DoctorRepository;
import com.icucentralcommand.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final PasswordEncoder passwordEncoder;

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public UserDTO getUserById(Long id) {
        User u = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + id));
        return convertToDTO(u);
    }

    public UserDTO createUser(UserDTO dto) {
        if (userRepository.existsByUsername(dto.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }

        String encodedPass = (dto.getPassword() != null && !dto.getPassword().isBlank())
                ? passwordEncoder.encode(dto.getPassword())
                : passwordEncoder.encode("Password@123");

        User user = User.builder()
                .username(dto.getUsername())
                .email(dto.getEmail())
                .password(encodedPass)
                .fullName(dto.getFullName())
                .role(dto.getRole() != null ? dto.getRole().toUpperCase() : "STAFF")
                .department(dto.getDepartment())
                .specialization(dto.getSpecialization())
                .shift(dto.getShift())
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .build();

        User saved = userRepository.save(user);

        if ("DOCTOR".equalsIgnoreCase(saved.getRole())) {
            syncDoctorProfile(saved);
        }

        return convertToDTO(saved);
    }

    public UserDTO updateUser(Long id, UserDTO dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + id));

        user.setFullName(dto.getFullName());
        user.setEmail(dto.getEmail());
        user.setRole(dto.getRole());
        user.setDepartment(dto.getDepartment());
        user.setSpecialization(dto.getSpecialization());
        user.setShift(dto.getShift());

        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
        }

        User updated = userRepository.save(user);

        if ("DOCTOR".equalsIgnoreCase(updated.getRole())) {
            syncDoctorProfile(updated);
        }

        return convertToDTO(updated);
    }

    public UserDTO toggleUserStatus(Long id, Boolean active) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + id));
        user.setIsActive(active);
        return convertToDTO(userRepository.save(user));
    }

    private void syncDoctorProfile(User user) {
        if (user.getFullName() == null || user.getFullName().isBlank()) return;

        doctorRepository.findByName(user.getFullName()).ifPresentOrElse(
            existing -> {
                if (user.getDepartment() != null && !user.getDepartment().isBlank()) {
                    existing.setDepartment(user.getDepartment());
                }
                if (user.getSpecialization() != null && !user.getSpecialization().isBlank()) {
                    existing.setSpecialization(user.getSpecialization());
                }
                if (user.getEmail() != null && !user.getEmail().isBlank()) {
                    existing.setEmail(user.getEmail());
                }
                doctorRepository.save(existing);
            },
            () -> {
                Doctor newDoc = Doctor.builder()
                        .name(user.getFullName())
                        .department((user.getDepartment() != null && !user.getDepartment().isBlank()) ? user.getDepartment() : "Critical Care")
                        .specialization((user.getSpecialization() != null && !user.getSpecialization().isBlank()) ? user.getSpecialization() : "Intensive Care Medicine")
                        .email(user.getEmail())
                        .phone("+1-555-0199")
                        .status("AVAILABLE")
                        .assignedPatientsCount(0)
                        .build();
                doctorRepository.save(newDoc);
            }
        );
    }

    private UserDTO convertToDTO(User u) {
        return UserDTO.builder()
                .id(u.getId())
                .username(u.getUsername())
                .email(u.getEmail())
                .password(null) // Never expose password hashes
                .fullName(u.getFullName())
                .role(u.getRole())
                .department(u.getDepartment())
                .specialization(u.getSpecialization())
                .shift(u.getShift())
                .isActive(u.getIsActive())
                .build();
    }
}
