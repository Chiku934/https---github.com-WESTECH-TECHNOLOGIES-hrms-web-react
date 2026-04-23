# HRMS Setup Guide

This project is an HRMS frontend and backend that is being moved to a real SQL database workflow.
The database script you imported in phpMyAdmin is the foundation for the next phase of the build.

## What This Setup Covers

- MySQL or MariaDB database import through phpMyAdmin
- Backend setup with Node.js, Express, and Prisma
- Frontend setup with Vite and React
- Clear mapping between the database tables and the app features
- A practical AI-assisted workflow to speed up implementation

## Database Structure

The SQL file defines the core HRMS tables:

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

After import, these tables should become the source of truth for login, user setup, employee data, documents, departments, and RBAC.

## Step 1: Import the Database

1. Open phpMyAdmin.
2. Create a database named `hrms` or your preferred project name.
3. Import `hrms.sql`.
4. Confirm that all tables were created successfully.
5. Check that sample rows exist in:
   - `companies`
   - `users`
   - `company_users`
   - `roles`
   - `permissions`
   - `employee_profiles`
   - `employee_assignments`
   - `employee_documents`

## Step 2: Prepare the Backend

Go to the backend folder:

```bash
cd backend
```

Install dependencies if needed:

```bash
npm install
```

Create or update your `.env` file in `backend/`:

```env
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
DATABASE_URL=mysql://root:password@127.0.0.1:3306/hrms
```

Notes:

- Use the correct MySQL or MariaDB username and password.
- Update the database name if you used something other than `hrms`.
- If you use a different frontend port, update `CORS_ORIGIN`.

## Step 3: Align Prisma With the SQL Schema

The backend currently has a Prisma setup, but it still needs to be aligned to the real MySQL schema.

What to do:

1. Set Prisma datasource to MySQL.
2. Create Prisma models for the SQL tables.
3. Generate the Prisma client.
4. Verify Prisma can connect to the database.

Recommended table mapping:

- `users` -> authentication identity
- `company_users` -> tenant membership
- `roles`, `permissions`, `role_permissions`, `user_roles` -> RBAC
- `employee_profiles` -> personal profile details
- `employee_assignments` -> department, designation, manager, location
- `departments` and `designations` -> master data
- `document_types` and `employee_documents` -> document handling
- `custom_fields` -> dynamic fields
- `audit_logs` -> traceability

## Step 4: Replace Mock Backend Logic

Right now the backend controllers are mock-based.
Replace them with database queries in this order:

1. `authController`
   - Login against `users`
   - Resolve company membership from `company_users`
   - Load role data from `user_roles` and `roles`

2. `employeeController`
   - Read from `employee_profiles`
   - Read current assignment from `employee_assignments`
   - Join `departments` and `designations`
   - Write create/update/delete actions back to the database

3. Middleware
   - Keep JWT authentication
   - Add company-based filtering
   - Add role-based authorization from the database

4. Audit logging
   - Write important changes to `audit_logs`

## Step 5: Start the Backend

From `backend/`:

```bash
npm run dev
```

Expected checks:

- Backend starts on `http://localhost:5000`
- Health endpoint works at `http://localhost:5000/api/health`
- Swagger loads at `http://localhost:5000/swagger`

## Step 6: Prepare the Frontend

Go to the project root:

```bash
cd ..
```

Install dependencies if needed:

```bash
npm install
```

Start the frontend:

```bash
npm run dev
```

Expected checks:

- Frontend runs on `http://localhost:5173`
- Login page opens correctly
- Role-based navigation loads without errors

## Step 7: Replace Local Storage in User Setup

The user setup screen currently stores data in browser local storage.
That is fine for mock mode, but for a real SQL setup it should become API-driven.

Replace these pieces:

- `loadUserSetupUsers`
- `saveUserSetupUsers`
- `loadUserSetupDocuments`
- `saveUserSetupDocuments`
- `loadUserSetupAddresses`
- `saveUserSetupAddresses`

Recommended API pattern:

- `GET /api/users`
- `POST /api/users`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`
- `GET /api/employees`
- `GET /api/employees/:id`
- `POST /api/employees`
- `PUT /api/employees/:id`
- `DELETE /api/employees/:id`

## Step 8: Connect the Frontend to the Backend

Use the backend as the source of truth for:

- login
- user creation
- employee setup
- document upload
- department and designation selection
- role display

Recommended implementation order:

1. Build a small API client layer.
2. Replace static data in one screen at a time.
3. Verify data refresh after reload.
4. Add loading and error states.
5. Add form validation before submit.

## Step 9: Verification Checklist

After setup, verify these items one by one:

- Database import completes with no SQL errors
- `users` table contains the sample login identities
- Login works from the frontend
- JWT token is returned from the backend
- Employee list comes from the database
- User setup create/edit/delete persists after refresh
- Departments and designations are read from the database
- Documents are linked to the right user and company
- Role-based access is enforced
- Audit logs are created for important actions

## Suggested Build Order

1. Import `hrms.sql` into phpMyAdmin.
2. Confirm the sample data is present.
3. Configure backend `.env`.
4. Wire Prisma to MySQL.
5. Replace mock auth and employee controllers.
6. Move user setup from local storage to API calls.
7. Connect master data screens to the database.
8. Add audit logging.
9. Test the complete login and user setup flow.

## AI-Assisted Workflow

If you want to use AI effectively on this project, break the work into small tasks.

Good AI tasks:

- "Map the `hrms.sql` tables to Prisma models"
- "Rewrite auth controller to use MySQL tables"
- "Convert user setup local storage to API requests"
- "Add employee create/update endpoints"
- "Add audit logging for user and employee changes"
- "Generate a validation checklist for this schema"

Best practice:

1. Give AI one bounded task at a time.
2. Share the exact table names and file names.
3. Ask for small, testable changes.
4. Verify each step before moving to the next.

## Current Project Status

At the moment, the project still contains mock backend logic and local storage-based frontend state in some areas.
That means the SQL import is only the first step.
The next important milestone is to wire the backend and frontend to the imported tables.

## Next Milestone

Once the SQL import is complete, the next recommended action is:

1. Finalize Prisma models for the imported tables.
2. Replace mock controllers with database queries.
3. Connect the user setup screen to the backend API.

