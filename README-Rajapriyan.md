# ICU Central Command - Multi-Speciality Hospital System

A multi-speciality hospital ICU Central Command Workspace designed for real-time patient monitoring, ICU bed management, and clinical workflow coordination.

---

## Architecture Overview

```mermaid
graph LR
    subgraph Frontend["Frontend (React 18 + Vite)"]
        UI["Tailwind CSS + Recharts UI"]
        Axios["Axios API Client (/api)"]
        SSEClient["EventSource (SSE Stream)"]
    end

    subgraph Backend["Backend (Spring Boot 3 + Java 21)"]
        Controllers["REST Controllers (/api/*)"]
        SSEController["Live Vitals Stream (/api/vitals/stream)"]
        Services["Business Logic & Security"]
        Hibernate["Spring Data JPA / Hibernate"]
    end

    subgraph Database["Database (MySQL 8.0)"]
        MySQL[("icu_central_command DB")]
    end

    UI --> Axios
    UI --> SSEClient
    Axios -->|Proxy http://localhost:8080| Controllers
    SSEClient -->|Real-time Telemetry| SSEController
    Controllers --> Services
    SSEController --> Services
    Services --> Hibernate
    Hibernate --> MySQL
```

---

## Connection & Port Details

| Component | Port | URL / Path | Notes |
| :--- | :--- | :--- | :--- |
| **Frontend** | `5173` | `http://localhost:5173` | React 18, Vite, Tailwind CSS, Lucide Icons |
| **Backend** | `8080` | `http://localhost:8080` | Spring Boot 3.2.3, Tomcat, Java 21 |
| **MySQL Database** | `3306` | `jdbc:mysql://localhost:3306/icu_central_command` | Password configured via `DB_PASSWORD` environment variable (default user `root`) |
| **Vite Dev Proxy** | - | `http://localhost:5173/api` &rarr; `http://localhost:8080/api` | Eliminates CORS issues in browser |

---

## Default Login Credentials

| Role | Username | Password | Default Landing Page | Permissions |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `Admin@123` | `/admin` (Command Center) | Full access to all wards, beds, users, analytics |
| **Doctor** | `doctor1` | `Doctor@123` | `/doctor` (Clinical Roster) | Assigned patients, clinical alerts, live vitals |
| **Nurse** | `nurse1` | `Nurse@123` | `/nurse` (Nurse Station) | Floor bed board, cleaning monitors, bed assignment |

---

## How to Run

### Quick Start (Windows)
Double-click `start-all.bat` to launch both servers, or run individually:
- **Backend**: Double-click `start-backend.bat`
- **Frontend**: Double-click `start-frontend.bat`

### Manual Commands

#### 1. Backend (Spring Boot)
```powershell
cd backend
java -jar target\icu-central-command-backend-1.0.0.jar
```
*Backend runs on `http://localhost:8080`.*

#### 2. Frontend (Vite)
```powershell
cd frontend
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## API Endpoints Reference

- **Authentication**: `POST /api/auth/login`
- **Dashboard Metrics**: `GET /api/dashboard`
- **Doctor Workspace**: `GET /api/doctor/dashboard?username=doctor1`
- **Nurse Station**: `GET /api/nurse/dashboard?username=nurse1`
- **Beds Matrix**: `GET /api/beds`, `PUT /api/beds/{id}/status`, `POST /api/beds`, `DELETE /api/beds/{id}`
- **Patients Directory**: `GET /api/patients`, `GET /api/patients/{id}/details`, `POST /api/patients`
- **Bed Assignments**: `POST /api/bed-assignments`, `POST /api/bed-assignments/beds/{bedId}/release`
- **Wards Overview**: `GET /api/wards`, `GET /api/wards/availability`
- **Doctors Roster**: `GET /api/doctors`, `POST /api/doctors`
- **Operational Alerts**: `GET /api/alerts`, `PUT /api/alerts/{id}/read`
- **Live Vitals & SSE**: `GET /api/vitals/live`, `GET /api/vitals/stream` (Server-Sent Events)
- **User Accounts**: `GET /api/users`, `POST /api/users`, `PUT /api/users/{id}`, `PUT /api/users/{id}/status`

---

## Security

- **Authentication**: Login (`POST /api/auth/login`) verifies credentials against BCrypt password hashes and returns a signed HS256 JWT token valid for 8 hours (480 minutes).
- **API Protection**: Every `/api/**` endpoint except `POST /api/auth/login` requires a valid Bearer token in the `Authorization: Bearer <token>` header.
- **Server-Side Role Enforcement**: Roles (`ADMIN`, `DOCTOR`, `NURSE`) are strictly enforced at the Spring Security layer:

| Endpoints | Permitted Roles | Notes |
| :--- | :--- | :--- |
| `POST /api/auth/login` | Public | Authentication endpoint |
| `/api/users/**`, `/api/dashboard/**` | `ADMIN` | User management & executive dashboard |
| `POST /api/wards/**`, `POST /api/doctors/**`, `POST /api/beds/**`, `POST /api/vitals/**` | `ADMIN` | Infrastructure & creation endpoints |
| `DELETE /api/beds/**`, `DELETE /api/patients/**`, `DELETE /api/bed-assignments/**` | `ADMIN` | Destructive operations |
| `/api/doctor/**` | `DOCTOR`, `ADMIN` | Doctor workspace & clinical roster |
| `/api/nurse/**` | `NURSE`, `ADMIN` | Nurse station & floor workflows |
| `PUT /api/beds/**` | `ADMIN`, `NURSE` | Bed status updates |
| `POST /api/bed-assignments/**` | `ADMIN`, `NURSE`, `DOCTOR` | Bed assignment & patient discharge |
| `POST /api/patients/**`, `PUT /api/patients/**` | `ADMIN`, `DOCTOR`, `NURSE` | Patient directory registration & updates |
| Read-only endpoints (`GET /api/**`) | All authenticated users | Wards, beds, alerts, patients directory |

- **Live Vitals Stream**: The real-time SSE stream (`/api/vitals/stream`) sends the JWT token via query parameter `?access_token=<token>` because the browser `EventSource` API cannot set custom request headers.
- **Environment Variables**:
  - `DB_PASSWORD`: (Required) Password for the MySQL database.
  - `DB_USERNAME`: (Optional, default `root`) Username for MySQL.
  - `JWT_SECRET`: (Optional) Signing key with at least 32 characters. If omitted, a secure 48-byte random key is generated at startup (sessions invalidate on restart).
  - `CORS_ALLOWED_ORIGINS`: (Optional, default `http://localhost:5173`) Comma-separated list of allowed CORS origins.
- **Existing Databases**: Existing database instances must run `database/fix-demo-passwords.sql` once to update user rows to the correct BCrypt hashes, and the backend must be rebuilt (`mvn clean package -DskipTests`).

