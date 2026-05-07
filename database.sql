-- Pig Registration System - Database Schema
-- Compatible with MySQL 8.0+

-- Users Table
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  barangay VARCHAR(100),
  role ENUM('farmer', 'admin', 'veterinarian') DEFAULT 'farmer',
  profile_image_url VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_username (username),
  INDEX idx_role (role)
);

-- Pigs Table
CREATE TABLE pigs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  name VARCHAR(100),
  breed VARCHAR(100),
  age_months INT,
  weight_kg DECIMAL(10, 2),
  gender ENUM('male', 'female'),
  status ENUM('healthy', 'sick', 'recovery', 'sold', 'deceased') DEFAULT 'healthy',
  purchase_date DATE,
  cost DECIMAL(15, 2),
  description TEXT,
  image_url VARCHAR(500),
  vaccination_status BOOLEAN DEFAULT FALSE,
  last_veterinary_checkup DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);

-- Health Records Table
CREATE TABLE health_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  pig_id INT NOT NULL,
  veterinarian_id INT,
  record_type ENUM('vaccination', 'treatment', 'checkup', 'illness') DEFAULT 'checkup',
  description TEXT,
  diagnosis VARCHAR(255),
  treatment TEXT,
  cost DECIMAL(15, 2),
  record_date DATE NOT NULL,
  next_followup_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (pig_id) REFERENCES pigs(id) ON DELETE CASCADE,
  FOREIGN KEY (veterinarian_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_pig_id (pig_id),
  INDEX idx_record_date (record_date)
);

-- Barangays Table
CREATE TABLE barangays (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) UNIQUE NOT NULL,
  municipality VARCHAR(100),
  province VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_name (name)
);

-- Messages Table
CREATE TABLE messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sender_id INT NOT NULL,
  recipient_id INT NOT NULL,
  subject VARCHAR(255),
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_recipient_id (recipient_id),
  INDEX idx_created_at (created_at)
);

-- Pig Certificates Table
CREATE TABLE certificates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  pig_id INT NOT NULL,
  certificate_type ENUM('health', 'ownership', 'vaccination') DEFAULT 'health',
  certificate_number VARCHAR(100) UNIQUE NOT NULL,
  issue_date DATE NOT NULL,
  expiry_date DATE,
  issuing_authority VARCHAR(255),
  certificate_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pig_id) REFERENCES pigs(id) ON DELETE CASCADE,
  INDEX idx_pig_id (pig_id),
  INDEX idx_certificate_number (certificate_number)
);

-- Activity Logs Table
CREATE TABLE activity_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  action VARCHAR(255),
  entity_type VARCHAR(100),
  entity_id INT,
  details JSON,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
);

-- Insert sample barangays
INSERT INTO barangays (name, municipality, province) VALUES
('Barrio 1', 'Sample Municipality', 'Sample Province'),
('Barrio 2', 'Sample Municipality', 'Sample Province'),
('Barrio 3', 'Sample Municipality', 'Sample Province');

-- Create indexes for performance
CREATE INDEX idx_pigs_status_user ON pigs(status, user_id);
CREATE INDEX idx_health_records_date_range ON health_records(record_date, pig_id);
CREATE INDEX idx_messages_read_status ON messages(is_read, recipient_id);
