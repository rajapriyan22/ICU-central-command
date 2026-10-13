package com.icucentralcommand.repository;

import com.icucentralcommand.model.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    List<Doctor> findByStatus(String status);
    List<Doctor> findByDepartment(String department);
    Optional<Doctor> findByName(String name);
}
