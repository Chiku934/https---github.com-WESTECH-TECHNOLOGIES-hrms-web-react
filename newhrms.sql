-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 22, 2026 at 10:18 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `newhrms`
--

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` bigint(20) NOT NULL,
  `company_id` bigint(20) DEFAULT NULL,
  `actor_user_id` bigint(20) DEFAULT NULL,
  `entity` varchar(100) NOT NULL,
  `entity_id` bigint(20) DEFAULT NULL,
  `action` varchar(50) NOT NULL,
  `diff` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`diff`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `companies`
--

CREATE TABLE `companies` (
  `id` bigint(20) NOT NULL,
  `name` varchar(200) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `legal_name` varchar(200) DEFAULT NULL,
  `country_code` char(2) DEFAULT NULL,
  `timezone` varchar(64) DEFAULT 'UTC',
  `plan` varchar(50) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `companies`
--

INSERT INTO `companies` (`id`, `name`, `slug`, `legal_name`, `country_code`, `timezone`, `plan`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Suryodaya Technologies', 'suryodaya', 'Suryodaya Technologies Pvt Ltd', 'IN', 'Asia/Kolkata', 'pro', 'active', '2026-04-22 08:17:48', '2026-04-22 08:17:48'),
(2, 'Nilgiri Analytics', 'nilgiri', 'Nilgiri Analytics Pvt Ltd', 'IN', 'Asia/Kolkata', 'enterprise', 'active', '2026-04-22 08:17:48', '2026-04-22 08:17:48');

-- --------------------------------------------------------

--
-- Table structure for table `company_users`
--

CREATE TABLE `company_users` (
  `id` bigint(20) NOT NULL,
  `company_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `employee_code` varchar(50) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'active',
  `joined_at` date DEFAULT NULL,
  `left_at` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `company_users`
--

INSERT INTO `company_users` (`id`, `company_id`, `user_id`, `employee_code`, `status`, `joined_at`, `left_at`, `created_at`) VALUES
(1, 1, 1, 'SUR001', 'active', '2022-04-01', NULL, '2026-04-22 08:17:48'),
(2, 1, 2, 'SUR002', 'active', '2022-06-15', NULL, '2026-04-22 08:17:48'),
(3, 1, 3, 'SUR003', 'active', '2023-01-10', NULL, '2026-04-22 08:17:48'),
(4, 1, 4, 'SUR004', 'active', '2023-07-20', NULL, '2026-04-22 08:17:48'),
(5, 1, 5, 'SUR005', 'active', '2024-02-05', NULL, '2026-04-22 08:17:48'),
(6, 2, 6, 'NIL001', 'active', '2021-08-10', NULL, '2026-04-22 08:17:48'),
(7, 2, 7, 'NIL002', 'active', '2022-11-01', NULL, '2026-04-22 08:17:48'),
(8, 2, 8, 'NIL003', 'active', '2024-03-18', NULL, '2026-04-22 08:17:48');

-- --------------------------------------------------------

--
-- Table structure for table `custom_fields`
--

CREATE TABLE `custom_fields` (
  `id` bigint(20) NOT NULL,
  `company_id` bigint(20) NOT NULL,
  `entity` varchar(50) NOT NULL,
  `field_key` varchar(100) NOT NULL,
  `field_label` varchar(150) NOT NULL,
  `field_type` varchar(30) NOT NULL,
  `options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`options`)),
  `is_required` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `custom_fields`
--

INSERT INTO `custom_fields` (`id`, `company_id`, `entity`, `field_key`, `field_label`, `field_type`, `options`, `is_required`, `created_at`) VALUES
(1, 1, 'employee', 'tshirt_size', 'T-Shirt Size', 'select', '[\"S\",\"M\",\"L\",\"XL\",\"XXL\"]', 0, '2026-04-22 08:17:49'),
(2, 1, 'employee', 'pf_number', 'PF Number', 'text', NULL, 0, '2026-04-22 08:17:49');

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `id` bigint(20) NOT NULL,
  `company_id` bigint(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `code` varchar(20) DEFAULT NULL,
  `parent_id` bigint(20) DEFAULT NULL,
  `head_id` bigint(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`id`, `company_id`, `name`, `code`, `parent_id`, `head_id`, `created_at`) VALUES
(1, 1, 'Engineering', 'ENG', NULL, 1, '2026-04-22 08:17:49'),
(2, 1, 'Human Resources', 'HR', NULL, 2, '2026-04-22 08:17:49'),
(3, 1, 'Backend', 'BE', 1, 3, '2026-04-22 08:17:49'),
(4, 1, 'Frontend', 'FE', 1, NULL, '2026-04-22 08:17:49'),
(5, 2, 'Data Science', 'DS', NULL, 6, '2026-04-22 08:17:49'),
(6, 2, 'Human Resources', 'HR', NULL, 7, '2026-04-22 08:17:49');

-- --------------------------------------------------------

--
-- Table structure for table `designations`
--

CREATE TABLE `designations` (
  `id` bigint(20) NOT NULL,
  `company_id` bigint(20) NOT NULL,
  `title` varchar(100) NOT NULL,
  `level` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `designations`
--

INSERT INTO `designations` (`id`, `company_id`, `title`, `level`, `created_at`) VALUES
(1, 1, 'Chief Technology Officer', 10, '2026-04-22 08:17:49'),
(2, 1, 'HR Manager', 7, '2026-04-22 08:17:49'),
(3, 1, 'Senior Software Engineer', 6, '2026-04-22 08:17:49'),
(4, 1, 'Software Engineer', 4, '2026-04-22 08:17:49'),
(5, 1, 'Junior Software Engineer', 3, '2026-04-22 08:17:49'),
(6, 2, 'Head of Data Science', 9, '2026-04-22 08:17:49'),
(7, 2, 'HR Executive', 5, '2026-04-22 08:17:49'),
(8, 2, 'Data Analyst', 4, '2026-04-22 08:17:49');

-- --------------------------------------------------------

--
-- Table structure for table `document_types`
--

CREATE TABLE `document_types` (
  `id` bigint(20) NOT NULL,
  `company_id` bigint(20) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `category` varchar(50) DEFAULT NULL,
  `is_required` tinyint(1) DEFAULT 0,
  `has_expiry` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `document_types`
--

INSERT INTO `document_types` (`id`, `company_id`, `name`, `category`, `is_required`, `has_expiry`, `created_at`) VALUES
(1, NULL, 'Aadhaar Card', 'identity', 1, 0, '2026-04-22 08:17:48'),
(2, NULL, 'PAN Card', 'identity', 1, 0, '2026-04-22 08:17:48'),
(3, NULL, 'Passport', 'identity', 0, 1, '2026-04-22 08:17:48'),
(4, NULL, 'Driving Licence', 'identity', 0, 1, '2026-04-22 08:17:48'),
(5, NULL, '10th Marksheet', 'education', 0, 0, '2026-04-22 08:17:48'),
(6, NULL, '12th Marksheet', 'education', 0, 0, '2026-04-22 08:17:48'),
(7, NULL, 'Degree Certificate', 'education', 0, 0, '2026-04-22 08:17:48'),
(8, NULL, 'Offer Letter', 'employment', 0, 0, '2026-04-22 08:17:48'),
(9, NULL, 'Relieving Letter', 'employment', 0, 0, '2026-04-22 08:17:48'),
(10, NULL, 'Experience Letter', 'employment', 0, 0, '2026-04-22 08:17:48');

-- --------------------------------------------------------

--
-- Table structure for table `employee_assignments`
--

CREATE TABLE `employee_assignments` (
  `id` bigint(20) NOT NULL,
  `company_user_id` bigint(20) NOT NULL,
  `department_id` bigint(20) DEFAULT NULL,
  `designation_id` bigint(20) DEFAULT NULL,
  `manager_id` bigint(20) DEFAULT NULL,
  `employment_type` varchar(30) DEFAULT NULL,
  `work_location` varchar(100) DEFAULT NULL,
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `is_current` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employee_assignments`
--

INSERT INTO `employee_assignments` (`id`, `company_user_id`, `department_id`, `designation_id`, `manager_id`, `employment_type`, `work_location`, `start_date`, `end_date`, `is_current`, `created_at`) VALUES
(1, 1, 1, 1, NULL, 'full-time', 'Noida', '2022-04-01', NULL, 1, '2026-04-22 08:17:49'),
(2, 2, 2, 2, 1, 'full-time', 'Bengaluru', '2022-06-15', NULL, 1, '2026-04-22 08:17:49'),
(3, 3, 3, 3, 1, 'full-time', 'New Delhi', '2023-01-10', NULL, 1, '2026-04-22 08:17:49'),
(4, 4, 3, 4, 3, 'full-time', 'Mumbai', '2023-07-20', NULL, 1, '2026-04-22 08:17:49'),
(5, 5, 4, 5, 3, 'full-time', 'Hyderabad', '2024-02-05', NULL, 1, '2026-04-22 08:17:49'),
(6, 6, 5, 6, NULL, 'full-time', 'Kolkata', '2021-08-10', NULL, 1, '2026-04-22 08:17:49'),
(7, 7, 6, 7, 6, 'full-time', 'Ahmedabad', '2022-11-01', NULL, 1, '2026-04-22 08:17:49'),
(8, 8, 5, 8, 6, 'full-time', 'Thiruvananthapuram', '2024-03-18', NULL, 1, '2026-04-22 08:17:49');

-- --------------------------------------------------------

--
-- Table structure for table `employee_documents`
--

CREATE TABLE `employee_documents` (
  `id` bigint(20) NOT NULL,
  `company_id` bigint(20) NOT NULL,
  `company_user_id` bigint(20) NOT NULL,
  `document_type_id` bigint(20) DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_url` text NOT NULL,
  `file_size` bigint(20) DEFAULT NULL,
  `mime_type` varchar(100) DEFAULT NULL,
  `document_number` varchar(100) DEFAULT NULL,
  `issued_date` date DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `verified` tinyint(1) DEFAULT 0,
  `verified_by` bigint(20) DEFAULT NULL,
  `verified_at` timestamp NULL DEFAULT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employee_documents`
--

INSERT INTO `employee_documents` (`id`, `company_id`, `company_user_id`, `document_type_id`, `file_name`, `file_url`, `file_size`, `mime_type`, `document_number`, `issued_date`, `expiry_date`, `verified`, `verified_by`, `verified_at`, `uploaded_at`) VALUES
(1, 1, 1, 1, 'arjun_aadhaar.pdf', 's3://hrms/sur/1/aadhaar.pdf', NULL, 'application/pdf', '1234 5678 9012', '2012-06-01', NULL, 1, 2, '2026-04-22 08:17:49', '2026-04-22 08:17:49'),
(2, 1, 1, 2, 'arjun_pan.pdf', 's3://hrms/sur/1/pan.pdf', NULL, 'application/pdf', 'ABCDE1234F', '2010-04-15', NULL, 1, 2, '2026-04-22 08:17:49', '2026-04-22 08:17:49'),
(3, 1, 3, 1, 'rahul_aadhaar.pdf', 's3://hrms/sur/3/aadhaar.pdf', NULL, 'application/pdf', '2345 6789 0123', '2013-07-10', NULL, 1, 2, '2026-04-22 08:17:49', '2026-04-22 08:17:49'),
(4, 1, 4, 1, 'sneha_aadhaar.pdf', 's3://hrms/sur/4/aadhaar.pdf', NULL, 'application/pdf', '3456 7890 1234', '2014-08-22', NULL, 0, NULL, NULL, '2026-04-22 08:17:49'),
(5, 2, 6, 2, 'ananya_pan.pdf', 's3://hrms/nil/6/pan.pdf', NULL, 'application/pdf', 'FGHIJ5678K', '2011-05-03', NULL, 1, 7, '2026-04-22 08:17:49', '2026-04-22 08:17:49'),
(6, 2, 8, 1, 'meera_aadhaar.pdf', 's3://hrms/nil/8/aadhaar.pdf', NULL, 'application/pdf', '4567 8901 2345', '2015-10-12', NULL, 0, NULL, NULL, '2026-04-22 08:17:49');

-- --------------------------------------------------------

--
-- Table structure for table `employee_profiles`
--

CREATE TABLE `employee_profiles` (
  `company_user_id` bigint(20) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `middle_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) NOT NULL,
  `dob` date DEFAULT NULL,
  `gender` varchar(20) DEFAULT NULL,
  `marital_status` varchar(20) DEFAULT NULL,
  `blood_group` varchar(5) DEFAULT NULL,
  `personal_email` varchar(255) DEFAULT NULL,
  `personal_phone` varchar(20) DEFAULT NULL,
  `emergency_contact_name` varchar(150) DEFAULT NULL,
  `emergency_contact_phone` varchar(20) DEFAULT NULL,
  `address_line1` varchar(200) DEFAULT NULL,
  `address_line2` varchar(200) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `postal_code` varchar(20) DEFAULT NULL,
  `photo_url` text DEFAULT NULL,
  `extra_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`extra_data`)),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employee_profiles`
--

INSERT INTO `employee_profiles` (`company_user_id`, `first_name`, `middle_name`, `last_name`, `dob`, `gender`, `marital_status`, `blood_group`, `personal_email`, `personal_phone`, `emergency_contact_name`, `emergency_contact_phone`, `address_line1`, `address_line2`, `city`, `state`, `country`, `postal_code`, `photo_url`, `extra_data`, `updated_at`) VALUES
(1, 'Arjun', 'Kumar', 'Sharma', '1985-05-12', 'Male', 'Married', 'B+', 'arjun.sharma85@gmail.com', '+919812345001', 'Kavita Sharma', '+919812399001', 'Flat 402, Green Meadows', 'Sector 18', 'Noida', 'Uttar Pradesh', 'India', '201301', NULL, '{\"nationality\":\"Indian\",\"languages\":[\"Hindi\",\"English\"],\"pan\":\"ABCDE1234F\"}', '2026-04-22 08:17:49'),
(2, 'Priya', NULL, 'Iyer', '1990-08-24', 'Female', 'Married', 'O+', 'priya.iyer90@gmail.com', '+919812345002', 'Ramesh Iyer', '+919812399002', '12, Brigade Gateway', 'Rajajinagar', 'Bengaluru', 'Karnataka', 'India', '560010', NULL, '{\"nationality\":\"Indian\",\"languages\":[\"Tamil\",\"Kannada\",\"English\"]}', '2026-04-22 08:17:49'),
(3, 'Rahul', 'Singh', 'Verma', '1992-11-03', 'Male', 'Single', 'A+', 'rahul.verma92@gmail.com', '+919812345003', 'Sunita Verma', '+919812399003', 'H-14, Vasant Kunj', NULL, 'New Delhi', 'Delhi', 'India', '110070', NULL, '{\"nationality\":\"Indian\",\"languages\":[\"Hindi\",\"English\"]}', '2026-04-22 08:17:49'),
(4, 'Sneha', NULL, 'Patil', '1995-02-17', 'Female', 'Single', 'AB+', 'sneha.patil95@gmail.com', '+919812345004', 'Ajay Patil', '+919812399004', 'Flat 7B, Hiranandani', 'Powai', 'Mumbai', 'Maharashtra', 'India', '400076', NULL, '{\"nationality\":\"Indian\",\"languages\":[\"Marathi\",\"Hindi\",\"English\"]}', '2026-04-22 08:17:49'),
(5, 'Vikram', NULL, 'Reddy', '1998-07-29', 'Male', 'Single', 'O-', 'vikram.reddy98@gmail.com', '+919812345005', 'Lakshmi Reddy', '+919812399005', 'Plot 21, Jubilee Hills', 'Road No. 36', 'Hyderabad', 'Telangana', 'India', '500033', NULL, '{\"nationality\":\"Indian\",\"languages\":[\"Telugu\",\"English\"]}', '2026-04-22 08:17:49'),
(6, 'Ananya', NULL, 'Banerjee', '1987-03-09', 'Female', 'Married', 'B-', 'ananya.b87@gmail.com', '+919812345006', 'Subrata Banerjee', '+919812399006', '45, Salt Lake Sector V', NULL, 'Kolkata', 'West Bengal', 'India', '700091', NULL, '{\"nationality\":\"Indian\",\"languages\":[\"Bengali\",\"English\",\"Hindi\"]}', '2026-04-22 08:17:49'),
(7, 'Kartik', NULL, 'Mehta', '1991-09-15', 'Male', 'Married', 'A-', 'kartik.mehta91@gmail.com', '+919812345007', 'Neha Mehta', '+919812399007', 'B-203, Satellite', NULL, 'Ahmedabad', 'Gujarat', 'India', '380015', NULL, '{\"nationality\":\"Indian\",\"languages\":[\"Gujarati\",\"Hindi\",\"English\"]}', '2026-04-22 08:17:49'),
(8, 'Meera', NULL, 'Nair', '1996-12-21', 'Female', 'Single', 'O+', 'meera.nair96@gmail.com', '+919812345008', 'Rajan Nair', '+919812399008', 'TC 9/1234, Vellayambalam', NULL, 'Thiruvananthapuram', 'Kerala', 'India', '695010', NULL, '{\"nationality\":\"Indian\",\"languages\":[\"Malayalam\",\"English\",\"Hindi\"]}', '2026-04-22 08:17:49');

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` bigint(20) NOT NULL,
  `code` varchar(100) NOT NULL,
  `module` varchar(50) NOT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `permissions`
--

INSERT INTO `permissions` (`id`, `code`, `module`, `description`) VALUES
(1, 'employee.view', 'employee', 'View employees'),
(2, 'employee.create', 'employee', 'Create employees'),
(3, 'employee.update', 'employee', 'Update employees'),
(4, 'employee.delete', 'employee', 'Delete / deactivate employees'),
(5, 'department.view', 'department', 'View departments'),
(6, 'department.manage', 'department', 'Create/update departments'),
(7, 'role.manage', 'rbac', 'Manage roles and permissions'),
(8, 'document.view', 'document', 'View employee documents'),
(9, 'document.upload', 'document', 'Upload employee documents'),
(10, 'document.verify', 'document', 'Verify documents'),
(11, 'payroll.view', 'payroll', 'View payroll'),
(12, 'payroll.process', 'payroll', 'Run payroll'),
(13, 'leave.view', 'leave', 'View leave records'),
(14, 'leave.approve', 'leave', 'Approve leave requests');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` bigint(20) NOT NULL,
  `company_id` bigint(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `is_system` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `company_id`, `name`, `description`, `is_system`, `created_at`) VALUES
(1, 1, 'Super Admin', 'Full access to everything', 1, '2026-04-22 08:17:49'),
(2, 1, 'HR Manager', 'Manages employees and documents', 0, '2026-04-22 08:17:49'),
(3, 1, 'Team Lead', 'Approves leaves for team', 0, '2026-04-22 08:17:49'),
(4, 1, 'Employee', 'Self-service access', 1, '2026-04-22 08:17:49'),
(5, 1, 'HR Executive', 'HR operations and daily tasks', 0, '2026-04-22 08:17:49'),
(6, 2, 'Super Admin', 'Full access to everything', 1, '2026-04-22 08:17:49'),
(7, 2, 'HR Executive', 'HR operations', 0, '2026-04-22 08:17:49'),
(8, 2, 'Employee', 'Self-service access', 1, '2026-04-22 08:17:49');

-- --------------------------------------------------------

--
-- Table structure for table `role_permissions`
--

CREATE TABLE `role_permissions` (
  `role_id` bigint(20) NOT NULL,
  `permission_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `role_permissions`
--

INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES
(1, 1),
(1, 2),
(1, 3),
(1, 4),
(1, 5),
(1, 6),
(1, 7),
(1, 8),
(1, 9),
(1, 10),
(1, 11),
(1, 12),
(1, 13),
(1, 14),
(2, 1),
(2, 2),
(2, 3),
(2, 5),
(2, 6),
(2, 8),
(2, 9),
(2, 10),
(2, 13),
(2, 14),
(3, 1),
(3, 8),
(3, 13),
(3, 14),
(4, 1),
(4, 8),
(4, 9),
(4, 13),
(5, 1),
(5, 2),
(5, 3),
(5, 4),
(5, 5),
(5, 6),
(5, 7),
(5, 8),
(5, 9),
(5, 10),
(5, 11),
(5, 12),
(5, 13),
(5, 14),
(6, 1),
(6, 2),
(6, 3),
(6, 8),
(6, 9),
(6, 10),
(6, 13),
(6, 14),
(7, 1),
(7, 8),
(7, 9),
(7, 13);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `email_verified` tinyint(1) DEFAULT 0,
  `mfa_enabled` tinyint(1) DEFAULT 0,
  `last_login_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password_hash`, `phone`, `is_active`, `email_verified`, `mfa_enabled`, `last_login_at`, `created_at`) VALUES
(1, 'arjun.sharma@suryodaya.in', '$2b$10$abcdefghijklmnopqrstuv', '+919812345001', 1, 1, 0, NULL, '2026-04-22 08:17:48'),
(2, 'priya.iyer@suryodaya.in', '$2b$10$abcdefghijklmnopqrstuv', '+919812345002', 1, 1, 0, NULL, '2026-04-22 08:17:48'),
(3, 'rahul.verma@suryodaya.in', '$2b$10$abcdefghijklmnopqrstuv', '+919812345003', 1, 1, 0, NULL, '2026-04-22 08:17:48'),
(4, 'sneha.patil@suryodaya.in', '$2b$10$abcdefghijklmnopqrstuv', '+919812345004', 1, 1, 0, NULL, '2026-04-22 08:17:48'),
(5, 'vikram.reddy@suryodaya.in', '$2b$10$abcdefghijklmnopqrstuv', '+919812345005', 1, 1, 0, NULL, '2026-04-22 08:17:48'),
(6, 'ananya.banerjee@nilgiri.in', '$2b$10$abcdefghijklmnopqrstuv', '+919812345006', 1, 1, 0, NULL, '2026-04-22 08:17:48'),
(7, 'kartik.mehta@nilgiri.in', '$2b$10$abcdefghijklmnopqrstuv', '+919812345007', 1, 1, 0, NULL, '2026-04-22 08:17:48'),
(8, 'meera.nair@nilgiri.in', '$2b$10$abcdefghijklmnopqrstuv', '+919812345008', 1, 1, 0, NULL, '2026-04-22 08:17:48');

-- --------------------------------------------------------

--
-- Table structure for table `user_roles`
--

CREATE TABLE `user_roles` (
  `company_user_id` bigint(20) NOT NULL,
  `role_id` bigint(20) NOT NULL,
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `assigned_by` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_roles`
--

INSERT INTO `user_roles` (`company_user_id`, `role_id`, `assigned_at`, `assigned_by`) VALUES
(1, 1, '2026-04-22 08:17:49', NULL),
(2, 2, '2026-04-22 08:17:49', NULL),
(3, 3, '2026-04-22 08:17:49', NULL),
(3, 4, '2026-04-22 08:17:49', NULL),
(4, 4, '2026-04-22 08:17:49', NULL),
(5, 4, '2026-04-22 08:17:49', NULL),
-- Add HR Executive for Company 1 (assign to user 2 as additional role or create new user)
(2, 5, '2026-04-22 08:17:49', NULL),
(6, 6, '2026-04-22 08:17:49', NULL),
(7, 7, '2026-04-22 08:17:49', NULL),
(8, 8, '2026-04-22 08:17:49', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_audit_user` (`actor_user_id`),
  ADD KEY `idx_audit_company` (`company_id`,`created_at`),
  ADD KEY `idx_audit_entity` (`entity`,`entity_id`);

--
-- Indexes for table `companies`
--
ALTER TABLE `companies`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indexes for table `company_users`
--
ALTER TABLE `company_users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_company_user` (`company_id`,`user_id`),
  ADD UNIQUE KEY `uq_company_emp_code` (`company_id`,`employee_code`),
  ADD KEY `idx_cu_company` (`company_id`),
  ADD KEY `idx_cu_user` (`user_id`);

--
-- Indexes for table `custom_fields`
--
ALTER TABLE `custom_fields`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_custom_field` (`company_id`,`entity`,`field_key`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_dept_company_name` (`company_id`,`name`),
  ADD KEY `fk_dept_head` (`head_id`),
  ADD KEY `idx_dept_company` (`company_id`),
  ADD KEY `idx_dept_parent` (`parent_id`);

--
-- Indexes for table `designations`
--
ALTER TABLE `designations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_designation_company_title` (`company_id`,`title`);

--
-- Indexes for table `document_types`
--
ALTER TABLE `document_types`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_dt_company` (`company_id`);

--
-- Indexes for table `employee_assignments`
--
ALTER TABLE `employee_assignments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_assign_dept` (`department_id`),
  ADD KEY `fk_assign_desig` (`designation_id`),
  ADD KEY `idx_assign_cu` (`company_user_id`,`is_current`),
  ADD KEY `idx_assign_manager` (`manager_id`);

--
-- Indexes for table `employee_documents`
--
ALTER TABLE `employee_documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_doc_type` (`document_type_id`),
  ADD KEY `fk_doc_verifier` (`verified_by`),
  ADD KEY `idx_doc_emp` (`company_user_id`),
  ADD KEY `idx_doc_company` (`company_id`),
  ADD KEY `idx_doc_expiry` (`expiry_date`);

--
-- Indexes for table `employee_profiles`
--
ALTER TABLE `employee_profiles`
  ADD PRIMARY KEY (`company_user_id`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_role_company_name` (`company_id`,`name`),
  ADD KEY `idx_roles_company` (`company_id`);

--
-- Indexes for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD PRIMARY KEY (`role_id`,`permission_id`),
  ADD KEY `fk_rp_perm` (`permission_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `user_roles`
--
ALTER TABLE `user_roles`
  ADD PRIMARY KEY (`company_user_id`,`role_id`),
  ADD KEY `fk_ur_role` (`role_id`),
  ADD KEY `fk_ur_byuser` (`assigned_by`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `companies`
--
ALTER TABLE `companies`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `company_users`
--
ALTER TABLE `company_users`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `custom_fields`
--
ALTER TABLE `custom_fields`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `designations`
--
ALTER TABLE `designations`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `document_types`
--
ALTER TABLE `document_types`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `employee_assignments`
--
ALTER TABLE `employee_assignments`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `employee_documents`
--
ALTER TABLE `employee_documents`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `fk_audit_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_audit_user` FOREIGN KEY (`actor_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `company_users`
--
ALTER TABLE `company_users`
  ADD CONSTRAINT `fk_cu_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_cu_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `custom_fields`
--
ALTER TABLE `custom_fields`
  ADD CONSTRAINT `fk_cf_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `departments`
--
ALTER TABLE `departments`
  ADD CONSTRAINT `fk_dept_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_dept_head` FOREIGN KEY (`head_id`) REFERENCES `company_users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_dept_parent` FOREIGN KEY (`parent_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `designations`
--
ALTER TABLE `designations`
  ADD CONSTRAINT `fk_desig_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `document_types`
--
ALTER TABLE `document_types`
  ADD CONSTRAINT `fk_dt_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `employee_assignments`
--
ALTER TABLE `employee_assignments`
  ADD CONSTRAINT `fk_assign_cu` FOREIGN KEY (`company_user_id`) REFERENCES `company_users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_assign_dept` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_assign_desig` FOREIGN KEY (`designation_id`) REFERENCES `designations` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_assign_manager` FOREIGN KEY (`manager_id`) REFERENCES `company_users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `employee_documents`
--
ALTER TABLE `employee_documents`
  ADD CONSTRAINT `fk_doc_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_doc_cu` FOREIGN KEY (`company_user_id`) REFERENCES `company_users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_doc_type` FOREIGN KEY (`document_type_id`) REFERENCES `document_types` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_doc_verifier` FOREIGN KEY (`verified_by`) REFERENCES `company_users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `employee_profiles`
--
ALTER TABLE `employee_profiles`
  ADD CONSTRAINT `fk_profile_cu` FOREIGN KEY (`company_user_id`) REFERENCES `company_users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `roles`
--
ALTER TABLE `roles`
  ADD CONSTRAINT `fk_roles_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD CONSTRAINT `fk_rp_perm` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_rp_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_roles`
--
ALTER TABLE `user_roles`
  ADD CONSTRAINT `fk_ur_byuser` FOREIGN KEY (`assigned_by`) REFERENCES `company_users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_ur_cu` FOREIGN KEY (`company_user_id`) REFERENCES `company_users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_ur_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
