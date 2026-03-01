CREATE TABLE IF NOT EXISTS `legal_pages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `page_key` varchar(50) NOT NULL UNIQUE,
  `title` varchar(255) NOT NULL,
  `content_html` longtext NOT NULL,
  `version` varchar(20) DEFAULT 'v1.0',
  `status` tinyint(4) DEFAULT 1,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `legal_pages` (`page_key`, `title`, `content_html`, `version`, `status`) 
VALUES ('terms_conditions', 'Terms & Conditions - eCampus', '
<div class="terms-content">
  <h2>1. Introduction</h2>
  <p>Welcome to the eCampus International School platform. By accessing or using our school management system, you agree to be bound by these functional rules and terms. The platform provides educational tools and administrative transparency for students, teachers, and parents.</p>
  
  <h2>2. Acceptance of Terms</h2>
  <p>Your use of the eCampus system confirms your acceptance of these Terms & Conditions. If you do not agree, you must not access your account or use the system resources.</p>
  
  <h2>3. User Eligibility</h2>
  <p>Access is restricted to officially enrolled students, active staff members, parents/guardians, and recognized administrators. Account sharing is strictly prohibited.</p>
  
  <h2>4. User Accounts & Security</h2>
  <p>Users must maintain the confidentiality of their login credentials. Any unauthorized access must be reported to the IT Administration immediately. The school is not liable for data loss arising from weak user passwords.</p>
  
  <h2>5. Data Usage & Privacy</h2>
  <p>All personal and academic data is processed in accordance with our Privacy Policy to ensure the safety of minors and compliance with educational data regulations.</p>
  
  <h2>6. Platform Usage Rules</h2>
  <p>The platform must be used solely for educational and administrative purposes. System manipulation, scraping of data, or attempting to bypass access controls is forbidden.</p>
  
  <h2>7. Content Ownership & Copyright</h2>
  <p>All materials provided on eCampus (assignments, study materials, notices) are the intellectual property of the school or respective teachers and may not be distributed externally without permission.</p>
  
  <h2>8. Prohibited Activities</h2>
  <p>Harassment via the communication modules, uploading malicious files to the gallery or assignments, and submitting false information are grounds for immediate suspension.</p>
  
  <h2>9. System Availability & Maintenance</h2>
  <p>While we strive for 24/7 uptime, the system may undergo scheduled maintenance. We are not liable for any disruption in services during these windows.</p>
  
  <h2>10. Payments & Fees</h2>
  <p>All fee payments processed through the portal are subject to final bank settlement. Receipts generated electronically are valid proof of payment. Refunds adhere to the school fee policy.</p>
  
  <h2>11. Termination of Account</h2>
  <p>Your account access ends upon graduation, withdrawal, or termination of employment. The administration reserves the right to suspend accounts violating these terms.</p>
  
  <h2>12. Limitation of Liability</h2>
  <p>eCampus is provided "as is". The institution is not liable for indirect damages, technical glitches, or internet failures preventing access to exams or materials.</p>
  
  <h2>13. Modifications to Terms</h2>
  <p>We may revise these terms periodically. Continuing to use the portal after changes implies your consent to the updated terms.</p>
  
  <h2>14. Governing Law</h2>
  <p>These terms are governed by the laws of India, and any disputes shall be settled in the courts of New Delhi.</p>
  
  <h2>15. Contact Information</h2>
  <p>For legal concerns, contact our administration at <strong>legal@ecampus.edu</strong>.</p>
</div>
', 'v1.0', 1);
