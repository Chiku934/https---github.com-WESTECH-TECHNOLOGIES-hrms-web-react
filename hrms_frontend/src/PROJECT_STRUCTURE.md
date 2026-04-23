# HRMS Frontend Structure

This project is organized to support a frontend-first HRMS with five role-based screens:

- Super Admin
- Sub Admin
- Company Admin
- HR
- Employee

## Folder Purpose

```txt
src/
  app/                App bootstrap, routing, role config
  assets/             CSS, images, icons
  components/         Shared reusable UI and layout pieces
  layouts/            Role-based shell layouts
  features/           Role-specific pages and logic
  data/               Navigation and frontend mock data
  hooks/              Shared React hooks
  utils/              Pure helper functions
  styles/             Optional global style entry points
```

## Feature Rules

- Put shared UI in `src/components/ui`
- Put shared shell pieces in `src/components/layout`
- Put role-specific pages in `src/features/<role>/pages`
- Put role-specific mock data in `src/features/<role>/data`
- Put shared mock data in `src/data/mock`
- Put role menus in `src/data/navigation`

## Role Split

### Super Admin
- Dashboard
- Clients
- Packages
- Location Master
- Reports

### Sub Admin
- Dashboard
- Client Access
- Permission Management
- Reports

### Company Admin
- Dashboard
- Employee Management
- Create Team
- Project Management
- Assign Team to Project
- Reports

### HR
- Dashboard
- Department Master
- Designation Master
- Leave Management
- Holiday List
- Attendance
- Payroll
- Reports

### Employee
- Dashboard
- Attendance
- Leave Apply
- Leave Status
- Timesheet
- Performance
- Helpdesk
- Payroll

## Current Migration Approach

The existing pages can stay in place while the app is gradually moved into this structure.
That keeps the UI stable while we split screens by role in a maintainable way.
