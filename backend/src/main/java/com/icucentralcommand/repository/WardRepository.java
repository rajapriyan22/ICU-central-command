package com.icucentralcommand.repository;

import com.icucentralcommand.model.Ward;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface WardRepository extends JpaRepository<Ward, Long> {
    List<Ward> findByUnitType(String unitType);
    List<Ward> findByFloor(String floor);
}
