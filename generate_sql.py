import random

DB_NAME = 'ecampus_db'
sql = f"""CREATE DATABASE IF NOT EXISTS {DB_NAME};
USE {DB_NAME};

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
"""

passwordHash = '$2b$10$T1Kq2bH9L3QYn6PjR/6YauXoE7i8P8c6Y1yQ0R4p8P8c6Y1yQ0R4p'

# Teachers
sql += "-- Teachers\nINSERT INTO teachers (name, email, phone, password, subject, hire_date) VALUES\n"
subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'English Literature', 'History', 'Geography', 'Economics', 'Art', 'Music', 'Physical Education', 'Spanish', 'French', 'Psychology']
teachers_list = []
for i in range(1, 16):
    name = f"Teacher {i}"
    email = f"teacher{i}@ecampus.edu"
    phone = f"555-01{str(i).zfill(2)}"
    subject = subjects[i-1]
    teachers_list.append(f"('{name}', '{email}', '{phone}', '{passwordHash}', '{subject}', '2020-01-15')")
sql += ",\n".join(teachers_list) + ";\n\n"

# Courses
sql += "-- Courses\nINSERT INTO courses (course_name, course_code, teacher_id, description) VALUES\n"
courses = [
    "Advanced Mathematics", "MATH301", 1, "Calculus and Algebra.",
    "Quantum Physics", "PHYS400", 2, "Introduction to quantum mechanics.",
    "Organic Chemistry", "CHEM200", 3, "Carbon-based compounds study.",
    "Software Engineering", "CS500", 5, "Software design patterns.",
    "World History", "HIST101", 7, "Global historical events.",
    "Macro Economics", "ECON201", 9, "Economic systems at scale.",
    "Music Theory", "MUS101", 11, "Fundamentals of music.",
    "Spanish 1", "LANG101", 13, "Beginner Spanish conversation."
]
course_list = []
for i in range(0, len(courses), 4):
    course_list.append(f"('{courses[i]}', '{courses[i+1]}', {courses[i+2]}, '{courses[i+3]}')")
sql += ",\n".join(course_list) + ";\n\n"

# Students
sql += "-- Students\nINSERT INTO students (name, email, phone, password, course_id, enrollment_date) VALUES\n"
students_list = []
for i in range(1, 31):
    name = f"Student {i}"
    email = f"student{i}@student.ecampus.edu"
    phone = f"555-11{str(i).zfill(2)}"
    course_id = (i % 8) + 1
    students_list.append(f"('{name}', '{email}', '{phone}', '{passwordHash}', {course_id}, '2024-09-01')")
sql += ",\n".join(students_list) + ";\n\n"

# Assignments
sql += "-- Assignments\nINSERT INTO assignments (title, course_id, description, due_date) VALUES\n"
assignment_list = []
for i in range(1, 9):
    assignment_list.append(f"('Assignment 1 for Course {i}', {i}, 'Please complete textbook chapters 1-3.', '2026-10-15')")
    assignment_list.append(f"('Assignment 2 for Course {i}', {i}, 'Midterm essay submission.', '2026-11-20')")
sql += ",\n".join(assignment_list) + ";\n\n"

# Attendance
sql += "-- Attendance\nINSERT INTO attendance (student_id, course_id, date, status) VALUES\n"
attendance_list = []
statuses = ['Present', 'Present', 'Present', 'Absent', 'Late']
for s in range(1, 11):
    course_id = (s % 8) + 1
    for d in range(1, 6):
        status = random.choice(statuses)
        attendance_list.append(f"({s}, {course_id}, '2026-09-0{d}', '{status}')")
sql += ",\n".join(attendance_list) + ";\n\n"

# Exams
sql += "-- Exams\nINSERT INTO exams (course_id, exam_name, exam_date, total_marks) VALUES\n"
exam_list = []
for i in range(1, 9):
    exam_list.append(f"({i}, 'Midterm Exam - Course {i}', '2026-10-30', 100)")
    exam_list.append(f"({i}, 'Final Exam - Course {i}', '2026-12-15', 100)")
sql += ",\n".join(exam_list) + ";\n\n"

# Results
sql += "-- Results\nINSERT INTO results (student_id, exam_id, marks_obtained) VALUES\n"
results_list = []
for s in range(1, 11):
    course_id = (s % 8) + 1
    exam1 = (course_id * 2) - 1
    exam2 = course_id * 2
    results_list.append(f"({s}, {exam1}, {random.randint(60, 100)})")
    results_list.append(f"({s}, {exam2}, {random.randint(60, 100)})")
sql += ",\n".join(results_list) + ";\n\n"

with open("database/ecampus_new.sql", "w") as f:
    f.write(sql)

print("SQL generated successfully to database/ecampus_new.sql")
