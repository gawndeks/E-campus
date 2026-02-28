-- Database setup for eCampus School Management System
CREATE DATABASE IF NOT EXISTS ecampus_db;
USE ecampus_db;

-- ==========================================================
-- 1. Users Table (Core Auth)
-- ==========================================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'teacher', 'admin') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ==========================================================
-- 4. Classes Table 
-- (Created early as it's a foundation for FKs)
-- ==========================================================
CREATE TABLE IF NOT EXISTS classes (
    class_id INT AUTO_INCREMENT PRIMARY KEY,
    class_name VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- ==========================================================
-- 2. Students Table
-- ==========================================================
CREATE TABLE IF NOT EXISTS students (
    student_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    roll_no VARCHAR(20) NOT NULL UNIQUE,
    class_id INT NOT NULL,
    section VARCHAR(10),
    gender ENUM('Male', 'Female', 'Other'),
    dob DATE,
    phone VARCHAR(20),
    address TEXT,
    photo VARCHAR(255),
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(class_id) ON DELETE RESTRICT,
    INDEX idx_user_id (user_id),
    INDEX idx_class_id (class_id)
) ENGINE=InnoDB;

-- ==========================================================
-- 3. Teachers Table
-- ==========================================================
CREATE TABLE IF NOT EXISTS teachers (
    teacher_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    qualification VARCHAR(100),
    experience INT COMMENT 'Years of experience',
    photo VARCHAR(255),
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB;

-- ==========================================================
-- 5. Subjects Table
-- ==========================================================
CREATE TABLE IF NOT EXISTS subjects (
    subject_id INT AUTO_INCREMENT PRIMARY KEY,
    subject_name VARCHAR(100) NOT NULL,
    class_id INT NOT NULL,
    FOREIGN KEY (class_id) REFERENCES classes(class_id) ON DELETE CASCADE,
    INDEX idx_class_id (class_id)
) ENGINE=InnoDB;

-- ==========================================================
-- 6. Teacher Subjects Table (Mapping Teachers to Classes & Subjects)
-- ==========================================================
CREATE TABLE IF NOT EXISTS teacher_subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id INT NOT NULL,
    subject_id INT NOT NULL,
    class_id INT NOT NULL,
    FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(subject_id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(class_id) ON DELETE CASCADE,
    UNIQUE KEY unique_assignment (teacher_id, subject_id, class_id),
    INDEX idx_teacher_id (teacher_id),
    INDEX idx_subject_id (subject_id),
    INDEX idx_class_id (class_id)
) ENGINE=InnoDB;

-- ==========================================================
-- 7. Attendance Table
-- ==========================================================
CREATE TABLE IF NOT EXISTS attendance (
    attendance_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    class_id INT NOT NULL,
    subject_id INT, -- Nullable if attendance is taken per day rather than per subject
    date DATE NOT NULL,
    status ENUM('present', 'absent', 'late', 'half_day') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(class_id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(subject_id) ON DELETE SET NULL,
    INDEX idx_student_id (student_id),
    INDEX idx_class_id (class_id),
    INDEX idx_date (date)
) ENGINE=InnoDB;

-- ==========================================================
-- 8. Assignments Table
-- ==========================================================
CREATE TABLE IF NOT EXISTS assignments (
    assignment_id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id INT NOT NULL,
    class_id INT NOT NULL,
    subject_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    file_path VARCHAR(255),
    due_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(class_id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(subject_id) ON DELETE CASCADE,
    INDEX idx_teacher_class (teacher_id, class_id)
) ENGINE=InnoDB;

-- ==========================================================
-- 9. Assignment Submissions Table
-- ==========================================================
CREATE TABLE IF NOT EXISTS assignment_submissions (
    submission_id INT AUTO_INCREMENT PRIMARY KEY,
    assignment_id INT NOT NULL,
    student_id INT NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'submitted', 'graded', 'late') DEFAULT 'submitted',
    FOREIGN KEY (assignment_id) REFERENCES assignments(assignment_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    UNIQUE KEY unique_submission (assignment_id, student_id),
    INDEX idx_assignment_id (assignment_id),
    INDEX idx_student_id (student_id)
) ENGINE=InnoDB;

-- ==========================================================
-- 10. Study Materials Table
-- ==========================================================
CREATE TABLE IF NOT EXISTS study_materials (
    material_id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id INT NOT NULL,
    class_id INT NOT NULL,
    subject_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(class_id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(subject_id) ON DELETE CASCADE,
    INDEX idx_class_subject (class_id, subject_id)
) ENGINE=InnoDB;

-- ==========================================================
-- 11. Exams Table
-- ==========================================================
CREATE TABLE IF NOT EXISTS exams (
    exam_id INT AUTO_INCREMENT PRIMARY KEY,
    exam_name VARCHAR(100) NOT NULL,
    class_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(class_id) ON DELETE CASCADE,
    INDEX idx_class_id (class_id)
) ENGINE=InnoDB;

-- ==========================================================
-- 12. Marks Table
-- ==========================================================
CREATE TABLE IF NOT EXISTS marks (
    mark_id INT AUTO_INCREMENT PRIMARY KEY,
    exam_id INT NOT NULL,
    student_id INT NOT NULL,
    subject_id INT NOT NULL,
    marks DECIMAL(5, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exam_id) REFERENCES exams(exam_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(subject_id) ON DELETE CASCADE,
    UNIQUE KEY unique_mark (exam_id, student_id, subject_id),
    INDEX idx_exam_student (exam_id, student_id)
) ENGINE=InnoDB;

-- ==========================================================
-- 13. Fees Table
-- ==========================================================
CREATE TABLE IF NOT EXISTS fees (
    fee_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    paid_amount DECIMAL(10, 2) DEFAULT 0.00,
    due_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('paid', 'partial', 'pending') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    INDEX idx_student_id (student_id)
) ENGINE=InnoDB;

-- ==========================================================
-- 14. Fee Payments Table
-- ==========================================================
CREATE TABLE IF NOT EXISTS fee_payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    fee_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_date DATE NOT NULL,
    mode ENUM('cash', 'card', 'bank_transfer', 'online') NOT NULL,
    reference_no VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fee_id) REFERENCES fees(fee_id) ON DELETE CASCADE,
    INDEX idx_fee_id (fee_id)
) ENGINE=InnoDB;

-- ==========================================================
-- 15. Notices Table
-- ==========================================================
CREATE TABLE IF NOT EXISTS notices (
    notice_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    class_id INT, -- Nullable for whole school notices
    created_by ENUM('teacher', 'admin') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(class_id) ON DELETE CASCADE,
    INDEX idx_class_id (class_id)
) ENGINE=InnoDB;

-- ==========================================================
-- 16. Doubts Table
-- ==========================================================
CREATE TABLE IF NOT EXISTS doubts (
    doubt_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    teacher_id INT NOT NULL,
    subject_id INT NOT NULL,
    message TEXT NOT NULL,
    reply TEXT,
    status ENUM('pending', 'resolved') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(subject_id) ON DELETE CASCADE,
    INDEX idx_student_id (student_id),
    INDEX idx_teacher_id (teacher_id)
) ENGINE=InnoDB;

-- ==========================================================
-- 17. Timetable Table
-- ==========================================================
CREATE TABLE IF NOT EXISTS timetable (
    timetable_id INT AUTO_INCREMENT PRIMARY KEY,
    class_id INT NOT NULL,
    subject_id INT NOT NULL,
    teacher_id INT NOT NULL,
    day ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    FOREIGN KEY (class_id) REFERENCES classes(class_id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(subject_id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id) ON DELETE CASCADE,
    INDEX idx_class_day (class_id, day),
    INDEX idx_teacher_day (teacher_id, day)
) ENGINE=InnoDB;

-- ==========================================================
-- Other Tables (From previous requests, appended for completeness)
-- ==========================================================

-- Admission Enquiries Table (Public Facing)
CREATE TABLE IF NOT EXISTS admission_enquiries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_name VARCHAR(100) NOT NULL,
    parent_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    class_applying VARCHAR(20) NOT NULL,
    message TEXT,
    status ENUM('Pending', 'Reviewed', 'Contacted') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Gallery Table (Public Facing)
CREATE TABLE IF NOT EXISTS gallery (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    image_path VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Admin Users Table (Legacy compat)
CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ==========================================
-- DUMMY DATA INSERTION
-- ==========================================

-- Dummy Admin User
INSERT IGNORE INTO admin_users (username, password_hash) VALUES 
('admin', '$2b$10$wT20pXpP2.kF3Yy5AXXS..5M5V3dJw7Z.J5mZ8rK1bXqG4vHwM9bO');

-- Dummy User Accounts for test Student and test Teacher
INSERT IGNORE INTO users (id, email, password, role) VALUES 
(1, 'student@ecampus.com', '$2b$10$wT20pXpP2.kF3Yy5AXXS..5M5V3dJw7Z.J5mZ8rK1bXqG4vHwM9bO', 'student'),
(2, 'teacher@ecampus.com', '$2b$10$wT20pXpP2.kF3Yy5AXXS..5M5V3dJw7Z.J5mZ8rK1bXqG4vHwM9bO', 'teacher');

-- Dummy Classes
INSERT IGNORE INTO classes (class_id, class_name) VALUES 
(1, 'Grade 10 - A'),
(2, 'Grade 10 - B');

-- Dummy Students
INSERT IGNORE INTO students (student_id, user_id, full_name, roll_no, class_id, status) VALUES 
(1, 1, 'John Doe', '10A-001', 1, 'active');

-- Dummy Teachers
INSERT IGNORE INTO teachers (teacher_id, user_id, full_name, qualification, experience, status) VALUES 
(1, 2, 'Jane Smith', 'M.Sc. Mathematics', 5, 'active');

-- Dummy Subjects
INSERT IGNORE INTO subjects (subject_id, subject_name, class_id) VALUES 
(1, 'Mathematics', 1),
(2, 'Science', 1);

-- Map Teacher to Subject
INSERT IGNORE INTO teacher_subjects (teacher_id, subject_id, class_id) VALUES 
(1, 1, 1);

-- Dummy Notices (New schema)
INSERT INTO notices (title, message, created_by) VALUES 
('Terminal Exam Schedule for Grades 6-10', 'The terminal examinations for grades 6 through 10 will commence on October 15th.', 'admin'),
('Annual Sports Meet 2026', 'We are excited to announce our upcoming Annual Sports Meet! Students can register for track and field events with their class teachers.', 'admin');

-- Dummy Gallery Images
INSERT INTO gallery (title, image_path) VALUES 
('Campus Front View', '/public/images/campus-front.jpg'),
('Science Laboratory', '/public/images/science-lab.jpg');
