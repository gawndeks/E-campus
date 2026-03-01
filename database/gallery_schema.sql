-- ==========================================================
-- eCampus Gallery Schema Add-on
-- ==========================================================

-- If the gallery table already exists (from old schema), we modify it or drop and recreate
DROP TABLE IF EXISTS gallery;

CREATE TABLE gallery (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    image_path VARCHAR(255) NOT NULL,
    category VARCHAR(100) DEFAULT 'Campus',
    uploaded_by INT, -- References the user who uploaded it
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dummy Data
INSERT INTO gallery (title, image_path, category, uploaded_by) VALUES 
('Annual Sports Meet 2025', 'https://images.unsplash.com/photo-1574629810360-7efbf5ce0d16?auto=format&fit=crop&q=80&w=800', 'Sports', 1),
('Science Lab Remodel', 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=800', 'Campus', 1),
('Cultural Dance Festival', 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800', 'Cultural Activities', 2),
('Alumni Homecoming', 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&q=80&w=800', 'Events', 2),
('Main Auditorium', 'https://images.unsplash.com/photo-1620805128795-933b9347d4e5?auto=format&fit=crop&q=80&w=800', 'Campus', 1),
('10th Grade Graduation', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800', 'Events', 1);
