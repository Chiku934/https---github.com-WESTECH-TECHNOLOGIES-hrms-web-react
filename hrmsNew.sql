-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Apr 20, 2026 at 06:13 AM
-- Server version: 8.0.45-0ubuntu0.24.04.1
-- PHP Version: 8.1.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `hrms`
--

-- --------------------------------------------------------

--
-- Table structure for table `account_lists`
--

CREATE TABLE `account_lists` (
  `id` bigint NOT NULL,
  `account_name` varchar(255) NOT NULL,
  `initial_balance` double NOT NULL DEFAULT '0',
  `account_number` varchar(255) NOT NULL,
  `branch_code` varchar(255) NOT NULL,
  `bank_branch` varchar(255) NOT NULL,
  `created_by` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `activity_records`
--

CREATE TABLE `activity_records` (
  `id` bigint NOT NULL,
  `date` date DEFAULT NULL,
  `description` longtext,
  `user` bigint DEFAULT NULL,
  `emp_id` int DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `allowances`
--

CREATE TABLE `allowances` (
  `id` bigint NOT NULL,
  `employee_id` int NOT NULL,
  `allowance_option` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `amount` int NOT NULL,
  `created_by` int NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `allowance_options`
--

CREATE TABLE `allowance_options` (
  `id` bigint NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_by` int NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `type` longtext
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `announcements`
--

CREATE TABLE `announcements` (
  `id` bigint NOT NULL,
  `title` varchar(255) NOT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `branch_id` int DEFAULT NULL,
  `department_id` varchar(255) DEFAULT NULL,
  `employee_id` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_by` int NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `announcement_employees`
--

CREATE TABLE `announcement_employees` (
  `id` bigint NOT NULL,
  `announcement_id` int NOT NULL,
  `employee_id` int NOT NULL,
  `created_by` int NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `appraisals`
--

CREATE TABLE `appraisals` (
  `id` bigint NOT NULL,
  `branch` int NOT NULL DEFAULT '0',
  `employee` int NOT NULL DEFAULT '0',
  `rating` varchar(255) DEFAULT NULL,
  `appraisal_date` varchar(255) NOT NULL,
  `customer_experience` int NOT NULL DEFAULT '0',
  `marketing` int NOT NULL DEFAULT '0',
  `administration` int NOT NULL DEFAULT '0',
  `professionalism` int NOT NULL DEFAULT '0',
  `integrity` int NOT NULL DEFAULT '0',
  `attendance` int NOT NULL DEFAULT '0',
  `remark` longtext,
  `created_by` int NOT NULL DEFAULT '0',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `assets`
--

CREATE TABLE `assets` (
  `id` bigint NOT NULL,
  `name` varchar(255) NOT NULL,
  `purchase_date` date DEFAULT NULL,
  `supported_date` date DEFAULT NULL,
  `amount` double NOT NULL DEFAULT '0',
  `description` longtext,
  `created_by` int NOT NULL DEFAULT '0',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `attendance_employees`
--

CREATE TABLE `attendance_employees` (
  `id` bigint NOT NULL,
  `employee_id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `date` date DEFAULT NULL,
  `status` varchar(255) NOT NULL,
  `clock_in` time DEFAULT NULL,
  `clock_out` time DEFAULT NULL,
  `late` time DEFAULT NULL,
  `early_leaving` time DEFAULT NULL,
  `overtime` time DEFAULT NULL,
  `total_rest` time DEFAULT NULL,
  `created_by` int NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `awards`
--

CREATE TABLE `awards` (
  `id` bigint NOT NULL,
  `employee_id` int NOT NULL,
  `award_type` varchar(255) NOT NULL,
  `date` date DEFAULT NULL,
  `gift` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `created_by` int NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `award_types`
--

CREATE TABLE `award_types` (
  `id` bigint NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_by` int NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `biomatrix_api_details`
--

CREATE TABLE `biomatrix_api_details` (
  `id` int NOT NULL,
  `total_records` int NOT NULL DEFAULT '0',
  `total_employee` int NOT NULL DEFAULT '0',
  `machin_id` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `start_date_time` datetime DEFAULT NULL,
  `end_date_time` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `biomatrix_log`
--

CREATE TABLE `biomatrix_log` (
  `id` int NOT NULL,
  `machin_id` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `employee_id` int DEFAULT '0',
  `card_number` varchar(10) COLLATE utf8mb4_general_ci NOT NULL,
  `name` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `attendance_base` enum('Is_Fingure_Based','Is_RF_Based') COLLATE utf8mb4_general_ci DEFAULT NULL,
  `punch_date_time` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `branches`
--

CREATE TABLE `branches` (
  `id` bigint NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_by` int NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `ch_favorites`
--

CREATE TABLE `ch_favorites` (
  `id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `favorite_id` bigint NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `ch_messages`
--

CREATE TABLE `ch_messages` (
  `id` bigint NOT NULL,
  `type` varchar(255) NOT NULL,
  `from_id` bigint NOT NULL,
  `to_id` bigint NOT NULL,
  `body` varchar(5000) DEFAULT NULL,
  `attachment` varchar(255) DEFAULT NULL,
  `seen` bit(1) NOT NULL DEFAULT b'0',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `commissions`
--

CREATE TABLE `commissions` (
  `id` bigint NOT NULL,
  `employee_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `amount` int NOT NULL,
  `created_by` int NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `company_policies`
--

CREATE TABLE `company_policies` (
  `id` bigint NOT NULL,
  `branch` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` longtext NOT NULL,
  `attachment` varchar(255) DEFAULT NULL,
  `created_by` int NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `competencies`
--

CREATE TABLE `competencies` (
  `id` bigint NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL,
  `created_by` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `complaints`
--

CREATE TABLE `complaints` (
  `id` bigint NOT NULL,
  `complaint_from` int NOT NULL,
  `complaint_against` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `complaint_date` date DEFAULT NULL,
  `description` varchar(255) NOT NULL,
  `created_by` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `crms`
--

CREATE TABLE `crms` (
  `id` int NOT NULL,
  `employee` varchar(222) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `lead_date` date DEFAULT NULL,
  `visit_date` date DEFAULT NULL,
  `contact` varchar(222) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(222) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `remarks` varchar(222) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `followup_date` date DEFAULT NULL,
  `product` varchar(222) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `amount` varchar(222) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `closure_date` date DEFAULT NULL,
  `location` varchar(222) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `org_type` varchar(222) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `custom_questions`
--

CREATE TABLE `custom_questions` (
  `id` bigint NOT NULL,
  `question` varchar(255) NOT NULL,
  `is_required` varchar(255) DEFAULT NULL,
  `created_by` int NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `deduction_options`
--

CREATE TABLE `deduction_options` (
  `id` bigint NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_by` int NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `type` longtext
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `id` bigint NOT NULL,
  `branch_id` bigint DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `created_by` int NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `deposits`
--

CREATE TABLE `deposits` (
  `id` bigint NOT NULL,
  `account_id` int NOT NULL,
  `amount` int NOT NULL,
  `date` date DEFAULT NULL,
  `income_category_id` int NOT NULL,
  `payer_id` int NOT NULL,
  `payment_type_id` int NOT NULL,
  `referal_id` varchar(255) DEFAULT NULL,
  `description` longtext,
  `created_by` int NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `designations`
--

CREATE TABLE `designations` (
  `id` bigint NOT NULL,
  `department_id` bigint DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `created_by` int NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `documents`
--

CREATE TABLE `documents` (
  `id` bigint NOT NULL,
  `name` varchar(255) NOT NULL,
  `is_required` varchar(255) DEFAULT NULL,
  `created_by` int NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `ducument_uploads`
--

CREATE TABLE `ducument_uploads` (
  `id` bigint NOT NULL,
  `name` varchar(255) NOT NULL,
  `role` varchar(255) NOT NULL,
  `document` varchar(255) NOT NULL,
  `description` longtext,
  `created_by` int NOT NULL DEFAULT '0',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `employees`
--

CREATE TABLE `employees` (
  `id` bigint NOT NULL,
  `user_id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `fathers_name` varchar(255) DEFAULT NULL,
  `spouse_name` varchar(222) DEFAULT NULL,
  `mothers_name` varchar(255) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `gender` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `spouse_phone` varchar(20) DEFAULT NULL,
  `present_address` text,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `employee_code` varchar(200) DEFAULT NULL,
  `employee_ref_no` varchar(20) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `grade` int DEFAULT NULL,
  `blood_group` varchar(11) DEFAULT NULL,
  `qualification` varchar(200) DEFAULT NULL,
  `employee_id` varchar(255) DEFAULT NULL,
  `branch_id` int DEFAULT NULL,
  `department_id` int DEFAULT NULL,
  `designation_id` int DEFAULT NULL,
  `company_doj` varchar(255) DEFAULT NULL,
  `documents` varchar(255) DEFAULT NULL,
  `account_holder_name` varchar(255) DEFAULT NULL,
  `account_number` varchar(255) DEFAULT NULL,
  `bank_name` varchar(255) DEFAULT NULL,
  `bank_identifier_code` varchar(255) DEFAULT NULL,
  `branch_location` varchar(255) DEFAULT NULL,
  `tax_payer_id` varchar(255) DEFAULT NULL,
  `esi_number` varchar(255) DEFAULT NULL,
  `uan_number` varchar(255) DEFAULT NULL,
  `salary_type` int DEFAULT NULL,
  `salary` double DEFAULT '0',
  `is_active` int NOT NULL DEFAULT '1',
  `is_death` smallint DEFAULT NULL,
  `death_date` datetime DEFAULT NULL,
  `is_retirement` smallint DEFAULT NULL,
  `retirement_date` datetime DEFAULT NULL,
  `created_by` int NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `pancard` varchar(200) DEFAULT NULL,
  `aadhaarcard` varchar(200) DEFAULT NULL,
  `office_address` longtext,
  `earned_leaves` int NOT NULL DEFAULT '0',
  `leave_updated_at` date DEFAULT NULL,
  `is_leave_updated` tinyint NOT NULL DEFAULT '0',
  `roster_group_id` bigint DEFAULT NULL,
  `weekly_off` int DEFAULT NULL COMMENT '1=Monday, 2=Tuesday, ..., 7=Sunday',
  `permanent_address` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `employee_documents`
--

CREATE TABLE `employee_documents` (
  `id` bigint NOT NULL,
  `employee_id` int NOT NULL,
  `document_id` int NOT NULL,
  `document_value` varchar(255) NOT NULL,
  `created_by` int NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `employee_documents_details`
--

CREATE TABLE `employee_documents_details` (
  `id` bigint NOT NULL,
  `employee_id` int DEFAULT NULL,
  `type` int DEFAULT NULL,
  `type_id` smallint DEFAULT '0',
  `name` varchar(200) DEFAULT NULL,
  `file_name` varchar(200) DEFAULT NULL,
  `date_for` datetime DEFAULT NULL,
  `comments` longtext,
  `status` smallint DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `employee_extra_payment`
--

CREATE TABLE `employee_extra_payment` (
  `id` int NOT NULL,
  `employee_id` int DEFAULT NULL,
  `payment_date` date DEFAULT NULL,
  `title` varchar(155) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `amount` decimal(10,4) DEFAULT NULL,
  `description` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` int DEFAULT NULL,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` tinyint NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `employee_manage_track_status`
--

CREATE TABLE `employee_manage_track_status` (
  `id` int NOT NULL,
  `type_id` int DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `employee_id` int DEFAULT NULL,
  `type` int DEFAULT NULL,
  `status` smallint DEFAULT NULL,
  `comments` longtext,
  `created_by` int DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `is_read` smallint DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `events`
--

CREATE TABLE `events` (
  `id` bigint NOT NULL,
  `branch_id` int DEFAULT NULL,
  `department_id` longtext,
  `employee_id` longtext,
  `title` varchar(255) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `color` varchar(255) DEFAULT NULL,
  `description` longtext,
  `created_by` int NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `event_employees`
--

CREATE TABLE `event_employees` (
  `id` bigint NOT NULL,
  `event_id` int NOT NULL,
  `employee_id` int NOT NULL,
  `created_by` int NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `expenses`
--

CREATE TABLE `expenses` (
  `id` bigint NOT NULL,
  `account_id` int NOT NULL,
  `amount` int NOT NULL,
  `date` date DEFAULT NULL,
  `expense_category_id` int NOT NULL,
  `payee_id` int NOT NULL,
  `payment_type_id` int NOT NULL,
  `referal_id` varchar(255) DEFAULT NULL,
  `description` longtext,
  `created_by` int NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `expense_types`
--

CREATE TABLE `expense_types` (
  `id` bigint NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_by` int NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint NOT NULL,
  `connection` longtext NOT NULL,
  `queue` longtext NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `genrate_payslip_options`
--

CREATE TABLE `genrate_payslip_options` (
  `id` bigint NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `goal_trackings`
--

CREATE TABLE `goal_trackings` (
  `id` bigint NOT NULL,
  `branch` int NOT NULL,
  `goal_type` int NOT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `rating` varchar(255) DEFAULT NULL,
  `target_achievement` varchar(255) DEFAULT NULL,
  `description` longtext,
  `status` int NOT NULL DEFAULT '0',
  `progress` int NOT NULL DEFAULT '0',
  `created_by` int NOT NULL DEFAULT '0',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `goal_types`
--

CREATE TABLE `goal_types` (
  `id` bigint NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_by` int NOT NULL DEFAULT '0',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `holidays`
--

CREATE TABLE `holidays` (
  `id` bigint NOT NULL,
  `date` date DEFAULT NULL,
  `occasion` longtext NOT NULL,
  `created_by` int NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `income_types`
--

CREATE TABLE `income_types` (
  `id` bigint NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_by` int NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `indicators`
--

CREATE TABLE `indicators` (
  `id` bigint NOT NULL,
  `branch` int NOT NULL DEFAULT '0',
  `department` int NOT NULL DEFAULT '0',
  `designation` int NOT NULL DEFAULT '0',
  `rating` varchar(255) DEFAULT NULL,
  `customer_experience` int NOT NULL DEFAULT '0',
  `marketing` int NOT NULL DEFAULT '0',
  `administration` int NOT NULL DEFAULT '0',
  `professionalism` int NOT NULL DEFAULT '0',
  `integrity` int NOT NULL DEFAULT '0',
  `attendance` int NOT NULL DEFAULT '0',
  `created_user` int NOT NULL DEFAULT '0',
  `created_by` int NOT NULL DEFAULT '0',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `interview_schedules`
--

CREATE TABLE `interview_schedules` (
  `id` bigint NOT NULL,
  `candidate` int NOT NULL,
  `employee` int NOT NULL DEFAULT '0',
  `date` date DEFAULT NULL,
  `time` time DEFAULT NULL,
  `comment` longtext,
  `employee_response` varchar(255) DEFAULT NULL,
  `created_by` int NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `ip_restricts`
--

CREATE TABLE `ip_restricts` (
  `id` bigint NOT NULL,
  `ip` varchar(255) NOT NULL,
  `created_by` int NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` longtext,
  `requirement` longtext,
  `branch` int NOT NULL DEFAULT '0',
  `category` int NOT NULL DEFAULT '0',
  `skill` longtext,
  `position` int DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `applicant` varchar(255) DEFAULT NULL,
  `visibility` varchar(255) DEFAULT NULL,
  `code` varchar(255) DEFAULT NULL,
  `custom_question` varchar(255) DEFAULT NULL,
  `created_by` int NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `job_applications`
--

CREATE TABLE `job_applications` (
  `id` bigint NOT NULL,
  `job` int NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `profile` varchar(255) DEFAULT NULL,
  `resume` varchar(255) DEFAULT NULL,
  `cover_letter` longtext,
  `dob` date DEFAULT NULL,
  `gender` varchar(255) DEFAULT NULL,
  `country` varchar(255) DEFAULT NULL,
  `state` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `stage` int NOT NULL DEFAULT '1',
  `order` int NOT NULL DEFAULT '0',
  `skill` longtext,
  `rating` int NOT NULL DEFAULT '0',
  `is_archive` int NOT NULL DEFAULT '0',
  `custom_question` longtext,
  `created_by` int NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `job_application_notes`
--

CREATE TABLE `job_application_notes` (
  `id` bigint NOT NULL,
  `application_id` int NOT NULL DEFAULT '0',
  `note_created` int NOT NULL DEFAULT '0',
  `note` longtext,
  `created_by` int NOT NULL DEFAULT '0',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `job_categories`
--

CREATE TABLE `job_categories` (
  `id` bigint NOT NULL,
  `title` varchar(255) NOT NULL,
  `created_by` int NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `job_on_boards`
--

CREATE TABLE `job_on_boards` (
  `id` bigint NOT NULL,
  `application` int NOT NULL,
  `joining_date` date DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `convert_to_employee` int NOT NULL DEFAULT '0',
  `created_by` int NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `job_stages`
--

CREATE TABLE `job_stages` (
  `id` bigint NOT NULL,
  `title` varchar(255) NOT NULL,
  `order` int NOT NULL DEFAULT '0',
  `created_by` int NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `landing_page_sections`
--

CREATE TABLE `landing_page_sections` (
  `id` bigint NOT NULL,
  `section_name` varchar(255) NOT NULL,
  `section_order` int NOT NULL DEFAULT '0',
  `content` longtext,
  `section_type` varchar(36) NOT NULL,
  `default_content` longtext NOT NULL,
  `section_demo_image` longtext NOT NULL,
  `section_blade_file_name` longtext NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `leaves`
--

CREATE TABLE `leaves` (
  `id` bigint NOT NULL,
  `employee_id` int NOT NULL,
  `leave_type_id` int NOT NULL,
  `applied_on` date DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `start_half` tinyint NOT NULL DEFAULT '0',
  `end_half` tinyint NOT NULL DEFAULT '0',
  `total_leave_days` varchar(255) DEFAULT NULL,
  `leave_reason` varchar(255) DEFAULT NULL,
  `remark` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `created_by` int NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `leave_balances`
--

CREATE TABLE `leave_balances` (
  `id` bigint NOT NULL,
  `emp_id` bigint NOT NULL,
  `leave_type` bigint NOT NULL,
  `balance` float DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `leave_types`
--

CREATE TABLE `leave_types` (
  `id` bigint NOT NULL,
  `title` varchar(255) NOT NULL,
  `days` float DEFAULT NULL,
  `created_by` int NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `loans`
--

CREATE TABLE `loans` (
  `id` bigint NOT NULL,
  `employee_id` int NOT NULL,
  `loan_option` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `amount` int NOT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `reason` varchar(255) NOT NULL,
  `created_by` int NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `loan_options`
--

CREATE TABLE `loan_options` (
  `id` bigint NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_by` int NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `meetings`
--

CREATE TABLE `meetings` (
  `id` bigint NOT NULL,
  `branch_id` int NOT NULL,
  `department_id` longtext NOT NULL,
  `employee_id` longtext NOT NULL,
  `title` varchar(255) NOT NULL,
  `date` date DEFAULT NULL,
  `time` time DEFAULT NULL,
  `note` longtext,
  `created_by` int NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `arrange_by` bigint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `meeting_employees`
--

CREATE TABLE `meeting_employees` (
  `id` bigint NOT NULL,
  `meeting_id` int NOT NULL,
  `employee_id` int NOT NULL,
  `created_by` int NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` bigint NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `model_has_permissions`
--

CREATE TABLE `model_has_permissions` (
  `permission_id` bigint NOT NULL,
  `model_type` varchar(255) NOT NULL,
  `model_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `model_has_roles`
--

CREATE TABLE `model_has_roles` (
  `role_id` bigint NOT NULL,
  `model_type` varchar(255) NOT NULL,
  `model_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `other_payments`
--

CREATE TABLE `other_payments` (
  `id` bigint NOT NULL,
  `employee_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `amount` int NOT NULL,
  `created_by` int NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `overtimes`
--

CREATE TABLE `overtimes` (
  `id` bigint NOT NULL,
  `employee_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `number_of_days` int NOT NULL,
  `hours` int NOT NULL,
  `rate` int NOT NULL,
  `created_by` int NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `password_resets`
--

CREATE TABLE `password_resets` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `id` bigint NOT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `payees`
--

CREATE TABLE `payees` (
  `id` bigint NOT NULL,
  `payee_name` varchar(255) NOT NULL,
  `contact_number` varchar(255) NOT NULL,
  `created_by` int NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `payers`
--

CREATE TABLE `payers` (
  `id` bigint NOT NULL,
  `payer_name` varchar(255) NOT NULL,
  `contact_number` varchar(255) NOT NULL,
  `created_by` int NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `payment_types`
--

CREATE TABLE `payment_types` (
  `id` bigint NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_by` int NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `payslip_types`
--

CREATE TABLE `payslip_types` (
  `id` bigint NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_by` int NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `pay_slips`
--

CREATE TABLE `pay_slips` (
  `id` bigint NOT NULL,
  `employee_id` int NOT NULL,
  `net_payble` int NOT NULL,
  `salary_month` varchar(255) NOT NULL,
  `status` int DEFAULT NULL,
  `basic_salary` int NOT NULL,
  `allowance` longtext NOT NULL,
  `commission` longtext NOT NULL,
  `loan` longtext NOT NULL,
  `saturation_deduction` longtext NOT NULL,
  `other_payment` longtext NOT NULL,
  `overtime` longtext NOT NULL,
  `created_by` int NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `performance__types`
--

CREATE TABLE `performance__types` (
  `id` bigint NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_by` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` bigint NOT NULL,
  `name` varchar(255) NOT NULL,
  `guard_name` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `permissions_local_bc`
--

CREATE TABLE `permissions_local_bc` (
  `id` bigint NOT NULL,
  `name` varchar(255) NOT NULL,
  `guard_name` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint NOT NULL,
  `name` varchar(255) NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` longtext,
  `last_used_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `promotions`
--

CREATE TABLE `promotions` (
  `id` bigint NOT NULL,
  `employee_id` int NOT NULL,
  `designation_id` int NOT NULL,
  `promotion_title` varchar(255) NOT NULL,
  `promotion_date` date DEFAULT NULL,
  `description` varchar(255) NOT NULL,
  `status` smallint DEFAULT '0',
  `created_by` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `resignations`
--

CREATE TABLE `resignations` (
  `id` bigint NOT NULL,
  `employee_id` int NOT NULL,
  `notice_date` date DEFAULT NULL,
  `resignation_date` date DEFAULT NULL,
  `description` varchar(255) NOT NULL,
  `status` smallint DEFAULT '0',
  `created_by` int NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `retirements`
--

CREATE TABLE `retirements` (
  `id` bigint NOT NULL,
  `employee_id` int NOT NULL,
  `notice_date` date DEFAULT NULL,
  `retirement_date` date DEFAULT NULL,
  `description` longtext NOT NULL,
  `status` smallint DEFAULT '0',
  `created_by` int NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` bigint NOT NULL,
  `name` varchar(255) NOT NULL,
  `guard_name` varchar(255) NOT NULL,
  `created_by` int NOT NULL DEFAULT '0',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `role_has_permissions`
--

CREATE TABLE `role_has_permissions` (
  `permission_id` bigint NOT NULL,
  `role_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `roster_group`
--

CREATE TABLE `roster_group` (
  `id` int NOT NULL,
  `name` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `description` varchar(200) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `roster_group_management`
--

CREATE TABLE `roster_group_management` (
  `id` int NOT NULL,
  `roster_group_id` int NOT NULL,
  `day` int NOT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `shift_name` varchar(199) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `total_hours` float(10,2) DEFAULT NULL,
  `status` smallint NOT NULL DEFAULT '1',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `saturation_deductions`
--

CREATE TABLE `saturation_deductions` (
  `id` bigint NOT NULL,
  `employee_id` int NOT NULL,
  `deduction_option` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `amount` int NOT NULL,
  `created_by` int NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `id` bigint NOT NULL,
  `name` varchar(255) NOT NULL,
  `value` varchar(255) NOT NULL,
  `created_by` int NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `set_salaries`
--

CREATE TABLE `set_salaries` (
  `id` bigint NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `terminations`
--

CREATE TABLE `terminations` (
  `id` bigint NOT NULL,
  `employee_id` int NOT NULL,
  `notice_date` date DEFAULT NULL,
  `termination_date` date DEFAULT NULL,
  `termination_type` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `status` smallint DEFAULT '0',
  `created_by` int NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `termination_types`
--

CREATE TABLE `termination_types` (
  `id` bigint NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_by` int NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `tickets`
--

CREATE TABLE `tickets` (
  `id` bigint NOT NULL,
  `title` varchar(255) NOT NULL,
  `employee_id` int NOT NULL,
  `priority` varchar(255) NOT NULL,
  `end_date` date DEFAULT NULL,
  `description` longtext,
  `ticket_code` varchar(255) NOT NULL,
  `ticket_created` int NOT NULL DEFAULT '0',
  `created_by` int NOT NULL,
  `status` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `ticket_replies`
--

CREATE TABLE `ticket_replies` (
  `id` bigint NOT NULL,
  `ticket_id` int NOT NULL,
  `employee_id` int NOT NULL,
  `description` varchar(255) NOT NULL,
  `created_by` int NOT NULL,
  `is_read` int NOT NULL DEFAULT '0',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `time_sheets`
--

CREATE TABLE `time_sheets` (
  `id` bigint NOT NULL,
  `employee_id` int NOT NULL DEFAULT '0',
  `date` date DEFAULT NULL,
  `hours` double NOT NULL DEFAULT '0',
  `remark` longtext,
  `created_by` int NOT NULL DEFAULT '0',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `trainers`
--

CREATE TABLE `trainers` (
  `id` bigint NOT NULL,
  `branch` varchar(255) NOT NULL,
  `firstname` varchar(255) NOT NULL,
  `lastname` varchar(255) NOT NULL,
  `contact` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `address` longtext,
  `expertise` longtext,
  `created_by` int NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `trainings`
--

CREATE TABLE `trainings` (
  `id` bigint NOT NULL,
  `branch` int DEFAULT NULL,
  `trainer_option` int DEFAULT NULL,
  `training_type` int DEFAULT NULL,
  `trainer` int DEFAULT NULL,
  `training_cost` double DEFAULT '0',
  `employee` varchar(200) DEFAULT NULL,
  `attended_employee` varchar(200) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `description` longtext,
  `performance` int NOT NULL DEFAULT '0',
  `status` int NOT NULL DEFAULT '0',
  `remarks` longtext,
  `created_by` int NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `training_types`
--

CREATE TABLE `training_types` (
  `id` bigint NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_by` int NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `transfers`
--

CREATE TABLE `transfers` (
  `id` bigint NOT NULL,
  `employee_id` int NOT NULL,
  `branch_id` int NOT NULL,
  `department_id` int NOT NULL,
  `transfer_date` date DEFAULT NULL,
  `description` varchar(255) NOT NULL,
  `status` smallint DEFAULT '0',
  `created_by` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `transfer_balances`
--

CREATE TABLE `transfer_balances` (
  `id` bigint NOT NULL,
  `from_account_id` int NOT NULL,
  `to_account_id` int NOT NULL,
  `date` date DEFAULT NULL,
  `amount` int NOT NULL,
  `payment_type_id` int NOT NULL,
  `referal_id` varchar(255) DEFAULT NULL,
  `description` longtext,
  `created_by` int NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `travels`
--

CREATE TABLE `travels` (
  `id` bigint NOT NULL,
  `employee_id` int NOT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `purpose_of_visit` varchar(255) NOT NULL,
  `place_of_visit` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `status` smallint DEFAULT '0',
  `created_by` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(250) NOT NULL,
  `email_verified_at` datetime DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `lang` varchar(255) NOT NULL,
  `is_transfer` int DEFAULT NULL,
  `is_resignation` int DEFAULT NULL,
  `is_retirement` smallint DEFAULT '0',
  `is_promotion` int DEFAULT NULL,
  `is_termination` int DEFAULT NULL,
  `last_login` datetime DEFAULT NULL,
  `is_active` int NOT NULL DEFAULT '1',
  `created_by` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `messenger_color` varchar(255) NOT NULL DEFAULT '#2180f3',
  `dark_mode` smallint NOT NULL DEFAULT '0',
  `active_status` smallint NOT NULL DEFAULT '0',
  `otp` longtext,
  `employee_code` char(255) DEFAULT NULL,
  `hms_id` int DEFAULT NULL,
  `biometrix_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `warnings`
--

CREATE TABLE `warnings` (
  `id` bigint NOT NULL,
  `warning_to` int NOT NULL,
  `warning_by` int NOT NULL,
  `subject` varchar(255) NOT NULL,
  `warning_date` date DEFAULT NULL,
  `description` varchar(255) NOT NULL,
  `created_by` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `zoom_meetings`
--

CREATE TABLE `zoom_meetings` (
  `id` bigint NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `meeting_id` varchar(255) NOT NULL DEFAULT '0',
  `user_id` varchar(255) NOT NULL DEFAULT '0',
  `password` varchar(255) DEFAULT NULL,
  `start_date` datetime NOT NULL,
  `duration` int NOT NULL DEFAULT '0',
  `start_url` longtext,
  `join_url` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT 'waiting',
  `created_by` int NOT NULL DEFAULT '0',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `account_lists`
--
ALTER TABLE `account_lists`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `activity_records`
--
ALTER TABLE `activity_records`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `allowances`
--
ALTER TABLE `allowances`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `allowance_options`
--
ALTER TABLE `allowance_options`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `announcements`
--
ALTER TABLE `announcements`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `announcement_employees`
--
ALTER TABLE `announcement_employees`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `appraisals`
--
ALTER TABLE `appraisals`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `assets`
--
ALTER TABLE `assets`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `attendance_employees`
--
ALTER TABLE `attendance_employees`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `awards`
--
ALTER TABLE `awards`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `award_types`
--
ALTER TABLE `award_types`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `biomatrix_api_details`
--
ALTER TABLE `biomatrix_api_details`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `biomatrix_log`
--
ALTER TABLE `biomatrix_log`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `branches`
--
ALTER TABLE `branches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `ch_favorites`
--
ALTER TABLE `ch_favorites`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `ch_messages`
--
ALTER TABLE `ch_messages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `commissions`
--
ALTER TABLE `commissions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `company_policies`
--
ALTER TABLE `company_policies`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `competencies`
--
ALTER TABLE `competencies`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `complaints`
--
ALTER TABLE `complaints`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `crms`
--
ALTER TABLE `crms`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `custom_questions`
--
ALTER TABLE `custom_questions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `deduction_options`
--
ALTER TABLE `deduction_options`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `deposits`
--
ALTER TABLE `deposits`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `designations`
--
ALTER TABLE `designations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `documents`
--
ALTER TABLE `documents`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `ducument_uploads`
--
ALTER TABLE `ducument_uploads`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `employee_documents`
--
ALTER TABLE `employee_documents`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `employee_documents_details`
--
ALTER TABLE `employee_documents_details`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `employee_extra_payment`
--
ALTER TABLE `employee_extra_payment`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `employee_manage_track_status`
--
ALTER TABLE `employee_manage_track_status`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `event_employees`
--
ALTER TABLE `event_employees`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `expenses`
--
ALTER TABLE `expenses`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `expense_types`
--
ALTER TABLE `expense_types`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `genrate_payslip_options`
--
ALTER TABLE `genrate_payslip_options`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `goal_trackings`
--
ALTER TABLE `goal_trackings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `goal_types`
--
ALTER TABLE `goal_types`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `holidays`
--
ALTER TABLE `holidays`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `income_types`
--
ALTER TABLE `income_types`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `indicators`
--
ALTER TABLE `indicators`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `interview_schedules`
--
ALTER TABLE `interview_schedules`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `ip_restricts`
--
ALTER TABLE `ip_restricts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `job_applications`
--
ALTER TABLE `job_applications`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `job_application_notes`
--
ALTER TABLE `job_application_notes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `job_categories`
--
ALTER TABLE `job_categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `job_on_boards`
--
ALTER TABLE `job_on_boards`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `job_stages`
--
ALTER TABLE `job_stages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `landing_page_sections`
--
ALTER TABLE `landing_page_sections`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `leaves`
--
ALTER TABLE `leaves`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `leave_balances`
--
ALTER TABLE `leave_balances`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `leave_types`
--
ALTER TABLE `leave_types`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `loans`
--
ALTER TABLE `loans`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `loan_options`
--
ALTER TABLE `loan_options`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `meetings`
--
ALTER TABLE `meetings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `meeting_employees`
--
ALTER TABLE `meeting_employees`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `model_has_permissions`
--
ALTER TABLE `model_has_permissions`
  ADD PRIMARY KEY (`permission_id`,`model_type`,`model_id`),
  ADD KEY `model_has_permissions_model_id_model_type_index` (`model_id`,`model_type`);

--
-- Indexes for table `model_has_roles`
--
ALTER TABLE `model_has_roles`
  ADD PRIMARY KEY (`role_id`,`model_type`,`model_id`),
  ADD KEY `model_has_roles_model_id_model_type_index` (`model_id`,`model_type`);

--
-- Indexes for table `other_payments`
--
ALTER TABLE `other_payments`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `overtimes`
--
ALTER TABLE `overtimes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `password_resets`
--
ALTER TABLE `password_resets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `password_resets_email_index` (`email`);

--
-- Indexes for table `payees`
--
ALTER TABLE `payees`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `payers`
--
ALTER TABLE `payers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `payment_types`
--
ALTER TABLE `payment_types`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `payslip_types`
--
ALTER TABLE `payslip_types`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `pay_slips`
--
ALTER TABLE `pay_slips`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `performance__types`
--
ALTER TABLE `performance__types`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `permissions_local_bc`
--
ALTER TABLE `permissions_local_bc`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`);

--
-- Indexes for table `promotions`
--
ALTER TABLE `promotions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `resignations`
--
ALTER TABLE `resignations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `retirements`
--
ALTER TABLE `retirements`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `role_has_permissions`
--
ALTER TABLE `role_has_permissions`
  ADD PRIMARY KEY (`permission_id`,`role_id`),
  ADD KEY `role_has_permissions_role_id_foreign` (`role_id`);

--
-- Indexes for table `roster_group`
--
ALTER TABLE `roster_group`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `roster_group_management`
--
ALTER TABLE `roster_group_management`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `saturation_deductions`
--
ALTER TABLE `saturation_deductions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `settings_name_created_by_unique` (`name`,`created_by`);

--
-- Indexes for table `set_salaries`
--
ALTER TABLE `set_salaries`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `terminations`
--
ALTER TABLE `terminations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `termination_types`
--
ALTER TABLE `termination_types`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tickets`
--
ALTER TABLE `tickets`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `ticket_replies`
--
ALTER TABLE `ticket_replies`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `time_sheets`
--
ALTER TABLE `time_sheets`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `trainers`
--
ALTER TABLE `trainers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `trainings`
--
ALTER TABLE `trainings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `training_types`
--
ALTER TABLE `training_types`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `transfers`
--
ALTER TABLE `transfers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `transfer_balances`
--
ALTER TABLE `transfer_balances`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `travels`
--
ALTER TABLE `travels`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- Indexes for table `warnings`
--
ALTER TABLE `warnings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `zoom_meetings`
--
ALTER TABLE `zoom_meetings`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `account_lists`
--
ALTER TABLE `account_lists`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `activity_records`
--
ALTER TABLE `activity_records`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `allowances`
--
ALTER TABLE `allowances`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `allowance_options`
--
ALTER TABLE `allowance_options`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `announcements`
--
ALTER TABLE `announcements`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `announcement_employees`
--
ALTER TABLE `announcement_employees`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `appraisals`
--
ALTER TABLE `appraisals`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `assets`
--
ALTER TABLE `assets`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `attendance_employees`
--
ALTER TABLE `attendance_employees`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `awards`
--
ALTER TABLE `awards`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `award_types`
--
ALTER TABLE `award_types`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `biomatrix_api_details`
--
ALTER TABLE `biomatrix_api_details`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `biomatrix_log`
--
ALTER TABLE `biomatrix_log`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `branches`
--
ALTER TABLE `branches`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `commissions`
--
ALTER TABLE `commissions`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `company_policies`
--
ALTER TABLE `company_policies`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `competencies`
--
ALTER TABLE `competencies`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `complaints`
--
ALTER TABLE `complaints`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `crms`
--
ALTER TABLE `crms`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `custom_questions`
--
ALTER TABLE `custom_questions`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `deduction_options`
--
ALTER TABLE `deduction_options`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `deposits`
--
ALTER TABLE `deposits`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `designations`
--
ALTER TABLE `designations`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `documents`
--
ALTER TABLE `documents`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ducument_uploads`
--
ALTER TABLE `ducument_uploads`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `employees`
--
ALTER TABLE `employees`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `employee_documents`
--
ALTER TABLE `employee_documents`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `employee_documents_details`
--
ALTER TABLE `employee_documents_details`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `employee_extra_payment`
--
ALTER TABLE `employee_extra_payment`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `employee_manage_track_status`
--
ALTER TABLE `employee_manage_track_status`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `events`
--
ALTER TABLE `events`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `event_employees`
--
ALTER TABLE `event_employees`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `expenses`
--
ALTER TABLE `expenses`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `expense_types`
--
ALTER TABLE `expense_types`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `genrate_payslip_options`
--
ALTER TABLE `genrate_payslip_options`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `goal_trackings`
--
ALTER TABLE `goal_trackings`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `goal_types`
--
ALTER TABLE `goal_types`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `holidays`
--
ALTER TABLE `holidays`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `income_types`
--
ALTER TABLE `income_types`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `indicators`
--
ALTER TABLE `indicators`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `interview_schedules`
--
ALTER TABLE `interview_schedules`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ip_restricts`
--
ALTER TABLE `ip_restricts`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `job_applications`
--
ALTER TABLE `job_applications`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `job_application_notes`
--
ALTER TABLE `job_application_notes`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `job_categories`
--
ALTER TABLE `job_categories`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `job_on_boards`
--
ALTER TABLE `job_on_boards`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `job_stages`
--
ALTER TABLE `job_stages`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `landing_page_sections`
--
ALTER TABLE `landing_page_sections`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `leaves`
--
ALTER TABLE `leaves`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `leave_balances`
--
ALTER TABLE `leave_balances`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `leave_types`
--
ALTER TABLE `leave_types`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `loans`
--
ALTER TABLE `loans`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `loan_options`
--
ALTER TABLE `loan_options`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `meetings`
--
ALTER TABLE `meetings`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `meeting_employees`
--
ALTER TABLE `meeting_employees`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `other_payments`
--
ALTER TABLE `other_payments`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `overtimes`
--
ALTER TABLE `overtimes`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `password_resets`
--
ALTER TABLE `password_resets`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payees`
--
ALTER TABLE `payees`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payers`
--
ALTER TABLE `payers`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payment_types`
--
ALTER TABLE `payment_types`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payslip_types`
--
ALTER TABLE `payslip_types`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pay_slips`
--
ALTER TABLE `pay_slips`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `performance__types`
--
ALTER TABLE `performance__types`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `permissions_local_bc`
--
ALTER TABLE `permissions_local_bc`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `promotions`
--
ALTER TABLE `promotions`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `resignations`
--
ALTER TABLE `resignations`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `retirements`
--
ALTER TABLE `retirements`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `roster_group`
--
ALTER TABLE `roster_group`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `roster_group_management`
--
ALTER TABLE `roster_group_management`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `saturation_deductions`
--
ALTER TABLE `saturation_deductions`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `settings`
--
ALTER TABLE `settings`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `set_salaries`
--
ALTER TABLE `set_salaries`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `terminations`
--
ALTER TABLE `terminations`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `termination_types`
--
ALTER TABLE `termination_types`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tickets`
--
ALTER TABLE `tickets`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ticket_replies`
--
ALTER TABLE `ticket_replies`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `time_sheets`
--
ALTER TABLE `time_sheets`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `trainers`
--
ALTER TABLE `trainers`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `trainings`
--
ALTER TABLE `trainings`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `training_types`
--
ALTER TABLE `training_types`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `transfers`
--
ALTER TABLE `transfers`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `transfer_balances`
--
ALTER TABLE `transfer_balances`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `travels`
--
ALTER TABLE `travels`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `warnings`
--
ALTER TABLE `warnings`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `zoom_meetings`
--
ALTER TABLE `zoom_meetings`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
