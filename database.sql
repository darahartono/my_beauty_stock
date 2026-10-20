CREATE DATABASE IF NOT EXISTS my_beauty_stock
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE my_beauty_stock;

CREATE TABLE IF NOT EXISTS products (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  category ENUM('Skincare', 'Makeup', 'Body Care', 'Hair Care', 'Parfum', 'Lainnya') NOT NULL,
  quantity INT UNSIGNED NOT NULL DEFAULT 0,
  expiry_date DATE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_products_expiry_date (expiry_date),
  INDEX idx_products_category (category),
  INDEX idx_products_name (name)
) ENGINE=InnoDB;
