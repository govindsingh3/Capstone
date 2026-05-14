# CAPSTONE PROJECT REPORT

## DPRES: Disaster Preparedness and Resilience Education System

### Cover Page

**Project Title:** Disaster Preparedness and Resilience Education System (DPRES)

**Course:** Capstone Project

**Department:** Computer Science and Engineering / Information Technology

**Institution:** [Your College / University Name]

**Team Members:**
- [Member 1 Name]
- [Member 2 Name]
- [Member 3 Name]
- [Member 4 Name]

**Supervisor:** [Supervisor Name]

**Semester / Year:** April 2026

---

## Table of Contents

1. Introduction
2. Profile of the Problem, Rationale / Scope of the Study
3. Existing System
   - Introduction
   - Existing Software
   - DFD for Present System
   - What’s New in the System to be Developed
4. Problem Analysis
   - Product Definition
   - Feasibility Analysis
   - Project Plan
5. Software Requirement Analysis
   - Introduction
   - General Description
   - Specific Requirements
6. Design
   - System Design
   - Design Notations
   - Detailed Design
   - Flowcharts
   - Pseudo code
7. Testing
   - Functional Testing
   - Structural Testing
   - Levels of Testing
   - Testing the Project
8. Implementation
   - Implementation of the Project
   - Conversion Plan
   - Post-Implementation and Software Maintenance
9. Project Legacy
   - Current Status of the Project
   - Remaining Areas of Concern
   - Technical and Managerial Lessons Learnt
10. User Manual
11. Source Code and System Snapshots
12. Bibliography

---

## 1. Introduction

The Disaster Preparedness and Resilience Education System (DPRES) is a web application designed to support institutions, disaster officers, teachers, and students in disaster readiness planning, training, simulation, reporting, and situational analytics. The system combines an interactive frontend dashboard with a robust backend API to deliver training resources, incident simulations, alerts, prediction analytics, reports, and institution management.

DPRES supports role-based access, dynamic simulation drills, institution risk reporting, AI insight summaries, and educational content to improve disaster response and preparedness for campus-like environments.

---

## 2. Profile of the Problem. Rationale / Scope of the Study (Problem Statement)

### Problem Statement

Educational institutions and disaster response teams often lack a unified digital platform to manage preparedness programs, perform live drills, evaluate readiness, analyze risk trends, and maintain actionable disaster response reports.

### Rationale

Existing processes are fragmented across spreadsheets, manual reports, and static training documents. DPRES addresses this by providing a centralized software solution for:
- authenticating users and enforcing role-based access,
- managing institution data,
- delivering disaster education and training content,
- running disaster drill simulations,
- generating risk and readiness reports,
- producing alerts and recommendations.

### Scope of the Study

This project covers:
- backend API implementation with Node.js, Express, and MongoDB,
- frontend application with React, Vite, Tailwind CSS, and Zustand,
- role-based routing and access control,
- simulation command center with dynamic incident handling,
- dashboards, reports, AI insights, and learning center pages.

Out of scope for this version:
- full production deployment automation,
- large-scale multi-tenant SaaS management,
- external sensor hardware integration.

---

## 3. Existing System

### Introduction

The current project is a newly developed system. It does not extend an existing legacy application, but it is built to replace manual disaster readiness workflows commonly used by institutions.

### Existing Software

In the absence of a dedicated existing system, the project assumes current software is limited to:
- spreadsheets for drill and incident tracking,
- PDF or Word-based disaster training manuals,
- manual feedback forms,
- separate messaging and email-based alerting.

### DFD for Present System

A Data Flow Diagram for the present system would include:
- Users (Admin, Teacher, DisasterOfficer, Student)
- Web Browser UI
- Frontend Application
- Backend API Server
- MongoDB Database
- Third-party libraries/services for authentication and charts

**High-level DFD components:**
1. User requests authentication or resource pages.
2. Frontend sends API requests to `/api/v1/*` endpoints.
3. Backend validates input, performs DB operations, and returns responses.
4. Frontend renders dashboards, reports, simulation state, or educational content.

### What’s New in the System to be Developed

The new DPRES system offers:
- interactive disaster simulation lab with zone selection,
- AI-supported advice panel,
- institution risk reports and dashboards,
- role-specific page access,
- readiness analytics from drill and prediction data,
- modern React + Tailwind UI with lazy route loading,
- RESTful backend API with validation and security middleware.

---

## 4. Problem Analysis

### Product Definition

DPRES is a web-based disaster preparedness system with two main components:
- Frontend: React-based management console for stakeholders.
- Backend: Express API server managing authentication, data, analytics, and simulation logging.

The system supports users in planning, executing, recording, and reviewing disaster preparedness drills and reports.

### Feasibility Analysis

**Technical feasibility:**
- Frontend uses mature technologies: React, Vite, Tailwind, Zustand.
- Backend uses Node.js, Express, MongoDB, and JWT authentication.
- The project is implementable with current team skills.

**Operational feasibility:**
- The system is designed for institutional users and disaster coordinators.
- Role-based routes ensure correct permissions.
- The interactive UI is suitable for training and reporting.

**Economic feasibility:**
- Open-source libraries minimize licensing costs.
- The system can be deployed on cost-effective cloud infrastructure.

### Project Plan

**Development phases:**
1. Requirement gathering and architecture design.
2. Backend API development and data modeling.
3. Frontend interface and route mapping.
4. Simulation engine and dashboard analytics.
5. Testing, documentation, and deployment preparation.

**Milestones:**
- Setup project architecture and environments.
- Implement authentication and basic data endpoints.
- Build the dashboard and simulation modules.
- Add reports, learning center, and AI insights.
- Final review and documentation.

---

## 5. Software Requirement Analysis

### Introduction

This section identifies what the system must do and the constraints it must satisfy.

### General Description

The application consists of:
- User authentication and registration.
- Institution, disaster, resource, alert, education, simulation, prediction, analytics, and report modules.
- Role-specific UI navigation and route access.
- A responsive dashboard and simulation command interface.
- Data-driven reports and interactive charts.

**Users and roles:**
- Administrator
- Teacher
- DisasterOfficer
- Student

**System environment:**
- Browser-based modern web app.
- Backend REST API serving JSON.
- Local or cloud MongoDB database.

### Specific Requirements

**Functional requirements:**
- FR1: Users must register and log in.
- FR2: The system must authenticate requests using JWT.
- FR3: Admin and staff must manage institutions and simulation drills.
- FR4: Users must view dashboards and readiness reports.
- FR5: The system must run disaster simulations and produce debrief analytics.
- FR6: The system must present educational content and AI insights.
- FR7: The system must enforce role-based access for pages.

**Non-functional requirements:**
- NFR1: The UI must load pages lazily for performance.
- NFR2: API requests must be rate limited and secured with Helmet.
- NFR3: Input must be validated using Joi schemas.
- NFR4: The application must support mobile and desktop layouts.
- NFR5: The system must log errors and handle them gracefully.

---

## 6. Design

### System Design

The DPRES system is designed as a two-tier application:
- Presentation layer: React frontend with route components and state management.
- Business logic layer: Express backend with controllers, middleware, and services.
- Data layer: MongoDB for persistence.

**Key subsystems:**
- Authentication (`/auth`)
- Education content (`/education`)
- Simulation drills (`/simulations`)
- Data admin (`/data`)
- Predictions (`/predictions`)
- Analytics (`/analytics`)
- Reports (`/reports`)
- Alerts (`/alerts`)
- Resources (`/resources`)
- Disaster catalog (`/disasters`)

### Design Notations

The design uses conventional component diagrams and layered architecture principles.
- React components represent UI pages and reusable widgets.
- Express routes map to controller actions.
- Models represent data entities such as `User`, `Institution`, `Drill`, `Prediction`, and `SimulationLog`.

### Detailed Design

**Frontend structure:**
- `src/routes/AppRoutes.jsx` defines route mapping and guards.
- `src/layouts/AppLayout.jsx` and `AuthLayout.jsx` wrap protected and authentication pages.
- `src/features/` holds feature-specific pages and widgets.
- `src/store/uiStore.js` manages UI state like theme and sidebar.
- `src/context/AuthContext.jsx` manages user authentication state.

**Backend structure:**
- `src/server.js` configures the Express server, security middleware, rate limiting, and routes.
- `src/routes/index.js` aggregates feature routes.
- `src/controllers/` contain endpoint logic.
- `src/models/` define MongoDB document schemas.
- `src/middleware/` includes auth checks, validation, and error handling.
- `src/services/` hold reusable business logic.

### Flowcharts

#### User login and navigation flow
1. User opens the app and sees login/register pages.
2. After authentication, the user is redirected to the dashboard.
3. Based on role, the user can navigate to institution, simulation, AI insights, learning, or reports pages.
4. Frontend sends API calls to the backend to fetch relevant data.

#### Simulation drill flow
1. User configures scenario and difficulty in `SimulationLabPage`.
2. The `SimulationProvider` manages state and incident progression.
3. Actions like dispatching teams and selecting zones update simulation state.
4. On completion, the system generates a debrief report.

### Pseudo code

```text
function login(email, password):
  response = POST /api/v1/auth/login { email, password }
  if response.ok:
    store token and user data
    navigate to dashboard
  else:
    show error

function runSimulation(config):
  state = initializeSimulation(config)
  while state.phase == running:
    incident = generateIncident(state)
    state = updateStateWithIncident(state, incident)
    if userAction:
      state = applyAction(state, action)
  return generateReport(state)
```

---

## 7. Testing

### Functional Testing

Functional testing verifies that:
- login and registration work correctly,
- role-based pages are accessible only to permitted users,
- dashboards display analytics data,
- simulation controls start, pause, resume, and end drills,
- reports and charts render correctly,
- API endpoints accept valid input and return expected responses.

### Structural Testing

Structural testing would examine:
- component rendering and prop flow in React,
- route guard logic in `AppRoutes.jsx`,
- middleware execution order in Express,
- controller and model interactions in backend.

### Levels of Testing

- Unit Testing: individual utility functions, controllers, and React components.
- Integration Testing: frontend-backend API communication and route access.
- System Testing: overall app workflow from login to simulation and reporting.
- User Acceptance Testing: verifying the application against project goals.

### Testing the Project

This project does not currently include automated test suites. Manual testing should cover:
- user registration/login flows,
- all page navigation paths,
- simulation scenarios and debrief output,
- report filtering and export functions,
- backend API responses for `/api/v1/*` endpoints.

---

## 8. Implementation

### Implementation of the Project

**Backend setup:**
- Uses Node.js and Express.
- Configures `helmet`, `cors`, `morgan`, and `express-rate-limit`.
- Uses `dotenv` for environment variables.
- Sets up `/health` route and `/api/v1` router.
- Implements controllers and validation with Joi.

**Frontend setup:**
- Uses React with Vite and Tailwind CSS.
- Implements lazy-loaded routes for performance.
- Uses Zustand for UI state.
- Uses Recharts and Chart.js for analytics visuals.

### Conversion Plan

If migrating from a manual/legacy process:
1. Import institution records using the backend import script.
2. Register users and assign roles.
3. Migrate existing drill and incident data into MongoDB.
4. Validate reports against legacy spreadsheets.
5. Train staff on the new simulation and reporting workflows.

### Post-Implementation and Software Maintenance

Maintenance tasks include:
- updating packages and security libraries,
- adding automated tests,
- extending simulation scenarios and datasets,
- monitoring backend performance and API logs,
- improving accessibility and mobile layout.

---

## 9. Project Legacy

### Current Status of the Project

DPRES is implemented as a functional frontend-backend web application with the following major capabilities:
- secure authentication,
- dashboard analytics,
- simulation lab,
- reports and risk assessments,
- institution management,
- educational content pages,
- alerts and disaster catalog support.

### Remaining Areas of Concern

Remaining enhancements or future work:
- add automated test coverage,
- implement full persistence for simulation results,
- connect to real-time notification services,
- add deployment scripts and CI/CD,
- expand user management to support multi-tenancy.

### Technical and Managerial Lessons Learnt

Technical lessons:
- component-based design improves maintainability.
- lazy loading reduces initial UI bundle size.
- middleware and request validation improve backend security.

Managerial lessons:
- clear feature separation helps parallel teamwork.
- architecture documentation supports onboarding.
- regular review of package and dependency versions is essential.

---

## 10. User Manual

### System Requirements

- Node.js 18+ installed.
- MongoDB database available.
- Modern web browser.

### Backend Startup

1. Open `backend/` folder.
2. Install dependencies: `npm install`.
3. Create `.env` with JWT secret and MongoDB connection.
4. Run: `npm run dev`.
5. Backend listens on configured port.

### Frontend Startup

1. Open `frontend/` folder.
2. Install dependencies: `npm install`.
3. Run: `npm run dev`.
4. Open the browser at the local Vite URL.

### How to Use the System

1. Register or log in.
2. Access the dashboard to review readiness analytics.
3. Visit the Institution page to view and manage institutions.
4. Use the Simulation Lab to configure and run disaster drills.
5. View AI Insights for guidance and trends.
6. Review Reports for risk and preparedness metrics.
7. Use the Learning Center for disaster education content.

### Notes for Admin Users

- Admins can manage user roles and access additional institution and disaster data.
- The system enforces role-based page access.

---

## 11. Source Code (where ever applicable) or System Snapshots

### Key Source Code Files

**Backend**
- `backend/src/server.js`
- `backend/src/routes/index.js`
- `backend/src/controllers/authController.js`
- `backend/src/controllers/analyticsController.js`
- `backend/src/controllers/simulationController.js`
- `backend/src/models/User.js`
- `backend/src/models/Drill.js`
- `backend/src/middleware/auth.js`
- `backend/src/middleware/errorHandler.js`
- `backend/src/validators/*.js`
- `backend/package.json`

**Frontend**
- `frontend/src/App.jsx`
- `frontend/src/routes/AppRoutes.jsx`
- `frontend/src/layouts/AppLayout.jsx`
- `frontend/src/layouts/AuthLayout.jsx`
- `frontend/src/context/AuthContext.jsx`
- `frontend/src/features/simulation/SimulationLabPage.jsx`
- `frontend/src/features/reports/ReportsPage.jsx`
- `frontend/src/features/insights/AIInsightsPage.jsx`
- `frontend/src/features/institution/InstitutionPage.jsx`
- `frontend/src/ARCHITECTURE.md`
- `frontend/package.json`

### System Snapshots

**System modules:**
- Dashboard
- Institution Management
- Simulation Command Center
- AI Insights
- Learning Center
- Preparedness Reports
- Backend API endpoints

**Database model snapshot:**
- Users, Institutions, Drills, Predictions, Simulation Logs, Learning Content, Alerts, Resources, Disasters.

---

## 12. Bibliography

- Project source code in `backend/` and `frontend/` directories.
- `frontend/README.md`
- `frontend/ARCHITECTURE.md`
- Package manifests: `backend/package.json`, `frontend/package.json`
- Open-source libraries used:
  - React, Vite, Tailwind CSS, Zustand, Framer Motion
  - Express, Mongoose, Joi, JSON Web Token, Helmet, express-rate-limit

---

*Prepared by the DPRES project team in April 2026.*
