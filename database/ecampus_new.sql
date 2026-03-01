CREATE DATABASE IF NOT EXISTS ecampus_db;
USE ecampus_db;

-- 1. Drop existing tables if they exist to start fresh
DROP TABLE IF EXISTS results;
DROP TABLE IF EXISTS exams;
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS assignments;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS teachers;

-- 2. CREATE TABLES
CREATE TABLE teachers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    subject VARCHAR(100),
    hire_date DATE
);

CREATE TABLE courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_name VARCHAR(100) NOT NULL,
    course_code VARCHAR(50) NOT NULL UNIQUE,
    teacher_id INT NOT NULL,
    description TEXT,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
);

CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    course_id INT,
    enrollment_date DATE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL
);

CREATE TABLE assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    course_id INT NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    date DATE NOT NULL,
    status ENUM('Present', 'Absent', 'Late') NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE exams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    exam_name VARCHAR(100) NOT NULL,
    exam_date DATE NOT NULL,
    total_marks INT NOT NULL,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    exam_id INT NOT NULL,
    marks_obtained INT NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
);

-- 3. INSERT DUMMY DATA
-- Teachers
INSERT INTO teachers (name, email, phone, password, subject, hire_date) VALUES
('Dr. Rajesh Sharma', 'rajesh.sharma@ecampus.edu', '555-0101', 'teach123', 'Mathematics', '2020-01-15'),
('Ms. Anjali Verma', 'anjali.verma@ecampus.edu', '555-0102', 'teach123', 'Physics', '2020-01-15'),
('Mr. Rohan Mehta', 'rohan.mehta@ecampus.edu', '555-0103', 'teach123', 'Chemistry', '2020-01-15'),
('Dr. Isha Gupta', 'isha.gupta@ecampus.edu', '555-0104', 'teach123', 'Biology', '2020-01-15'),
('Ms. Priya Kapoor', 'priya.kapoor@ecampus.edu', '555-0105', 'teach123', 'Computer Science', '2020-01-15'),
('Mr. Arjun Reddy', 'arjun.reddy@ecampus.edu', '555-0106', 'teach123', 'English Literature', '2020-01-15'),
('Dr. Kabir Singh', 'kabir.singh@ecampus.edu', '555-0107', 'teach123', 'History', '2020-01-15'),
('Ms. Sanya Jain', 'sanya.jain@ecampus.edu', '555-0108', 'teach123', 'Geography', '2020-01-15'),
('Mr. Dev Malhotra', 'dev.malhotra@ecampus.edu', '555-0109', 'teach123', 'Economics', '2020-01-15'),
('Ms. Tara Nair', 'tara.nair@ecampus.edu', '555-0110', 'teach123', 'Art', '2020-01-15'),
('Mr. Arjun Desai', 'arjun.desai@ecampus.edu', '555-0111', 'teach123', 'Music', '2020-01-15'),
('Ms. Kiara Patel', 'kiara.patel@ecampus.edu', '555-0112', 'teach123', 'Physical Education', '2020-01-15'),
('Mr. Aryan Bhatia', 'aryan.bhatia@ecampus.edu', '555-0113', 'teach123', 'Spanish', '2020-01-15'),
('Ms. Meera Chawla', 'meera.chawla@ecampus.edu', '555-0114', 'teach123', 'French', '2020-01-15'),
('Dr. Ritvik Arora', 'ritvik.arora@ecampus.edu', '555-0115', 'teach123', 'Psychology', '2020-01-15');
-- Courses
INSERT INTO courses (course_name, course_code, teacher_id, description) VALUES
('Advanced Mathematics', 'MATH301', 1, 'Calculus and Algebra.'),
('Quantum Physics', 'PHYS400', 2, 'Introduction to quantum mechanics.'),
('Organic Chemistry', 'CHEM200', 3, 'Carbon-based compounds study.'),
('Software Engineering', 'CS500', 5, 'Software design patterns.'),
('World History', 'HIST101', 7, 'Global historical events.'),
('Macro Economics', 'ECON201', 9, 'Economic systems at scale.'),
('Music Theory', 'MUS101', 11, 'Fundamentals of music.'),
('Spanish 1', 'LANG101', 13, 'Beginner Spanish conversation.');

-- Students
INSERT INTO students (name, email, phone, password, course_id, enrollment_date) VALUES
('Aarav Sharma', 'aarav.sharma@student.ecampus.edu', '555-1101', 'password123', 1, '2024-09-01'),
('Ananya Verma', 'ananya.verma@student.ecampus.edu', '555-1102', 'password123', 2, '2024-09-01'),
('Rohan Mehta', 'rohan.mehta@student.ecampus.edu', '555-1103', 'password123', 3, '2024-09-01'),
('Isha Gupta', 'isha.gupta@student.ecampus.edu', '555-1104', 'password123', 4, '2024-09-01'),
('Vivaan Kapoor', 'vivaan.kapoor@student.ecampus.edu', '555-1105', 'password123', 5, '2024-09-01'),
('Anika Reddy', 'anika.reddy@student.ecampus.edu', '555-1106', 'password123', 6, '2024-09-01'),
('Kabir Singh', 'kabir.singh@student.ecampus.edu', '555-1107', 'password123', 7, '2024-09-01'),
('Sanya Jain', 'sanya.jain@student.ecampus.edu', '555-1108', 'password123', 8, '2024-09-01'),
('Dev Malhotra', 'dev.malhotra@student.ecampus.edu', '555-1109', 'password123', 1, '2024-09-01'),
('Tara Nair', 'tara.nair@student.ecampus.edu', '555-1110', 'password123', 2, '2024-09-01'),
('Arjun Desai', 'arjun.desai@student.ecampus.edu', '555-1111', 'password123', 3, '2024-09-01'),
('Kiara Patel', 'kiara.patel@student.ecampus.edu', '555-1112', 'password123', 4, '2024-09-01'),
('Aryan Bhatia', 'aryan.bhatia@student.ecampus.edu', '555-1113', 'password123', 5, '2024-09-01'),
('Meera Chawla', 'meera.chawla@student.ecampus.edu', '555-1114', 'password123', 6, '2024-09-01'),
('Ritvik Arora', 'ritvik.arora@student.ecampus.edu', '555-1115', 'password123', 7, '2024-09-01'),
('Suhani Rao', 'suhani.rao@student.ecampus.edu', '555-1116', 'password123', 8, '2024-09-01'),
('Advait Kapoor', 'advait.kapoor@student.ecampus.edu', '555-1117', 'password123', 1, '2024-09-01'),
('Rhea Mishra', 'rhea.mishra@student.ecampus.edu', '555-1118', 'password123', 2, '2024-09-01'),
('Kian Sethi', 'kian.sethi@student.ecampus.edu', '555-1119', 'password123', 3, '2024-09-01'),
('Diya Singh', 'diya.singh@student.ecampus.edu', '555-1120', 'password123', 4, '2024-09-01'),
('Shaurya Jain', 'shaurya.jain@student.ecampus.edu', '555-1121', 'password123', 5, '2024-09-01'),
('Tania Chopra', 'tania.chopra@student.ecampus.edu', '555-1122', 'password123', 6, '2024-09-01'),
('Reyansh Nair', 'reyansh.nair@student.ecampus.edu', '555-1123', 'password123', 7, '2024-09-01'),
('Ira Kapoor', 'ira.kapoor@student.ecampus.edu', '555-1124', 'password123', 8, '2024-09-01'),
('Yuvraj Singh', 'yuvraj.singh@student.ecampus.edu', '555-1125', 'password123', 1, '2024-09-01'),
('Naina Mehra', 'naina.mehra@student.ecampus.edu', '555-1126', 'password123', 2, '2024-09-01'),
('Ayaan Malhotra', 'ayaan.malhotra@student.ecampus.edu', '555-1127', 'password123', 3, '2024-09-01'),
('Sahana Roy', 'sahana.roy@student.ecampus.edu', '555-1128', 'password123', 4, '2024-09-01'),
('Rudra Chopra', 'rudra.chopra@student.ecampus.edu', '555-1129', 'password123', 5, '2024-09-01'),
('Mira Kapoor', 'mira.kapoor@student.ecampus.edu', '555-1130', 'password123', 6, '2024-09-01');

-- Assignments
INSERT INTO assignments (title, course_id, description, due_date) VALUES
('Assignment 1 for Course 1', 1, 'Please complete textbook chapters 1-3.', '2026-10-15'),
('Assignment 2 for Course 1', 1, 'Midterm essay submission.', '2026-11-20'),
('Assignment 1 for Course 2', 2, 'Please complete textbook chapters 1-3.', '2026-10-15'),
('Assignment 2 for Course 2', 2, 'Midterm essay submission.', '2026-11-20'),
('Assignment 1 for Course 3', 3, 'Please complete textbook chapters 1-3.', '2026-10-15'),
('Assignment 2 for Course 3', 3, 'Midterm essay submission.', '2026-11-20'),
('Assignment 1 for Course 4', 4, 'Please complete textbook chapters 1-3.', '2026-10-15'),
('Assignment 2 for Course 4', 4, 'Midterm essay submission.', '2026-11-20'),
('Assignment 1 for Course 5', 5, 'Please complete textbook chapters 1-3.', '2026-10-15'),
('Assignment 2 for Course 5', 5, 'Midterm essay submission.', '2026-11-20'),
('Assignment 1 for Course 6', 6, 'Please complete textbook chapters 1-3.', '2026-10-15'),
('Assignment 2 for Course 6', 6, 'Midterm essay submission.', '2026-11-20'),
('Assignment 1 for Course 7', 7, 'Please complete textbook chapters 1-3.', '2026-10-15'),
('Assignment 2 for Course 7', 7, 'Midterm essay submission.', '2026-11-20'),
('Assignment 1 for Course 8', 8, 'Please complete textbook chapters 1-3.', '2026-10-15'),
('Assignment 2 for Course 8', 8, 'Midterm essay submission.', '2026-11-20');

-- Attendance
INSERT INTO attendance (student_id, course_id, date, status) VALUES
(1, 2, '2026-09-01', 'Present'),
(1, 2, '2026-09-02', 'Present'),
(1, 2, '2026-09-03', 'Present'),
(1, 2, '2026-09-04', 'Present'),
(1, 2, '2026-09-05', 'Present'),
(2, 3, '2026-09-01', 'Present'),
(2, 3, '2026-09-02', 'Present'),
(2, 3, '2026-09-03', 'Present'),
(2, 3, '2026-09-04', 'Present'),
(2, 3, '2026-09-05', 'Present'),
(3, 4, '2026-09-01', 'Present'),
(3, 4, '2026-09-02', 'Late'),
(3, 4, '2026-09-03', 'Absent'),
(3, 4, '2026-09-04', 'Absent'),
(3, 4, '2026-09-05', 'Absent'),
(4, 5, '2026-09-01', 'Present'),
(4, 5, '2026-09-02', 'Absent'),
(4, 5, '2026-09-03', 'Present'),
(4, 5, '2026-09-04', 'Present'),
(4, 5, '2026-09-05', 'Present'),
(5, 6, '2026-09-01', 'Absent'),
(5, 6, '2026-09-02', 'Present'),
(5, 6, '2026-09-03', 'Late'),
(5, 6, '2026-09-04', 'Late'),
(5, 6, '2026-09-05', 'Present'),
(6, 7, '2026-09-01', 'Present'),
(6, 7, '2026-09-02', 'Late'),
(6, 7, '2026-09-03', 'Present'),
(6, 7, '2026-09-04', 'Present'),
(6, 7, '2026-09-05', 'Present'),
(7, 8, '2026-09-01', 'Present'),
(7, 8, '2026-09-02', 'Present'),
(7, 8, '2026-09-03', 'Late'),
(7, 8, '2026-09-04', 'Absent'),
(7, 8, '2026-09-05', 'Present'),
(8, 1, '2026-09-01', 'Late'),
(8, 1, '2026-09-02', 'Absent'),
(8, 1, '2026-09-03', 'Present'),
(8, 1, '2026-09-04', 'Absent'),
(8, 1, '2026-09-05', 'Late'),
(9, 2, '2026-09-01', 'Absent'),
(9, 2, '2026-09-02', 'Late'),
(9, 2, '2026-09-03', 'Absent'),
(9, 2, '2026-09-04', 'Present'),
(9, 2, '2026-09-05', 'Present'),
(10, 3, '2026-09-01', 'Present'),
(10, 3, '2026-09-02', 'Absent'),
(10, 3, '2026-09-03', 'Present'),
(10, 3, '2026-09-04', 'Present'),
(10, 3, '2026-09-05', 'Absent');

-- Exams
INSERT INTO exams (course_id, exam_name, exam_date, total_marks) VALUES
(1, 'Midterm Exam - Course 1', '2026-10-30', 100),
(1, 'Final Exam - Course 1', '2026-12-15', 100),
(2, 'Midterm Exam - Course 2', '2026-10-30', 100),
(2, 'Final Exam - Course 2', '2026-12-15', 100),
(3, 'Midterm Exam - Course 3', '2026-10-30', 100),
(3, 'Final Exam - Course 3', '2026-12-15', 100),
(4, 'Midterm Exam - Course 4', '2026-10-30', 100),
(4, 'Final Exam - Course 4', '2026-12-15', 100),
(5, 'Midterm Exam - Course 5', '2026-10-30', 100),
(5, 'Final Exam - Course 5', '2026-12-15', 100),
(6, 'Midterm Exam - Course 6', '2026-10-30', 100),
(6, 'Final Exam - Course 6', '2026-12-15', 100),
(7, 'Midterm Exam - Course 7', '2026-10-30', 100),
(7, 'Final Exam - Course 7', '2026-12-15', 100),
(8, 'Midterm Exam - Course 8', '2026-10-30', 100),
(8, 'Final Exam - Course 8', '2026-12-15', 100);

-- Results
INSERT INTO results (student_id, exam_id, marks_obtained) VALUES
(1, 3, 89),
(1, 4, 82),
(2, 5, 63),
(2, 6, 100),
(3, 7, 61),
(3, 8, 84),
(4, 9, 99),
(4, 10, 92),
(5, 11, 93),
(5, 12, 94),
(6, 13, 100),
(6, 14, 77),
(7, 15, 87),
(7, 16, 63),
(8, 1, 83),
(8, 2, 70),
(9, 3, 86),
(9, 4, 97),
(10, 5, 96),
(10, 6, 90);

