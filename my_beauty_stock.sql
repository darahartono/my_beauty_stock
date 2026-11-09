-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Oct 20, 2026 at 03:46 PM
-- Server version: 8.4.3
-- PHP Version: 8.3.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `my_beauty_stock`
--

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int UNSIGNED NOT NULL,
  `name` varchar(120) NOT NULL,
  `category` enum('Skincare','Makeup','Body Care','Hair Care','Parfum','Lainnya') NOT NULL,
  `quantity` int UNSIGNED NOT NULL DEFAULT '0',
  `expiry_date` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `category`, `quantity`, `expiry_date`, `created_at`, `updated_at`) VALUES
(1, 'lipstik omg', 'Makeup', 10, '2029-01-15', '2026-10-20 10:13:12', '2026-10-20 10:13:12'),
(2, 'sunscreen omg', 'Skincare', 7, '2027-08-04', '2026-10-20 10:13:56', '2026-10-20 10:13:56'),
(3, 'sunblock amaterasun', 'Body Care', 3, '2026-10-22', '2026-10-20 10:15:47', '2026-10-20 10:15:47'),
(4, 'setting spay', 'Makeup', 6, '2026-11-14', '2026-10-20 15:24:56', '2026-10-20 15:24:56');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_products_expiry_date` (`expiry_date`),
  ADD KEY `idx_products_category` (`category`),
  ADD KEY `idx_products_name` (`name`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
