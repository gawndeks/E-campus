-- ==============================================================================
-- eCampus International School - Advanced Production-Ready Database Schema
-- Version: 1.0 (Enterprise)
-- Features: RBAC, Soft Deletes, Audit Logs, Timestamps, Proper Indexing & FKs
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS \`ecampus_db\`;
USE \`ecampus_db\`;

SET FOREIGN_KEY_CHECKS = 0; -- Disable FK checks for clean drop

-- ==============================================================================
-- DROP EXISTING TABLES
-- ==============================================================================
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS login_history;
DROP TABLE IF EXISTS assignment_submissions;
DROP TABLE IF EXISTS assignments;
DROP TABLE IF EXISTS timetable;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS notices;
DROP TABLE IF EXISTS fee_payments;
DROP TABLE IF EXISTS fee_structure;
DROP TABLE IF EXISTS marks;
DROP TABLE IF EXISTS exams;
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS class_subjects;
DROP TABLE IF EXISTS subjects;
DROP TABLE IF EXISTS student_class_mapping;
DROP TABLE IF EXISTS sections;
DROP TABLE IF EXISTS classes;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS teachers;
DROP TABLE IF EXISTS parents;
DROP TABLE IF EXISTS role_permissions;
DROP TABLE IF EXISTS permissions;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;

SET FOREIGN_KEY_CHECKS = 1;

-- ==============================================================================
-- 1. AUTHENTICATION & RBAC (Role-Based Access Control)
-- ==============================================================================

-- Roles Table
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Permissions Table
CREATE TABLE permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE, -- e.g. 'view_students', 'edit_marks'
    module VARCHAR(50) NOT NULL, -- e.g. 'Students', 'Academics'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Role-Permission Mapping
CREATE TABLE role_permissions (
    role_id INT NOT NULL,
    permission_id INT NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Users Table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_id INT NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    status ENUM('active', 'suspended', 'pending') DEFAULT 'active',
    is_active BOOLEAN DEFAULT TRUE, -- Soft delete flag
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT,
    INDEX idx_user_email (email),
    INDEX idx_user_role (role_id)
) ENGINE=InnoDB;

-- ==============================================================================
-- 2. ADVANCED SECURITY & TRACKING
-- ==============================================================================

-- Login History
CREATE TABLE login_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    ip_address VARCHAR(45),
    user_agent VARCHAR(255),
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('success', 'failed') NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_login_user (user_id)
) ENGINE=InnoDB;

-- Admin Activity / Audit Logs
CREATE TABLE audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id INT, -- Nullable if system action
    action VARCHAR(100) NOT NULL, -- e.g. 'UPDATE_FEE', 'DELETE_STUDENT'
    table_name VARCHAR(50) NOT NULL,
    record_id INT NOT NULL,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_audit_table (table_name, record_id)
) ENGINE=InnoDB;

-- ==============================================================================
-- 3. CORE MODULES: PARENTS, TEACHERS, STUDENTS
-- ==============================================================================

CREATE TABLE parents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_primary VARCHAR(20) NOT NULL,
    phone_secondary VARCHAR(20),
    occupation VARCHAR(100),
    address TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE teachers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    expert_subject VARCHAR(100),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    qualification VARCHAR(150),
    date_of_joining DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    parent_id INT NOT NULL,
    admission_number VARCHAR(50) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    dob DATE NOT NULL,
    gender ENUM('Male', 'Female', 'Other') NOT NULL,
    blood_group VARCHAR(5),
    enrollment_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE RESTRICT,
    INDEX idx_student_parent (parent_id),
    INDEX idx_admission_no (admission_number)
) ENGINE=InnoDB;

-- ==============================================================================
-- 4. ACADEMICS: CLASSES, SECTIONS, SUBJECTS
-- ==============================================================================

CREATE TABLE classes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE, -- e.g. 'Grade 10'
    numeric_value INT NOT NULL, -- For sorting: 10
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE sections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    class_id INT NOT NULL,
    name VARCHAR(50) NOT NULL, -- e.g. 'A', 'B'
    class_teacher_id INT,
    capacity INT DEFAULT 30,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (class_teacher_id) REFERENCES teachers(id) ON DELETE SET NULL,
    UNIQUE KEY unique_class_section (class_id, name)
) ENGINE=InnoDB;

CREATE TABLE student_class_mapping (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    section_id INT NOT NULL,
    academic_year VARCHAR(20) NOT NULL, -- e.g. '2026-2027'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE RESTRICT,
    UNIQUE KEY unique_student_year (student_id, academic_year),
    INDEX idx_section (section_id)
) ENGINE=InnoDB;

CREATE TABLE subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(20) NOT NULL UNIQUE,
    type ENUM('Theory', 'Practical', 'Both') DEFAULT 'Theory',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE class_subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    class_id INT NOT NULL,
    subject_id INT NOT NULL,
    teacher_id INT NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    UNIQUE KEY unique_class_sub_year (class_id, subject_id, academic_year)
) ENGINE=InnoDB;

-- ==============================================================================
-- 5. TIMETABLE & ATTENDANCE
-- ==============================================================================

CREATE TABLE timetable (
    id INT AUTO_INCREMENT PRIMARY KEY,
    section_id INT NOT NULL,
    subject_id INT NOT NULL,
    teacher_id INT NOT NULL,
    day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    INDEX idx_timetable_section (section_id, day_of_week)
) ENGINE=InnoDB;

CREATE TABLE attendance (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    section_id INT NOT NULL,
    attendance_date DATE NOT NULL,
    status ENUM('Present', 'Absent', 'Late', 'Half-Day') NOT NULL,
    remarks VARCHAR(255),
    marked_by INT NOT NULL, -- Teacher ID who marked it
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE,
    FOREIGN KEY (marked_by) REFERENCES users(id) ON DELETE RESTRICT,
    UNIQUE KEY unique_student_date (student_id, attendance_date),
    INDEX idx_attendance_date (attendance_date),
    INDEX idx_attendance_section (section_id, attendance_date)
) ENGINE=InnoDB;

-- ==============================================================================
-- 6. EXAMS & MARKS
-- ==============================================================================

CREATE TABLE exams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL, -- e.g. 'Term 1 Finals'
    academic_year VARCHAR(20) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE marks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    exam_id INT NOT NULL,
    student_id INT NOT NULL,
    subject_id INT NOT NULL,
    marks_obtained DECIMAL(5,2) NOT NULL,
    max_marks DECIMAL(5,2) NOT NULL DEFAULT 100.00,
    remarks VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    UNIQUE KEY unique_student_exam_sub (exam_id, student_id, subject_id),
    INDEX idx_marks_student (student_id)
) ENGINE=InnoDB;

-- ==============================================================================
-- 7. ASSIGNMENTS
-- ==============================================================================

CREATE TABLE assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    class_subject_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    attachment_url VARCHAR(255),
    due_date DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (class_subject_id) REFERENCES class_subjects(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE assignment_submissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    assignment_id INT NOT NULL,
    student_id INT NOT NULL,
    submission_text TEXT,
    file_url VARCHAR(255),
    status ENUM('Pending', 'Submitted', 'Late', 'Graded') DEFAULT 'Pending',
    marks_awarded DECIMAL(5,2),
    submitted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE KEY unique_submission (assignment_id, student_id)
) ENGINE=InnoDB;

-- ==============================================================================
-- 8. FEE MANAGEMENT
-- ==============================================================================

CREATE TABLE fee_structure (
    id INT AUTO_INCREMENT PRIMARY KEY,
    class_id INT NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    fee_type VARCHAR(100) NOT NULL, -- e.g. 'Tuition', 'Transport'
    amount DECIMAL(10,2) NOT NULL,
    due_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE fee_payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    fee_structure_id INT NOT NULL,
    amount_paid DECIMAL(10,2) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_method ENUM('Cash', 'Bank Transfer', 'Credit Card', 'Online') NOT NULL,
    transaction_id VARCHAR(100) UNIQUE,
    status ENUM('Completed', 'Pending', 'Failed', 'Refunded') DEFAULT 'Completed',
    collected_by INT, -- Admin/Accountant User ID
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (fee_structure_id) REFERENCES fee_structure(id) ON DELETE RESTRICT,
    FOREIGN KEY (collected_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_fee_student (student_id)
) ENGINE=InnoDB;

-- ==============================================================================
-- 9. NOTICES & EVENTS
-- ==============================================================================

CREATE TABLE notices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    target_role_id INT NULL, -- If NULL, visible to all
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (target_role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    location VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ==============================================================================
-- SAMPLE INSERT DATA
-- ==============================================================================

-- Roles
INSERT INTO roles (id, name, description) VALUES 
(1, 'Admin', 'System Administrator with full access'),
(2, 'Teacher', 'Faculty member'),
(3, 'Student', 'Enrolled student'),
(4, 'Parent', 'Guardian of student');

-- Permissions (Sample)
INSERT INTO permissions (id, name, module) VALUES 
(1, 'manage_users', 'System'),
(2, 'manage_fees', 'Finance'),
(3, 'manage_attendance', 'Academics'),
(4, 'view_grades', 'Academics');

-- Role-Permissions (Admin gets all, Teacher gets attendance)
INSERT INTO role_permissions (role_id, permission_id) VALUES 
(1, 1), (1, 2), (1, 3), (1, 4),
(2, 3), (2, 4),
(3, 4), (4, 4);

-- Users (Password is 'password123' bcrypt hash)
INSERT INTO users (id, role_id, email, password_hash, status) VALUES 
(1, 1, 'admin@ecampus.edu', '$2b$10$T1Kq2bH9L3QYn6PjR/6YauXoE7i8P8c6Y1yQ0R4p8P8c6Y1yQ0R4p', 'active'),
(2, 2, 'teacher@ecampus.edu', '$2b$10$T1Kq2bH9L3QYn6PjR/6YauXoE7i8P8c6Y1yQ0R4p8P8c6Y1yQ0R4p', 'active'),
(3, 4, 'parent@client.com', '$2b$10$T1Kq2bH9L3QYn6PjR/6YauXoE7i8P8c6Y1yQ0R4p8P8c6Y1yQ0R4p', 'active'),
(4, 3, 'student@student.ecampus.edu', '$2b$10$T1Kq2bH9L3QYn6PjR/6YauXoE7i8P8c6Y1yQ0R4p8P8c6Y1yQ0R4p', 'active');

-- Teacher
INSERT INTO teachers (id, user_id, expert_subject, first_name, last_name, phone, qualification, date_of_joining) VALUES
(1, 2, 'Mathematics', 'Jane', 'Smith', '555-0101', 'M.Sc Math', '2019-08-01');

-- Parent
INSERT INTO parents (id, user_id, first_name, last_name, phone_primary, occupation) VALUES
(1, 3, 'Robert', 'Doe', '555-0202', 'Engineer');

-- Student
INSERT INTO students (id, user_id, parent_id, admission_number, first_name, last_name, dob, gender, enrollment_date) VALUES
(1, 4, 1, 'ADM-2026-001', 'John', 'Doe', '2010-05-15', 'Male', '2026-01-10');

-- Classes & Sections
INSERT INTO classes (id, name, numeric_value) VALUES (1, 'Grade 10', 10);
INSERT INTO sections (id, class_id, name, class_teacher_id) VALUES (1, 1, 'A', 1);

-- Mapping
INSERT INTO student_class_mapping (student_id, section_id, academic_year) VALUES (1, 1, '2026-2027');

-- Subjects & Class Subjects
INSERT INTO subjects (id, name, code) VALUES (1, 'Mathematics', 'MAT101');
INSERT INTO class_subjects (id, class_id, subject_id, teacher_id, academic_year) VALUES (1, 1, 1, 1, '2026-2027');

-- Attendance
INSERT INTO attendance (student_id, section_id, attendance_date, status, marked_by) VALUES
(1, 1, CURDATE(), 'Present', 2);

-- Fee Structure
INSERT INTO fee_structure (id, class_id, academic_year, fee_type, amount, due_date) VALUES
(1, 1, '2026-2027', 'Tuition Fee Term 1', 1500.00, '2026-09-01');

-- Notices
INSERT INTO notices (title, content, target_role_id, created_by) VALUES
('Welcome to Academic Year 2026', 'Classes begin promptly at 8 AM.', NULL, 1);
