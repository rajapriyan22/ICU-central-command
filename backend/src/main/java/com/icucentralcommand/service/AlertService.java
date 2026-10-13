package com.icucentralcommand.service;

import com.icucentralcommand.exception.ResourceNotFoundException;
import com.icucentralcommand.model.Alert;
import com.icucentralcommand.repository.AlertRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AlertService {

    private final AlertRepository alertRepository;

    public List<Alert> getAllAlerts(String category) {
        if (category != null && !category.isBlank() && !category.equalsIgnoreCase("ALL")) {
            return alertRepository.findByCategoryOrderByTimestampDesc(category);
        }
        return alertRepository.findAllByOrderByTimestampDesc();
    }

    public Alert markAsRead(Long id) {
        Alert alert = alertRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Alert not found with id " + id));
        alert.setIsRead(true);
        return alertRepository.save(alert);
    }

    public Alert createAlert(Alert alert) {
        if (alert.getTimestamp() == null) {
            alert.setTimestamp(LocalDateTime.now());
        }
        if (alert.getIsRead() == null) {
            alert.setIsRead(false);
        }
        return alertRepository.save(alert);
    }
}
