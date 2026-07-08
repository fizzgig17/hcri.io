-- hCRI.io Database Setup
-- Run this in phpMyAdmin or any MySQL client

CREATE DATABASE IF NOT EXISTS spd_analyzer CHARACTER SET latin1 COLLATE latin1_swedish_ci;
USE spd_analyzer;

CREATE TABLE users (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  email      VARCHAR(255) NOT NULL UNIQUE,
  name       VARCHAR(255) NOT NULL,
  password   VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reports (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL,
  label        VARCHAR(255) NOT NULL,
  source_type  VARCHAR(10)  NOT NULL DEFAULT 'csv',
  file_name    VARCHAR(255),
  model        VARCHAR(255),
  manufacturer VARCHAR(255),
  led_details  VARCHAR(255),
  notes        TEXT,
  cct          FLOAT,
  duv          FLOAT,
  cie_x        FLOAT,
  cie_y        FLOAT,
  rf           FLOAT,
  rg           FLOAT,
  spd_data     LONGTEXT,
  meta         TEXT,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user_id)
);
