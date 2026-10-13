USE icu_central_command;

-- Clear existing data
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE vitals;
TRUNCATE TABLE alerts;
TRUNCATE TABLE notifications;
TRUNCATE TABLE bed_assignments;
TRUNCATE TABLE icu_beds;
TRUNCATE TABLE patients;
TRUNCATE TABLE doctors;
TRUNCATE TABLE wards;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Insert Users (BCrypt hashes for Admin@123, Doctor@123, Nurse@123)
-- Passwords are BCrypt hashes: admin = Admin@123, doctor1/doctor2 = Doctor@123, nurse1/nurse2 = Nurse@123
INSERT INTO users (id, username, email, password, full_name, role, department, specialization, shift, is_active) VALUES
(1, 'admin', 'admin@hospital.com', '$2a$10$O/0NRmiT0VCFVQHNZAWCOOlglaU7LTqarf2qnfgyIYRx5w.MnXIM.', 'Hospital Administrator', 'ADMIN', 'Hospital Operations', 'Hospital Management', 'Full Day', TRUE),
(2, 'doctor1', 'doctor1@hospital.com', '$2a$10$W/8s6BwgomzUdy5PO/0Lx.gf/2WP5OdWrL2vaRiSQ.JOmUuz7I0HC', 'Dr. Arun Kumar', 'DOCTOR', 'Critical Care', 'Intensive Care Medicine', 'Day Shift', TRUE),
(3, 'nurse1', 'nurse1@hospital.com', '$2a$10$BuLhar5LLZUOawo0hCHW6.ozrApoIrkk.5gZvUEE8mBqFno1xoV6m', 'Priya Sharma', 'NURSE', 'ICU - 1st Floor', 'Critical Care Nursing', 'Morning', TRUE),
(4, 'doctor2', 'doctor2@hospital.com', '$2a$10$W/8s6BwgomzUdy5PO/0Lx.gf/2WP5OdWrL2vaRiSQ.JOmUuz7I0HC', 'Dr. Ananya Sharma', 'DOCTOR', 'Pulmonology', 'Pulmonologist & Intensivist', 'Day Shift', TRUE),
(5, 'nurse2', 'nurse2@hospital.com', '$2a$10$BuLhar5LLZUOawo0hCHW6.ozrApoIrkk.5gZvUEE8mBqFno1xoV6m', 'Sarah Jenkins', 'NURSE', 'ICU - 2nd Floor', 'Surgical ICU Nursing', 'Night', TRUE);

-- 2. Insert Wards
INSERT INTO wards (id, name, floor, unit_type, capacity, description) VALUES
(1, 'ICU - 1st Floor', '1st Floor', 'ICU', 16, 'Primary Medical ICU - 1st Floor'),
(2, 'ICU - 2nd Floor', '2nd Floor', 'ICU', 16, 'Surgical Critical Care ICU - 2nd Floor'),
(3, 'Med-Surg ICU', '3rd Floor', 'Med-Surg', 8, 'Combined Medical and Surgical Unit'),
(4, 'ER Critical Care', 'Ground Floor', 'ER', 6, 'Emergency Resuscitation & Critical Care Unit'),
(5, 'Telemetry', '4th Floor', 'Telemetry', 2, 'Cardiac & Vital Telemetry Unit');

-- 3. Insert Doctors
INSERT INTO doctors (id, name, department, specialization, phone, email, status, assigned_patients_count) VALUES
(1, 'Dr. Arun Kumar', 'Critical Care', 'Intensive Care Medicine', '+1-555-0101', 'arun.kumar@hospital.com', 'ON_DUTY', 6),
(2, 'Dr. Ananya Sharma', 'Pulmonology', 'Pulmonologist & Intensivist', '+1-555-0102', 'ananya.sharma@hospital.com', 'ON_DUTY', 4),
(3, 'Dr. Vikram Patel', 'Cardiology ICU', 'Interventional Cardiologist', '+1-555-0103', 'vikram.patel@hospital.com', 'AVAILABLE', 3),
(4, 'Dr. Elena Rostova', 'Neuro ICU', 'Neuro Intensivist', '+1-555-0104', 'elena.rostova@hospital.com', 'ON_CALL', 2);

-- 4. Insert Patients
INSERT INTO patients (id, patient_id, name, age, gender, admission_time, condition_status, assigned_doctor_id, diagnosis, equipment_required, notes) VALUES
(1, 'P1001', 'Arjun Kumar', 45, 'M', NOW() - INTERVAL 3 DAY, 'CRITICAL', 1, 'Acute Respiratory Distress Syndrome', 'Ventilator', 'Intubated. Continuous ABG monitoring.'),
(2, 'P1002', 'Meera Sharma', 62, 'F', NOW() - INTERVAL 5 DAY, 'STABLE', 1, 'Severe Pneumonia & Hypoxia', 'Oxygen Support', 'High-flow nasal cannula at 40L/min.'),
(3, 'P1003', 'Ravi Verma', 58, 'M', NOW() - INTERVAL 1 DAY, 'STABLE', 2, 'Post-Op Coronary Artery Bypass', 'BiPAP', 'Post-CABG day 1. Stable vitals.'),
(4, 'P1004', 'Sneha Reddy', 36, 'F', NOW() - INTERVAL 2 DAY, 'GUARDED', 1, 'Septic Shock (Post-Abdominal Surgery)', 'monitoring', 'Broad spectrum antibiotics IV running.'),
(5, 'P1005', 'Karthik V.', 71, 'M', NOW() - INTERVAL 4 DAY, 'CRITICAL', 3, 'Acute Myocardial Infarction', 'Ventilator', 'IABP in place. Hemodynamic monitoring.'),
(6, 'P1006', 'Lakshmi P.', 49, 'F', NOW() - INTERVAL 6 DAY, 'STABLE', 2, 'Exacerbation of COPD', 'Oxygen Support', 'Step-down weaning trial in progress.');

-- 5. Insert ICU Beds (48 Beds)
-- Ward 1 (ICU - 1st Floor: 16 beds)
INSERT INTO icu_beds (id, bed_number, ward_id, status, cleaning_est_minutes, equipment) VALUES
(1, 'ICU-101', 1, 'AVAILABLE', 0, 'Ready for admission'),
(2, 'ICU-102', 1, 'OCCUPIED', 0, 'Ventilator'),
(3, 'ICU-103', 1, 'CLEANING', 45, 'Deep disinfection in progress'),
(4, 'ICU-104', 1, 'OCCUPIED', 0, 'Oxygen Support'),
(5, 'ICU-105', 1, 'OCCUPIED', 0, 'BiPAP'),
(6, 'ICU-106', 1, 'MAINTENANCE', 120, 'Under maintenance'),
(7, 'ICU-107', 1, 'OCCUPIED', 0, 'monitoring'),
(8, 'ICU-108', 1, 'AVAILABLE', 0, 'Ready for admission'),
(9, 'ICU-109', 1, 'OCCUPIED', 0, 'Ventilator'),
(10, 'ICU-110', 1, 'AVAILABLE', 0, 'Ready for admission'),
(11, 'ICU-111', 1, 'AVAILABLE', 0, 'Ready for admission'),
(12, 'ICU-112', 1, 'OCCUPIED', 0, 'Ventilator'),
(13, 'ICU-113', 1, 'CLEANING', 20, 'Cleaning in progress'),
(14, 'ICU-114', 1, 'AVAILABLE', 0, 'Ready for admission'),
(15, 'ICU-115', 1, 'OCCUPIED', 0, 'Oxygen Support'),
(16, 'ICU-116', 1, 'AVAILABLE', 0, 'Ready for admission');

-- Ward 2 (ICU - 2nd Floor: 16 beds)
INSERT INTO icu_beds (id, bed_number, ward_id, status, cleaning_est_minutes, equipment) VALUES
(17, 'ICU-201', 2, 'OCCUPIED', 0, 'Chest Tube & Ventilator'),
(18, 'ICU-202', 2, 'OCCUPIED', 0, 'ICP Monitor'),
(19, 'ICU-203', 2, 'OCCUPIED', 0, 'Ventilator'),
(20, 'ICU-204', 2, 'OCCUPIED', 0, 'Telemetry Monitor'),
(21, 'ICU-205', 2, 'AVAILABLE', 0, 'Ready for admission'),
(22, 'ICU-206', 2, 'MAINTENANCE', 90, 'Sensor calibration'),
(23, 'ICU-207', 2, 'OCCUPIED', 0, 'Oxygen Support'),
(24, 'ICU-208', 2, 'OCCUPIED', 0, 'BiPAP'),
(25, 'ICU-209', 2, 'OCCUPIED', 0, 'Ventilator'),
(26, 'ICU-210', 2, 'OCCUPIED', 0, 'monitoring'),
(27, 'ICU-211', 2, 'AVAILABLE', 0, 'Ready for admission'),
(28, 'ICU-212', 2, 'OCCUPIED', 0, 'Oxygen Support'),
(29, 'ICU-213', 2, 'MAINTENANCE', 180, 'Bed motor repair'),
(30, 'ICU-214', 2, 'OCCUPIED', 0, 'Ventilator'),
(31, 'ICU-215', 2, 'AVAILABLE', 0, 'Ready for admission'),
(32, 'ICU-216', 2, 'OCCUPIED', 0, 'BiPAP');

-- Ward 3 (Med-Surg ICU: 8 beds)
INSERT INTO icu_beds (id, bed_number, ward_id, status, cleaning_est_minutes, equipment) VALUES
(33, 'MS-301', 3, 'OCCUPIED', 0, 'Telemetry'),
(34, 'MS-302', 3, 'OCCUPIED', 0, 'Oxygen Support'),
(35, 'MS-303', 3, 'AVAILABLE', 0, 'Ready for admission'),
(36, 'MS-304', 3, 'OCCUPIED', 0, 'BiPAP'),
(37, 'MS-305', 3, 'AVAILABLE', 0, 'Ready for admission'),
(38, 'MS-306', 3, 'OCCUPIED', 0, 'monitoring'),
(39, 'MS-307', 3, 'OCCUPIED', 0, 'Oxygen Support'),
(40, 'MS-308', 3, 'AVAILABLE', 0, 'Ready for admission');

-- Ward 4 (ER Critical Care: 6 beds)
INSERT INTO icu_beds (id, bed_number, ward_id, status, cleaning_est_minutes, equipment) VALUES
(41, 'ER-401', 4, 'OCCUPIED', 0, 'Emergency Ventilator'),
(42, 'ER-402', 4, 'OCCUPIED', 0, 'Resuscitation Monitor'),
(43, 'ER-403', 4, 'AVAILABLE', 0, 'Ready for admission'),
(44, 'ER-404', 4, 'OCCUPIED', 0, 'Oxygen Support'),
(45, 'ER-405', 4, 'OCCUPIED', 0, 'BiPAP'),
(46, 'ER-406', 4, 'AVAILABLE', 0, 'Ready for admission');

-- Ward 5 (Telemetry: 2 beds)
INSERT INTO icu_beds (id, bed_number, ward_id, status, cleaning_est_minutes, equipment) VALUES
(47, 'TEL-501', 5, 'AVAILABLE', 0, 'Cardiac Telemetry'),
(48, 'TEL-502', 5, 'MAINTENANCE', 60, 'Telemetry Hub Service');

-- 6. Insert Bed Assignments
INSERT INTO bed_assignments (id, patient_id, bed_id, assigned_at, status) VALUES
(1, 1, 2, NOW() - INTERVAL 3 DAY, 'ACTIVE'),  -- Arjun Kumar in ICU-102
(2, 2, 4, NOW() - INTERVAL 5 DAY, 'ACTIVE'),  -- Meera Sharma in ICU-104
(3, 3, 7, NOW() - INTERVAL 1 DAY, 'ACTIVE'),  -- Ravi Verma in ICU-107
(4, 4, 9, NOW() - INTERVAL 2 DAY, 'ACTIVE'),  -- Sneha Reddy in ICU-109
(5, 5, 12, NOW() - INTERVAL 4 DAY, 'ACTIVE'), -- Karthik V. in ICU-112
(6, 6, 15, NOW() - INTERVAL 6 DAY, 'ACTIVE'); -- Lakshmi P. in ICU-115

-- 7. Insert Vitals
INSERT INTO vitals (patient_id, heart_rate, spo2, blood_pressure, temperature, respiratory_rate) VALUES
(1, 118, 92, '138/88', 38.5, 24),
(2, 78, 97, '122/78', 36.9, 16),
(3, 84, 98, '118/74', 37.1, 18),
(4, 102, 94, '110/68', 38.1, 22),
(5, 124, 91, '145/92', 37.8, 26),
(6, 72, 96, '125/80', 36.8, 15);

-- 8. Insert Operational Alerts
INSERT INTO alerts (id, title, description, category, is_read, bed_id, patient_id) VALUES
(1, 'High patient load', 'ICU - 2nd Floor is at 85% capacity', 'CRITICAL', FALSE, NULL, NULL),
(2, 'Bed cleaning delayed', 'ICU-113 cleaning taking longer than expected', 'WARNING', FALSE, 13, NULL),
(3, 'Low SpO2 Alert', 'Patient Arjun Kumar (ICU-102) SpO2 dropped below 93%', 'CRITICAL', FALSE, 2, 1),
(4, 'Bed Maintenance Due', 'ICU-106 scheduled preventive maintenance', 'INFORMATION', TRUE, 6, NULL);

-- 9. Insert Notifications
INSERT INTO notifications (id, title, message, type, is_read) VALUES
(1, 'System Operational', 'All ICU monitoring nodes connected.', 'INFO', TRUE),
(2, 'Critical Capacity', 'ICU - 2nd Floor reaching maximum threshold.', 'WARNING', FALSE);
