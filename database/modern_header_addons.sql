-- ==========================================================
-- eCampus Modern Header Add-ons
-- Tables for Notifications and Messages
-- ==========================================================

CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_type ENUM('student', 'teacher', 'admin') NOT NULL,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_type ENUM('student', 'teacher', 'admin') NOT NULL,
    sender_id INT NOT NULL,
    receiver_type ENUM('student', 'teacher', 'admin') NOT NULL,
    receiver_id INT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- DUMMY DATA FOR HEADER DEMONSTRATION
-- ==========================================

INSERT INTO notifications (user_type, user_id, title, message) VALUES 
('student', 1, 'Exam Schedule Posted', 'Midterm exams start next week.'),
('student', 1, 'Fee Reminder', 'Please pay your pending tuition fee.'),
('teacher', 1, 'Staff Meeting', 'Mandatory meeting at 4 PM tomorrow.');

INSERT INTO messages (sender_type, sender_id, receiver_type, receiver_id, message) VALUES 
('teacher', 1, 'student', 1, 'Don\'t forget to submit your assignment!'),
('admin', 1, 'student', 1, 'Your scholarship application is approved.'),
('student', 2, 'student', 1, 'Hey, want to study together later?');
