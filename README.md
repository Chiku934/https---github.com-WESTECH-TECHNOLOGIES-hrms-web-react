# HRMS Next-Step Plan

This repository is an HRMS project that now has a mostly database-backed backend and a frontend that still contains some demo/localStorage flows.

The next goal is to finish frontend integration against the real backend, then close the remaining gaps so the app behaves like a single working product.

## Current Status

### What is already in place

- MySQL/MariaDB database schema is available in `newhrms.sql`
- Backend uses Prisma with MySQL/MariaDB
- Main backend entities already have controllers and routes:
  - auth
  - users
  - company users
  - employees
  - employee profiles
  - employee assignments
  - departments
  - designations
  - roles
  - permissions
  - role permissions
  - user roles
  - custom fields
  - document types
  - audit logs
- Backend starts successfully from `hrms_backend/`
- Frontend production build completes successfully

### What is still not fully finished

- Frontend login is still demo-based in some places
- User setup still uses localStorage in some places
- Role display and navigation still depend on localStorage
- Employee document upload/manage flow is not fully exposed as a dedicated API module yet
- Some README instructions were outdated and pointed to old folder names or old mock flow

## Next Goal

Make the frontend use the backend as the source of truth for:

- login
- current user profile
- users
- employees
- departments
- designations
- roles
- permissions
- audit logs
- user setup data

## What We Should Complete First

1. Keep the backend stable.
2. Replace frontend demo flows with API calls.
3. Connect one screen at a time.
4. Verify each screen after reload.
5. Only then add the remaining document/upload and polish work.

## Database Source

Use `newhrms.sql` as the base schema and seed source.

Important tables:

- `companies`
- `users`
- `company_users`
- `permissions`
- `roles`
- `role_permissions`
- `user_roles`
- `departments`
- `designations`
- `employee_profiles`
- `employee_assignments`
- `custom_fields`
- `document_types`
- `employee_documents`
- `audit_logs`

## Backend Readiness Check

Before frontend integration, confirm these backend points:

- `npm run dev` works from `hrms_backend/`
- `/api/health` responds correctly
- `/api/auth/login` returns token and user payload
- `/api/auth/me` returns the authenticated user
- `/api/employees` returns company-scoped employee data
- `/api/departments` and `/api/designations` return master data
- `/api/users` works for the intended roles
- `/api/roles`, `/api/permissions`, `/api/user-roles`, and `/api/role-permissions` work
- `/api/audit-logs` is available for tracking actions

## AI-Assisted Work Plan

Use AI one step at a time. Do not ask it to change the whole app in one prompt.

### Phase 1: Lock the backend contract

Goal: make sure frontend integration has a stable API shape.

Tasks:

1. Verify response format for auth
2. Verify response format for employee list
3. Verify response format for departments and designations
4. Verify response format for users and roles
5. List the missing endpoints that the frontend still needs

AI prompt examples:

- "Inspect the backend auth and employee controllers and summarize the exact JSON response shapes."
- "List the missing endpoints needed for frontend integration based on the current API layer."

### Phase 2: Replace frontend login

Goal: stop using hardcoded demo users.

Tasks:

1. Replace demo login logic in `hrms_frontend/src/pages/Login.jsx`
2. Call `/api/auth/login`
3. Save token and role from backend response
4. Redirect based on the returned role
5. Show API error messages clearly

AI prompt example:

- "Rewrite the login page to use the real auth API and preserve the current UI behavior."

### Phase 3: Replace localStorage user setup

Goal: make user setup data come from the backend.

Tasks:

1. Replace `loadUserSetupUsers`
2. Replace `saveUserSetupUsers`
3. Replace `loadUserSetupDocuments`
4. Replace `saveUserSetupDocuments`
5. Replace `loadUserSetupAddresses`
6. Replace `saveUserSetupAddresses`
7. Read/write through API calls instead of browser storage

AI prompt example:

- "Convert the user setup service from localStorage to API-based data fetching and saving."

### Phase 4: Connect employee management

Goal: use backend employee data everywhere.

Tasks:

1. Load employee list from `/api/employees`
2. Load employee detail from `/api/employees/:id`
3. Create employees through backend
4. Update employees through backend
5. Delete employees through backend
6. Refresh list after every change

AI prompt example:

- "Update the employee management screen to use the backend API and keep the current table and form UI."

### Phase 5: Connect master data screens

Goal: departments and designations should come from the database.

Tasks:

1. Replace static department data
2. Replace static designation data
3. Use backend create/update/delete endpoints
4. Reuse one shared API pattern for both screens

AI prompt example:

- "Refactor department and designation screens to use the real backend endpoints with minimal UI changes."

### Phase 6: Role and navigation cleanup

Goal: stop relying on localStorage for role state where possible.

Tasks:

1. Use `/api/auth/me` to resolve the current role
2. Store only the token locally
3. Derive navigation from backend user data
4. Keep localStorage only as a fallback during migration

AI prompt example:

- "Replace frontend role detection with backend-driven auth state while preserving current navigation behavior."

### Phase 7: Document flow

Goal: finish document-related functionality.

Tasks:

1. Confirm whether an employee document CRUD/upload endpoint is needed
2. Add the missing backend route if required
3. Connect frontend document forms to the API
4. Attach documents to the correct company user and company

AI prompt example:

- "Check the current schema and backend routes, then design the missing employee document API and frontend integration path."

### Phase 8: Validation and audit

Goal: make sure changes are safe and traceable.

Tasks:

1. Add loading states
2. Add error states
3. Add form validation
4. Confirm data persists after reload
5. Confirm audit logs are written for important actions

AI prompt example:

- "Add validation and error handling to the current frontend API integration without changing the layout."

## Suggested Implementation Order

1. Confirm backend response shapes
2. Replace login page demo flow
3. Replace user setup localStorage
4. Connect employee list and employee form
5. Connect departments and designations
6. Improve role-based navigation
7. Finish document API flow
8. Add audit and validation polish

## Acceptance Checklist

You are close to the next goal when these are true:

- Login uses the backend
- Token is returned from the backend
- Current user profile comes from `/api/auth/me`
- User setup data persists through the backend
- Employee list reloads from the database
- Department and designation data come from the database
- Logout clears frontend auth state cleanly
- Role-based navigation matches backend role data
- Audit logs are available for important changes

## Practical AI Workflow

For every AI task:

1. Give one file or one feature at a time
2. Mention the exact route or table names
3. Ask for a small change set
4. Test after each step
5. Move to the next screen only after the previous one works

Good AI task sizes:

- "Convert login to API"
- "Convert user setup storage to API"
- "Connect employee list"
- "Connect department master data"
- "Add missing document endpoint"

## Important Notes

- Treat `newhrms.sql` as the source of truth for the database
- Treat `hrms_backend/` as the backend project root
- Treat `hrms_frontend/` as the frontend project root
- Do not mix the old mock flow with the new API flow unless you are intentionally migrating one screen at a time

## Recommended Next Step

If you want to move fast and safely, do this next:

1. Replace frontend login with the backend auth API
2. Replace user setup localStorage with API calls
3. Connect employee and master data screens

