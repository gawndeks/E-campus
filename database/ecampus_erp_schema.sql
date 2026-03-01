CREATE DATABASE IF NOT EXISTS ecampus_erp;
USE ecampus_erp;

-- =========================
-- ADMINS
-- =========================
CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(150) UNIQUE,
    password VARCHAR(255),
    role ENUM('super_admin','staff_admin') DEFAULT 'staff_admin',
    status TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL,
    deleted_at TIMESTAMP NULL
);

-- =========================
-- CLASSES & SECTIONS
-- =========================
CREATE TABLE classes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50),
    status TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL,
    deleted_at TIMESTAMP NULL
);

CREATE TABLE sections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    class_id INT,
    name VARCHAR(20),
    status TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (class_id) REFERENCES classes(id)
);

-- =========================
-- STUDENTS
-- =========================
CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admission_no VARCHAR(50) UNIQUE,
    name VARCHAR(100),
    dob DATE,
    gender ENUM('male','female','other'),
    class_id INT,
    section_id INT,
    parent_name VARCHAR(100),
    parent_phone VARCHAR(20),
    address TEXT,
    status TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (class_id) REFERENCES classes(id),
    FOREIGN KEY (section_id) REFERENCES sections(id)
);

-- =========================
-- TEACHERS
-- =========================
CREATE TABLE teachers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(150) UNIQUE,
    phone VARCHAR(20),
    designation VARCHAR(100),
    status TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL,
    deleted_at TIMESTAMP NULL
);

-- =========================
-- SUBJECTS
-- =========================
CREATE TABLE subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    code VARCHAR(50),
    status TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL,
    deleted_at TIMESTAMP NULL
);

CREATE TABLE class_subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    class_id INT,
    subject_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(class_id, subject_id),
    FOREIGN KEY (class_id) REFERENCES classes(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id)
);

CREATE TABLE teacher_subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id INT,
    class_id INT,
    subject_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id),
    FOREIGN KEY (class_id) REFERENCES classes(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id)
);

-- =========================
-- ATTENDANCE
-- =========================
CREATE TABLE attendance_students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    date DATE,
    status ENUM('present','absent','leave'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, date),
    FOREIGN KEY (student_id) REFERENCES students(id)
);

CREATE TABLE attendance_teachers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id INT,
    date DATE,
    status ENUM('present','absent','leave'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(teacher_id, date),
    FOREIGN KEY (teacher_id) REFERENCES teachers(id)
);

-- =========================
-- FEES
-- =========================
CREATE TABLE fees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    class_id INT,
    title VARCHAR(100),
    amount DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id)
);

CREATE TABLE fee_payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    fee_id INT,
    amount_paid DECIMAL(10,2),
    payment_mode ENUM('online','offline'),
    payment_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (fee_id) REFERENCES fees(id)
);

-- =========================
-- EXAMS & RESULTS
-- =========================
CREATE TABLE exams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    class_id INT,
    exam_date DATE,
    status TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id)
);

CREATE TABLE exam_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    exam_id INT,
    student_id INT,
    subject_id INT,
    marks DECIMAL(5,2),
    grade VARCHAR(5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(exam_id, student_id, subject_id),
    FOREIGN KEY (exam_id) REFERENCES exams(id),
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id)
);

-- =========================
-- TIMETABLE
-- =========================
CREATE TABLE timetables (
    id INT AUTO_INCREMENT PRIMARY KEY,
    class_id INT,
    section_id INT,
    subject_id INT,
    teacher_id INT,
    day_of_week ENUM('Mon','Tue','Wed','Thu','Fri','Sat'),
    start_time TIME,
    end_time TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id),
    FOREIGN KEY (section_id) REFERENCES sections(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (teacher_id) REFERENCES teachers(id)
);

-- =========================
-- NOTICES
-- =========================
CREATE TABLE notices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200),
    message TEXT,
    visible_for ENUM('students','teachers','all') DEFAULT 'all',
    status TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- =========================
-- CMS - WEBSITE PAGES
-- =========================
CREATE TABLE website_pages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(100) UNIQUE,
    title VARCHAR(150),
    content LONGTEXT,
    status TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL
);

-- =========================
-- CMS - HEADER MENU
-- =========================
CREATE TABLE header_menu (
    id INT AUTO_INCREMENT PRIMARY KEY,
    label VARCHAR(100),
    url VARCHAR(200),
    position INT,
    is_active TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- INDEXES (REAL WORLD)
-- =========================
CREATE INDEX idx_students_class ON students(class_id);
CREATE INDEX idx_students_section ON students(section_id);
CREATE INDEX idx_teacher_subjects_teacher ON teacher_subjects(teacher_id);
CREATE INDEX idx_attendance_students_date ON attendance_students(date);
CREATE INDEX idx_attendance_teachers_date ON attendance_teachers(date);
CREATE INDEX idx_fee_payments_student ON fee_payments(student_id);

-- INIT DEFAULT ADMIN
INSERT INTO admins (name, email, password, role) VALUES ('Super Admin', 'gawndeks@gmail.com', '12345', 'super_admin');
