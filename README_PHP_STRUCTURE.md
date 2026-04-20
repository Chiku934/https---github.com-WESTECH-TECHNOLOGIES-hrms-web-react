# HRMS PHP Structure Draft

## Public entry points
- `public/index.php`
- `public/dashboard.php`
- `public/user-attendance.php`
- `public/timesheet.php`

## Shared layout
- `app/includes/head.php`
- `app/includes/header.php`
- `app/includes/sidebar.php`
- `app/includes/footer.php`

## Configuration
- `app/config/app.php`

## Assets
- `public/assets/css/main.css`
- `public/assets/css/profile.css`
- `public/assets/js/login.js`
- `public/assets/js/header.js`
- `public/assets/js/sidebar.js`
- `public/assets/images/*`

## Migration rule
- Move one page at a time.
- Keep the original HTML until the PHP page matches it exactly.
- Replace shared fragments with includes first.
