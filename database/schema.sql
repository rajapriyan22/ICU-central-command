-- ICU Central Command Database Schema
CREATE DATABASE IF NOT EXISTS icu_central_command;
USE icu_central_command;

-- Drop tables if they exist (in reverse dependency order)
DROP TABLE IF EXISTS vitals;
DROP TABLE IF EXISTS alerts;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS bed_assignments;
DROP TABLE IF EXISTS icu_beds;
DROP TABLE IF EXISTS patients;
DROP TABLE IF EXISTS doctors;
DROP TABLE IF EXISTS wards;
DROP TABLE IF EXISTS users;

-- 1. Users table (Authentication & Roles: ADMIN, DOCTOR, NURSE)
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'ADMIN', -- ADMIN, DOCTOR, NURSE
    department VARCHAR(100) DEFAULT 'ICU Operations',
    specialization VARCHAR(100) DEFAULT NULL,
    shift VARCHAR(50) DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    avatar_url VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Wards table
CREATE TABLE wards (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE, -- e.g., 'ICU - 1st Floor', 'Med-Surg ICU'
    floor VARCHAR(50) NOT NULL,        -- e.g., '1st Floor', '2nd Floor'
    unit_type VARCHAR(50) NOT NULL,    -- e.g., 'ICU', 'Med-Surg', 'ER', 'Telemetry'
    capacity INT NOT NULL DEFAULT 16,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Doctors table
CREATE TABLE doctors (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL DEFAULT 'Intensive Care Unit',
    specialization VARCHAR(100) NOT NULL DEFAULT 'Critical Care Specialist',
    phone VARCHAR(20),
    email VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'ON_DUTY', -- ON_DUTY, AVAILABLE, ON_CALL, OFF_DUTY
    assigned_patients_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. ICU Beds table
CREATE TABLE icu_beds (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    bed_number VARCHAR(20) NOT NULL UNIQUE, -- e.g., 'ICU-101'
    ward_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE', -- AVAILABLE, OCCUPIED, CLEANING, MAINTENANCE
    cleaning_est_minutes INT DEFAULT 0,
    equipment VARCHAR(255) DEFAULT 'Standard ICU Monitor',
    notes VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ward_id) REFERENCES wards(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Patients table
CREATE TABLE patients (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id VARCHAR(20) NOT NULL UNIQUE, -- e.g., 'P1001'
    name VARCHAR(100) NOT NULL,
    age INT NOT NULL,
    gender VARCHAR(10) NOT NULL,
    admission_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    condition_status VARCHAR(20) NOT NULL DEFAULT 'STABLE', -- CRITICAL, STABLE, GUARDED
    assigned_doctor_id BIGINT,
    diagnosis VARCHAR(255),
    equipment_required VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_doctor_id) REFERENCES doctors(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Bed Assignments table
CREATE TABLE bed_assignments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    bed_id BIGINT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    released_at TIMESTAMP NULL DEFAULT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, RELEASED, TRANSFERRED
    notes VARCHAR(255),
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (bed_id) REFERENCES icu_beds(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Alerts table
CREATE TABLE alerts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    category VARCHAR(20) NOT NULL DEFAULT 'INFORMATION', -- CRITICAL, WARNING, INFORMATION
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE,
    bed_id BIGINT NULL,
    patient_id BIGINT NULL,
    FOREIGN KEY (bed_id) REFERENCES icu_beds(id) ON DELETE SET NULL,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Vitals table (Telemetry log)
CREATE TABLE vitals (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    heart_rate INT NOT NULL,           -- bpm
    spo2 INT NOT NULL,                 -- %
    blood_pressure VARCHAR(20) NOT NULL, -- mmHg e.g. "120/80"
    temperature DECIMAL(4,1) NOT NULL, -- Celsius
    respiratory_rate INT NOT NULL,     -- breaths/min
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. Notifications table
CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    message VARCHAR(255) NOT NULL,
    type VARCHAR(30) NOT NULL DEFAULT 'INFO',
    is_read BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
