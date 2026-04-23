$path = 'C:\Users\sdipt\Downloads\hrms.sql'
$content = Get-Content -LiteralPath $path -Raw

$content = [regex]::Replace($content, '`ip_address`\s+int\(11\) DEFAULT NULL,', '`ip_address` varchar(45) DEFAULT NULL,')
$content = [regex]::Replace($content, '`verified_at`\s+timestamp NOT NULL DEFAULT current_timestamp\(\) ON UPDATE current_timestamp\(\),', '`verified_at` timestamp NULL DEFAULT NULL,')

if ($content -notmatch '-- =====================================================================\s+-- SAMPLE DATA') {
  $sample = @'
-- =====================================================================
-- SAMPLE DATA  (Indian context)
-- =====================================================================

-- ---- Master permissions ----
INSERT INTO `permissions` (`id`, `code`, `module`, `description`) VALUES
    (1, 'employee.view',     'employee',   'View employees'),
    (2, 'employee.create',   'employee',   'Create employees'),
    (3, 'employee.update',   'employee',   'Update employees'),
    (4, 'employee.delete',   'employee',   'Delete / deactivate employees'),
    (5, 'department.view',   'department', 'View departments'),
    (6, 'department.manage', 'department', 'Create/update departments'),
    (7, 'role.manage',       'rbac',       'Manage roles and permissions'),
    (8, 'document.view',     'document',   'View employee documents'),
    (9, 'document.upload',   'document',   'Upload employee documents'),
    (10, 'document.verify',  'document',   'Verify documents'),
    (11, 'payroll.view',     'payroll',    'View payroll'),
    (12, 'payroll.process',   'payroll',    'Run payroll'),
    (13, 'leave.view',       'leave',      'View leave records'),
    (14, 'leave.approve',    'leave',      'Approve leave requests');

-- ---- System-wide document types ----
INSERT INTO `document_types` (`id`, `company_id`, `name`, `category`, `is_required`, `has_expiry`) VALUES
    (1, NULL, 'Aadhaar Card',    'identity',   1, 0),
    (2, NULL, 'PAN Card',        'identity',   1, 0),
    (3, NULL, 'Passport',        'identity',   0, 1),
    (4, NULL, 'Driving Licence', 'identity',   0, 1),
    (5, NULL, '10th Marksheet',  'education',  0, 0),
    (6, NULL, '12th Marksheet',  'education',  0, 0),
    (7, NULL, 'Degree Certificate','education', 0, 0),
    (8, NULL, 'Offer Letter',    'employment', 0, 0),
    (9, NULL, 'Relieving Letter','employment', 0, 0),
    (10, NULL, 'Experience Letter','employment',0, 0);

-- ---- Companies (2 tenants) ----
INSERT INTO `companies` (`id`, `name`, `slug`, `legal_name`, `country_code`, `timezone`, `plan`, `status`) VALUES
    (1, 'Suryodaya Technologies', 'suryodaya', 'Suryodaya Technologies Pvt Ltd', 'IN', 'Asia/Kolkata', 'pro',        'active'),
    (2, 'Nilgiri Analytics',      'nilgiri',   'Nilgiri Analytics Pvt Ltd',      'IN', 'Asia/Kolkata', 'enterprise', 'active');

-- ---- Global users (login identities) ----
INSERT INTO `users` (`id`, `email`, `password_hash`, `phone`, `is_active`, `email_verified`) VALUES
    (1, 'arjun.sharma@suryodaya.in',  '$2b$10$abcdefghijklmnopqrstuv', '+919812345001', 1, 1),
    (2, 'priya.iyer@suryodaya.in',    '$2b$10$abcdefghijklmnopqrstuv', '+919812345002', 1, 1),
    (3, 'rahul.verma@suryodaya.in',   '$2b$10$abcdefghijklmnopqrstuv', '+919812345003', 1, 1),
    (4, 'sneha.patil@suryodaya.in',   '$2b$10$abcdefghijklmnopqrstuv', '+919812345004', 1, 1),
    (5, 'vikram.reddy@suryodaya.in',  '$2b$10$abcdefghijklmnopqrstuv', '+919812345005', 1, 1),
    (6, 'ananya.banerjee@nilgiri.in', '$2b$10$abcdefghijklmnopqrstuv', '+919812345006', 1, 1),
    (7, 'kartik.mehta@nilgiri.in',    '$2b$10$abcdefghijklmnopqrstuv', '+919812345007', 1, 1),
    (8, 'meera.nair@nilgiri.in',      '$2b$10$abcdefghijklmnopqrstuv', '+919812345008', 1, 1);

-- ---- Company memberships ----
INSERT INTO `company_users` (`id`, `company_id`, `user_id`, `employee_code`, `status`, `joined_at`) VALUES
    (1, 1, 1, 'SUR001', 'active', '2022-04-01'),
    (2, 1, 2, 'SUR002', 'active', '2022-06-15'),
    (3, 1, 3, 'SUR003', 'active', '2023-01-10'),
    (4, 1, 4, 'SUR004', 'active', '2023-07-20'),
    (5, 1, 5, 'SUR005', 'active', '2024-02-05'),
    (6, 2, 6, 'NIL001', 'active', '2021-08-10'),
    (7, 2, 7, 'NIL002', 'active', '2022-11-01'),
    (8, 2, 8, 'NIL003', 'active', '2024-03-18');

-- ---- Roles (per company) ----
INSERT INTO `roles` (`id`, `company_id`, `name`, `description`, `is_system`) VALUES
    (1, 1, 'Super Admin',  'Full access to everything',       1),
    (2, 1, 'HR Manager',   'Manages employees and documents', 0),
    (3, 1, 'Team Lead',    'Approves leaves for team',        0),
    (4, 1, 'Employee',     'Self-service access',             1),
    (5, 2, 'Super Admin',  'Full access to everything',       1),
    (6, 2, 'HR Executive', 'HR operations',                   0),
    (7, 2, 'Employee',     'Self-service access',             1);

-- ---- Role permissions ----
INSERT INTO `role_permissions` (`role_id`, `permission_id`) SELECT 1, `id` FROM `permissions`;
INSERT INTO `role_permissions` (`role_id`, `permission_id`) SELECT 2, `id` FROM `permissions` WHERE `code` IN ('employee.view','employee.create','employee.update','department.view','department.manage','document.view','document.upload','document.verify','leave.view','leave.approve');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) SELECT 3, `id` FROM `permissions` WHERE `code` IN ('employee.view','leave.view','leave.approve','document.view');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) SELECT 4, `id` FROM `permissions` WHERE `code` IN ('employee.view','document.view','document.upload','leave.view');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) SELECT 5, `id` FROM `permissions`;
INSERT INTO `role_permissions` (`role_id`, `permission_id`) SELECT 6, `id` FROM `permissions` WHERE `code` IN ('employee.view','employee.create','employee.update','document.view','document.upload','document.verify','leave.view','leave.approve');
INSERT INTO `role_permissions` (`role_id`, `permission_id`) SELECT 7, `id` FROM `permissions` WHERE `code` IN ('employee.view','document.view','document.upload','leave.view');

-- ---- User-role assignments ----
INSERT INTO `user_roles` (`company_user_id`, `role_id`) VALUES
    (1, 1),
    (2, 2),
    (3, 3),
    (3, 4),
    (4, 4),
    (5, 4),
    (6, 5),
    (7, 6),
    (8, 7);

-- ---- Departments ----
INSERT INTO `departments` (`id`, `company_id`, `name`, `code`, `parent_id`, `head_id`) VALUES
    (1, 1, 'Engineering',     'ENG', NULL, 1),
    (2, 1, 'Human Resources', 'HR',  NULL, 2),
    (3, 1, 'Backend',         'BE',  1,    3),
    (4, 1, 'Frontend',        'FE',  1,    NULL),
    (5, 2, 'Data Science',    'DS',  NULL, 6),
    (6, 2, 'Human Resources',  'HR',  NULL, 7);

-- ---- Designations ----
INSERT INTO `designations` (`id`, `company_id`, `title`, `level`) VALUES
    (1, 1, 'Chief Technology Officer', 10),
    (2, 1, 'HR Manager',               7),
    (3, 1, 'Senior Software Engineer', 6),
    (4, 1, 'Software Engineer',        4),
    (5, 1, 'Junior Software Engineer', 3),
    (6, 2, 'Head of Data Science',     9),
    (7, 2, 'HR Executive',             5),
    (8, 2, 'Data Analyst',             4);

-- ---- Employee profiles ----
INSERT INTO `employee_profiles`
    (`company_user_id`, `first_name`, `middle_name`, `last_name`, `dob`, `gender`, `marital_status`,
     `blood_group`, `personal_email`, `personal_phone`,
     `emergency_contact_name`, `emergency_contact_phone`,
     `address_line1`, `address_line2`, `city`, `state`, `country`, `postal_code`, `extra_data`)
VALUES
    (1, 'Arjun',  'Kumar', 'Sharma',   '1985-05-12', 'Male',   'Married', 'B+',
     'arjun.sharma85@gmail.com', '+919812345001',
     'Kavita Sharma', '+919812399001',
     'Flat 402, Green Meadows', 'Sector 18', 'Noida', 'Uttar Pradesh', 'India', '201301',
     '{"nationality":"Indian","languages":["Hindi","English"],"pan":"ABCDE1234F"}'),

    (2, 'Priya',  NULL,    'Iyer',     '1990-08-24', 'Female', 'Married', 'O+',
     'priya.iyer90@gmail.com', '+919812345002',
     'Ramesh Iyer', '+919812399002',
     '12, Brigade Gateway', 'Rajajinagar', 'Bengaluru', 'Karnataka', 'India', '560010',
     '{"nationality":"Indian","languages":["Tamil","Kannada","English"]}'),

    (3, 'Rahul',  'Singh', 'Verma',    '1992-11-03', 'Male',   'Single',  'A+',
     'rahul.verma92@gmail.com', '+919812345003',
     'Sunita Verma', '+919812399003',
     'H-14, Vasant Kunj', NULL, 'New Delhi', 'Delhi', 'India', '110070',
     '{"nationality":"Indian","languages":["Hindi","English"]}'),

    (4, 'Sneha',  NULL,    'Patil',    '1995-02-17', 'Female', 'Single',  'AB+',
     'sneha.patil95@gmail.com', '+919812345004',
     'Ajay Patil', '+919812399004',
     'Flat 7B, Hiranandani', 'Powai', 'Mumbai', 'Maharashtra', 'India', '400076',
     '{"nationality":"Indian","languages":["Marathi","Hindi","English"]}'),

    (5, 'Vikram', NULL,    'Reddy',    '1998-07-29', 'Male',   'Single',  'O-',
     'vikram.reddy98@gmail.com', '+919812345005',
     'Lakshmi Reddy', '+919812399005',
     'Plot 21, Jubilee Hills', 'Road No. 36', 'Hyderabad', 'Telangana', 'India', '500033',
     '{"nationality":"Indian","languages":["Telugu","English"]}'),

    (6, 'Ananya', NULL,    'Banerjee', '1987-03-09', 'Female', 'Married', 'B-',
     'ananya.b87@gmail.com', '+919812345006',
     'Subrata Banerjee', '+919812399006',
     '45, Salt Lake Sector V', NULL, 'Kolkata', 'West Bengal', 'India', '700091',
     '{"nationality":"Indian","languages":["Bengali","English","Hindi"]}'),

    (7, 'Kartik', NULL,    'Mehta',    '1991-09-15', 'Male',   'Married', 'A-',
     'kartik.mehta91@gmail.com', '+919812345007',
     'Neha Mehta', '+919812399007',
     'B-203, Satellite', NULL, 'Ahmedabad', 'Gujarat', 'India', '380015',
     '{"nationality":"Indian","languages":["Gujarati","Hindi","English"]}'),

    (8, 'Meera',  NULL,    'Nair',     '1996-12-21', 'Female', 'Single',  'O+',
     'meera.nair96@gmail.com', '+919812345008',
     'Rajan Nair', '+919812399008',
     'TC 9/1234, Vellayambalam', NULL, 'Thiruvananthapuram', 'Kerala', 'India', '695010',
     '{"nationality":"Indian","languages":["Malayalam","English","Hindi"]}');

-- ---- Employee assignments (current) ----
INSERT INTO `employee_assignments`
    (`id`, `company_user_id`, `department_id`, `designation_id`, `manager_id`, `employment_type`, `work_location`, `start_date`, `end_date`, `is_current`)
VALUES
    (1, 1, 1, 1, NULL, 'full-time', 'Noida',              '2022-04-01', NULL, 1),
    (2, 2, 2, 2, 1,    'full-time', 'Bengaluru',          '2022-06-15', NULL, 1),
    (3, 3, 3, 3, 1,    'full-time', 'New Delhi',          '2023-01-10', NULL, 1),
    (4, 4, 3, 4, 3,    'full-time', 'Mumbai',             '2023-07-20', NULL, 1),
    (5, 5, 4, 5, 3,    'full-time', 'Hyderabad',          '2024-02-05', NULL, 1),
    (6, 6, 5, 6, NULL, 'full-time', 'Kolkata',            '2021-08-10', NULL, 1),
    (7, 7, 6, 7, 6,    'full-time', 'Ahmedabad',          '2022-11-01', NULL, 1),
    (8, 8, 5, 8, 6,    'full-time', 'Thiruvananthapuram',  '2024-03-18', NULL, 1);

-- ---- Custom fields ----
INSERT INTO `custom_fields` (`id`, `company_id`, `entity`, `field_key`, `field_label`, `field_type`, `options`, `is_required`) VALUES
    (1, 1, 'employee', 'tshirt_size', 'T-Shirt Size', 'select', '["S","M","L","XL","XXL"]', 0),
    (2, 1, 'employee', 'pf_number',   'PF Number',    'text',   NULL, 0);

-- ---- Sample documents ----
INSERT INTO `employee_documents`
    (`id`, `company_id`, `company_user_id`, `document_type_id`, `file_name`, `file_url`, `mime_type`,
     `document_number`, `issued_date`, `verified`, `verified_by`, `verified_at`)
VALUES
    (1, 1, 1, 1, 'arjun_aadhaar.pdf', 's3://hrms/sur/1/aadhaar.pdf', 'application/pdf',
     '1234 5678 9012', '2012-06-01', 1, 2, NOW()),
    (2, 1, 1, 2, 'arjun_pan.pdf',     's3://hrms/sur/1/pan.pdf',     'application/pdf',
     'ABCDE1234F', '2010-04-15', 1, 2, NOW()),
    (3, 1, 3, 1, 'rahul_aadhaar.pdf', 's3://hrms/sur/3/aadhaar.pdf', 'application/pdf',
     '2345 6789 0123', '2013-07-10', 1, 2, NOW()),
    (4, 1, 4, 1, 'sneha_aadhaar.pdf', 's3://hrms/sur/4/aadhaar.pdf', 'application/pdf',
     '3456 7890 1234', '2014-08-22', 0, NULL, NULL),
    (5, 2, 6, 2, 'ananya_pan.pdf',    's3://hrms/nil/6/pan.pdf',     'application/pdf',
     'FGHIJ5678K', '2011-05-03', 1, 7, NOW()),
    (6, 2, 8, 1, 'meera_aadhaar.pdf', 's3://hrms/nil/8/aadhaar.pdf', 'application/pdf',
     '4567 8901 2345', '2015-10-12', 0, NULL, NULL);

-- =====================================================================
-- END OF SAMPLE DATA
-- =====================================================================
'@
  $content = $content.Replace('-- Constraints for dumped tables', "$sample`r`n-- Constraints for dumped tables")
}

Set-Content -LiteralPath $path -Value $content -NoNewline
