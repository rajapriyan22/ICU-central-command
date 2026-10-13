package com.icucentralcommand.service;

import com.icucentralcommand.exception.ResourceNotFoundException;
import com.icucentralcommand.model.Doctor;
import com.icucentralcommand.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DoctorService {

    private final DoctorRepository doctorRepository;

    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    public Doctor getDoctorById(Long id) {
        return doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id " + id));
    }

    public Doctor createDoctor(Doctor doctor) {
        if (doctor.getStatus() == null) {
            doctor.setStatus("AVAILABLE");
        }
        if (doctor.getAssignedPatientsCount() == null) {
            doctor.setAssignedPatientsCount(0);
        }
        return doctorRepository.save(doctor);
    }
}
