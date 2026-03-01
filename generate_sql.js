const fs = require('fs');

const DB_NAME = 'ecampus_db';
let sql = \`CREATE DATABASE IF NOT EXISTS \${DB_NAME};
USE \${DB_NAME};

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
\`;

function generate() {
    // Pre-computed hash of "password123"
    const passwordHash = '$2b$10$T1Kq2bH9L3QYn6PjR/6YauXoE7i8P8c6Y1yQ0R4p8P8c6Y1yQ0R4p'; 

    // Teachers (15)
    sql += \`-- Teachers\\nINSERT INTO teachers (name, email, phone, password, subject, hire_date) VALUES\\n\`;
    const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'English Literature', 'History', 'Geography', 'Economics', 'Art', 'Music', 'Physical Education', 'Spanish', 'French', 'Psychology'];
    const teachersList = [];
    for (let i = 1; i <= 15; i++) {
        const name = \`Teacher \${i}\`;
        const email = \`teacher\${i}@ecampus.edu\`;
        const phone = \`555-01\${i.toString().padStart(2, '0')}\`;
        const subject = subjects[i-1];
        teachersList.push(\`('\${name}', '\${email}', '\${phone}', '\${passwordHash}', '\${subject}', '2020-01-15')\`);
    }
    sql += teachersList.join(',\\n') + ';\n\n';

    // Courses (8)
    sql += \`-- Courses\\nINSERT INTO courses (course_name, course_code, teacher_id, description) VALUES\\n\`;
    const courses = [
        "Advanced Mathematics", "MATH301", 1, "Calculus and Algebra.",
        "Quantum Physics", "PHYS400", 2, "Introduction to quantum mechanics.",
        "Organic Chemistry", "CHEM200", 3, "Carbon-based compounds study.",
        "Software Engineering", "CS500", 5, "Software design patterns.",
        "World History", "HIST101", 7, "Global historical events.",
        "Macro Economics", "ECON201", 9, "Economic systems at scale.",
        "Music Theory", "MUS101", 11, "Fundamentals of music.",
        "Spanish 1", "LANG101", 13, "Beginner Spanish conversation."
    ];
    const coursesList = [];
    for (let i = 0; i < courses.length; i+=4) {
        coursesList.push(\`('\${courses[i]}', '\${courses[i+1]}', \${courses[i+2]}, '\${courses[i+3]}')\`);
    }
    sql += coursesList.join(',\\n') + ';\n\n';

    // Students (30)
    sql += \`-- Students\\nINSERT INTO students (name, email, phone, password, course_id, enrollment_date) VALUES\\n\`;
    const studentsList = [];
    for (let i = 1; i <= 30; i++) {
        const name = \`Student \${i}\`;
        const email = \`student\${i}@student.ecampus.edu\`;
        const phone = \`555-11\${i.toString().padStart(2, '0')}\`;
        // distribute students among 8 courses
        const courseId = (i % 8) + 1;
        studentsList.push(\`('\${name}', '\${email}', '\${phone}', '\${passwordHash}', \${courseId}, '2024-09-01')\`);
    }
    sql += studentsList.join(',\\n') + ';\n\n';

    // Assignments
    sql += \`-- Assignments\\nINSERT INTO assignments (title, course_id, description, due_date) VALUES\\n\`;
    const assignmentList = [];
    for(let i = 1; i <= 8; i++) {
        assignmentList.push(\`('Assignment 1 for Course \${i}', \${i}, 'Please complete textbook chapters 1-3.', '2026-10-15')\`);
        assignmentList.push(\`('Assignment 2 for Course \${i}', \${i}, 'Midterm essay submission.', '2026-11-20')\`);
    }
    sql += assignmentList.join(',\\n') + ';\n\n';

    // Attendance (Create some records for the first 10 students over 5 days)
    sql += \`-- Attendance\\nINSERT INTO attendance (student_id, course_id, date, status) VALUES\\n\`;
    const attendanceList = [];
    const statuses = ['Present', 'Present', 'Present', 'Absent', 'Late'];
    for(let s = 1; s <= 10; s++) {
        const courseId = (s % 8) + 1;
        for(let d = 1; d <= 5; d++) {
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            attendanceList.push(\`(\${s}, \${courseId}, '2026-09-0\${d}', '\${status}')\`);
        }
    }
    sql += attendanceList.join(',\\n') + ';\n\n';

    // Exams
    sql += \`-- Exams\\nINSERT INTO exams (course_id, exam_name, exam_date, total_marks) VALUES\\n\`;
    const examList = [];
    for(let i = 1; i <= 8; i++) {
        examList.push(\`(\${i}, 'Midterm Exam - Course \${i}', '2026-10-30', 100)\`);
        examList.push(\`(\${i}, 'Final Exam - Course \${i}', '2026-12-15', 100)\`);
    }
    sql += examList.join(',\\n') + ';\n\n';

    // Results (Give results for the first 10 students)
    sql += \`-- Results\\nINSERT INTO results (student_id, exam_id, marks_obtained) VALUES\\n\`;
    const resultsList = [];
    for(let s = 1; s <= 10; s++) {
        const courseId = (s % 8) + 1;
        // The exams for this course are examId = (courseId*2)-1 and (courseId*2)
        const exam1 = (courseId*2)-1;
        const exam2 = courseId*2;
        resultsList.push(\`(\${s}, \${exam1}, \${Math.floor(Math.random()*40) + 60})\`);
        resultsList.push(\`(\${s}, \${exam2}, \${Math.floor(Math.random()*40) + 60})\`);
    }
    sql += resultsList.join(',\\n') + ';\n\n';

    fs.writeFileSync('database/ecampus_schema_data.sql', sql);
    console.log("SQL schema and data generated successfully to database/ecampus_schema_data.sql");
}

try {
    generate();
} catch (e) {
    fs.writeFileSync('generate_error.log', e.toString());
}
