package com.icucentralcommand.repository;

import com.icucentralcommand.model.Alert;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AlertRepository extends JpaRepository<Alert, Long> {
    List<Alert> findByIsReadFalseOrderByTimestampDesc();
    List<Alert> findAllByOrderByTimestampDesc();
    List<Alert> findByCategoryOrderByTimestampDesc(String category);
    boolean existsByPatientIdAndCategoryAndIsReadFalse(Long patientId, String category);
}
