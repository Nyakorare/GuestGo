## GuestGo

Complete & Fully functional RBAC-Visitor Management and Gate Access Control system with QR flows and AI-powered face detection/verification.

## THESIS: (Technological University of the Philippines - Manila | A.Y. 2025-2026)
“GuestGo: Enhanced Visitation and Appointment with Facial Recognition and Detection System”

### Highlights

- Guard dashboard with real-time QR scanning, manual visit lookup, and enforced face capture on entrance/exit
- Python AI microservice (YOLOv8 detection + BlazeFace cropping) with encrypted face archives in Supabase
- ISO 25010 feedback survey and analytics to track visit quality across releases
- Fast QR generation/scan, gate entry/exit processing, dashboard and logs
- Role-based access (admin, guards/personnel, staff, visitors)

### SITE STATUS PAGE:
https://stats.uptimerobot.com/JyYATn0Zv8

### DEPLOYED LINKS:
- MAIN: https://guest-go.vercel.app/
- AI MICROSERVICE: https://guestgo-ai.onrender.com/

### Quick Start

1) Install dependencies

   - npm install

2) Start dev server

   - npm run dev

> Face detection/verification requires the Python AI service. See **Python AI Microservice** below for setup instructions.

### Python AI Microservice

- Location: `src/utils/Python-AI`
- Install dependencies: `pip install -r requirements.txt`
- Run locally: `python app.py` (serves at `http://localhost:5000` by default)
- Deploy: Render config provided (`render.yaml`, `Procfile`, `start.sh`)
- Frontend reads `VITE_PYTHON_API_URL`; defaults to `http://localhost:5000` when unset.

### Environment

Create a `.env` (or `.env.local`) with at least:

- VITE_SUPABASE_URL=...
- VITE_SUPABASE_ANON_KEY=...
- VITE_EMAILJS_SERVICE_ID=...
- VITE_EMAILJS_TEMPLATE_ID=...
- VITE_EMAILJS_PUBLIC_KEY=...
- VITE_PYTHON_API_URL=... *(Render deployment URL or local Flask server)*

**For Email Service (Brevo) - Required for visit confirmation emails:**

- BREVO_API_KEY=... *(Brevo API key for sending transactional emails)*
- BREVO_FROM_EMAIL=... *(Verified sender email address in Brevo)*
- BREVO_FROM_NAME=... *(Optional, defaults to 'GuestGo')*

**Vercel Deployment:**

When deploying to Vercel, make sure to add these environment variables in your Vercel project settings:
1. Go to your Vercel project → Settings → Environment Variables
2. Add `BREVO_API_KEY` (server-side only, not exposed to client)
3. Add `BREVO_FROM_EMAIL` (server-side only)
4. Add `BREVO_FROM_NAME` (optional, server-side only)

These are server-side environment variables (not prefixed with `VITE_`) and are used by the `/api/send-visit-email` serverless function.

### Tech Stack

- Vite + TypeScript
- Tailwind CSS
- Supabase (auth, database, RPC)
- jsQR, qrcode (QR flows)
- Python FastAPI/Flask AI service (YOLOv8 detection + face embeddings)
- TensorFlow.js BlazeFace fallback for in-browser detection

### Documentation

- **Algorithms overview**: see `ALGORITHMS.md`
- **Face Detection & Verification**: see `FACE_DETECTION_VERIFICATION.md` (detailed technical analysis)

## Feature Modules, Steps, and Expected Results

This section summarizes end-to-end features, steps, and expected results. It also specifies where and how facial detection and verification AI is integrated.

## Complete Feature Inventory

### Main Features

#### 1. Authentication & Access Control
**Location**: `src/components/AuthModals.ts`, `src/utils/sessionManager.ts`

**Features**:
- Sign up with email/password
- Sign in with Supabase authentication
- Session management with automatic token refresh
- Role-based access control (Admin, Guard, Personnel, Visitor, Guest)
- Password reset functionality
- Profile settings management (`src/components/ProfileSettingsModal.ts`)

**Connections**:
- → All pages: Session required for protected routes
- → Dashboard: Role determines available features
- → Guard Dashboard: Guard role required
- → Scheduling: Visitor/Guest roles can schedule visits

#### 2. Home Page & Landing
**Location**: `src/pages/Home.ts`

**Features**:
- Welcome page with role-based personalization
- Schedule visit modal (quick access)
- Weekly visit count display for logged-in users
- Feature cards (Smart Scheduling, Secure Verification, Real-time Tracking)
- Workflow steps guide (role-specific)
- FAQ section (`src/components/mini-features/home/FAQ.ts`)

**Mini-Features**:
- **FAQ Component**: `src/components/mini-features/home/FAQ.ts` - Frequently asked questions with expandable answers

**Connections**:
- → Scheduling: Opens schedule modal
- → Authentication: Shows sign up/sign in options
- → Dashboard: Links to role-specific dashboards
- → Track Schedule: Links to visit tracking

#### 3. About Page
**Location**: `src/pages/About.ts`

**Features**:
- Company/organization information
- Mission and vision
- Team member profiles
- Technology stack showcase (`src/components/mini-features/TechnologyStack.ts`)
- Company culture (`src/components/mini-features/OurCulture.ts`)
- Company values (`src/components/mini-features/OurValues.ts`)
- Thesis timeline (`src/components/mini-features/ThesisTimeline.ts`)
- By the numbers statistics (`src/components/mini-features/ByTheNumbers.ts`)

**Mini-Features**:
- **TechnologyStack**: Displays tech stack used in GuestGo
- **OurCulture**: Company culture information
- **OurValues**: Core company values
- **ThesisTimeline**: Project development timeline
- **ByTheNumbers**: Key statistics and metrics

**Connections**:
- → Home: Navigation link
- → Contact: Related page link

#### 4. Contact Page
**Location**: `src/pages/Contact.ts`

**Features**:
- Contact form (`src/components/mini-features/SendUsMessage.ts`)
- Business hours display (`src/components/mini-features/BusinessHours.ts`)
- Location/find us (`src/components/mini-features/FindUs.ts`)
- Social media links (`src/components/mini-features/FollowUs.ts`)
- Public feedback testimonials (daily rotating, from `get_public_feedback` RPC)
- User feedback component (`src/components/mini-features/UserFeedback.ts`)

**Mini-Features**:
- **SendUsMessage**: Contact form for sending messages
- **BusinessHours**: Operating hours display
- **FindUs**: Location and map information
- **FollowUs**: Social media links and follow buttons
- **UserFeedback**: User feedback display component

**Connections**:
- → Feedback System: Displays public feedback
- → Email Service: Sends contact form messages via EmailJS

#### 5. Scheduling System (Visitor Pre-Registration)
**Location**: `src/pages/dashboard/index.ts`, `src/pages/GatePage.ts`, `src/pages/Home.ts`

**Features**:
- Multi-place visit scheduling
- Place-specific visit purposes with advance notice requirements (0-6 days)
- Email verification for guest scheduling (Gmail OTP)
- Visit date selection with Philippine timezone
- Weekly visit limit enforcement (max 2 visits per week)
- Optional face enrollment during scheduling
- QR code generation for scheduled visits
- Visit confirmation modal with terms agreement
- Visit reschedule support (`src/components/VisitReschedule.ts`)
  - Visitors can request one reschedule per visit with reason
  - Personnel can accept/decline reschedule requests
  - Date validation and visit limit checks on reschedule
  - Pending reschedule notification modal for personnel (`src/components/PendingRescheduleModal.ts`)

**Connections**:
- → Place Management: Fetches available places and purposes
- → Personnel Availability: Checks personnel availability
- → Visit Limits: Enforces weekly/monthly visit limits
- → Face Detection: Optional enrollment during scheduling
- → QR Code Services: Generates visit QR codes
- → Email Notifications: Sends confirmation emails via Brevo
- → Audit Logging: Logs schedule creation and reschedule requests

#### 6. Guard Operations Dashboard
**Location**: `src/pages/GuardDashboard.ts`

**Features**:
- Real-time QR code scanning with adaptive cadence
- Manual visit ID lookup (fallback when QR unavailable)
- Gate selection (entrance/exit/temporary exit)
- **Enforced face capture** before entrance/exit processing
- Live scan telemetry (FPS, interval metrics)
- Visit status display and management
- Flagged visit alerts (`src/components/FlaggedVisitModal.ts`)
- Face data review (`src/components/FaceDataModal.ts`)

**Connections**:
- → QR Scanner: Uses QR scanning utilities
- → Face Detection: Enforces face capture via `openFaceDetectionModal()`
- → Gate Processing: Calls entrance/exit RPCs with face data
- → Visit Status: Updates visit status after scans
- → Audit Logging: Logs all guard actions
- → Flagged Visits: Shows alerts for flagged visitors

#### 7. Gate Processing (Entrance/Exit)
**Location**: `src/pages/GuardDashboard.ts`, `src/pages/dashboard/Gates.ts`, `src/pages/QRScanner.ts`

**Entrance Processing**:
- QR scan or manual visit ID entry
- Face capture (enforced)
- Visit validation (status, date, flags)
- Gate selection
- Status update: `pending` → `in_progress`
- Face data storage in `gate_scans` table

**Exit Processing**:
- QR scan or manual visit ID entry
- Face capture (enforced)
- Face verification (compares entrance vs exit faces)
- Place completion validation
- Status update: `in_progress` → `completed`
- Visit closure

**Temporary Exit**:
- Allows visitor to exit temporarily
- Status: `in_progress` → `temporary_exit`
- Re-entry restores `in_progress` status

**Connections**:
- → Face Detection: Captures face images
- → Face Verification: Compares entrance/exit faces
- → Visit Status Management: Updates visit status
- → Place Completion: Validates all places visited
- → Audit Logging: Logs gate scans

#### 8. QR Code Services
**Location**: `src/utils/qrCode.ts`, `src/pages/QRScanner.ts`

**Features**:
- QR code generation (visit IDs, gate IDs)
- QR code scanning (camera-based)
- QR code validation
- Printable visit cards
- Adaptive scan scheduling (dynamic interval adjustment)
- Pre-detection QR pattern heuristic

**Connections**:
- → Scheduling: Generates QR for scheduled visits
- → Guard Dashboard: Scans QR codes
- → Gate Processing: Validates QR codes
- → Visit Cards: Generates printable QR cards

#### 9. Visit Tracking & Schedule Management
**Location**: `src/pages/TrackSchedule.ts`

**Features**:
- Visit ID input (`src/components/mini-features/trackschedule/VisitIdInput.ts`)
- Visit information display (`src/components/mini-features/trackschedule/VisitInformation.ts`)
- Visit progress tracking (`src/components/mini-features/trackschedule/VisitProgress.ts`)
- Places to visit list (`src/components/mini-features/trackschedule/PlacesToVisit.ts`)
- Gate scanning status (`src/components/mini-features/trackschedule/GateScanningStatus.ts`)
- Visit QR code display (`src/components/mini-features/trackschedule/VisitQRCode.ts`)
- No visit found handling (`src/components/mini-features/trackschedule/NoVisitFound.ts`)
- Face data viewing with verification similarity

**Mini-Features**:
- **VisitIdInput**: Input field for entering visit ID
- **VisitInformation**: Displays visit details (name, date, places, etc.)
- **VisitProgress**: Progress bar showing visit completion status
- **PlacesToVisit**: List of places with completion status
- **GateScanningStatus**: Shows entrance/exit scan status
- **VisitQRCode**: Displays QR code for the visit
- **NoVisitFound**: Error message when visit not found

**Connections**:
- → Visit Status: Fetches visit status from database
- → Face Data: Displays face images and verification results
- → Place Completion: Shows place completion status

#### 10. Dashboard & Reporting
**Location**: `src/pages/dashboard/index.ts`

**Features**:
- Overview of active visits
- Historical entries/exits
- Flagged incidents display
- Visit filtering and search
- Place management
- Personnel management
- Account management
- Visit limit management (`src/components/VisitLimitModal.ts`)
- Place purposes management
- AI status monitoring (`src/pages/dashboard/AIStatus.ts`)
- Feedback analytics (`src/pages/dashboard/Feedback.ts`)
- Gates management (`src/pages/dashboard/Gates.ts`)

**Connections**:
- → Visit Status: Displays all visit statuses
- → Face Data: Allows viewing face images
- → Audit Logging: Shows action logs
- → Place Management: CRUD operations for places
- → Personnel Management: Assign/unassign personnel
- → Visit Limits: Configure place visit limits

#### 11. Feedback & Quality Analytics
**Location**: `src/components/FeedbackSurveyModal.ts`, `src/pages/dashboard/Feedback.ts`, `src/pages/Contact.ts`

**Features**:
- ISO 25010 survey (8 quality characteristics + overall satisfaction)
- Post-visit feedback collection
- Repeat submission prevention
- Public feedback display (daily rotating testimonials)
- Feedback analytics dashboard
- Pending feedback notifications (`src/components/PendingFeedbackModal.ts`)

**Connections**:
- → Visit Completion: Triggers feedback survey
- → Database: Stores feedback via `submit_visit_feedback` RPC
- → Contact Page: Displays public feedback
- → Dashboard: Shows feedback analytics

#### 12. Flagged Visits & Alerts
**Location**: `src/components/FlaggedVisitModal.ts`

**Features**:
- Flag management on visitors/visits
- Alert modals for guards
- Override functionality (with logging)
- Flag incident logging

**Connections**:
- → Guard Dashboard: Shows alerts during gate scans
- → Visit Status: Flags affect visit processing
- → Audit Logging: Logs flag overrides

#### 13. Place Management
**Location**: `src/pages/dashboard/index.ts`, `src/components/ModalFunctions.ts`

**Features**:
- Place CRUD operations
- Place purposes with advance notice requirements
- Personnel assignment to places
- Visit limits (weekly/monthly) per place
- Place deletion with logging

**Connections**:
- → Scheduling: Provides places for visit selection
- → Personnel Management: Assigns personnel to places
- → Visit Limits: Enforces limits per place
- → Audit Logging: Logs place changes

#### 14. Personnel Management
**Location**: `src/pages/dashboard/index.ts`

**Features**:
- Personnel assignment to places
- Availability management (single-day unavailability)
- In-progress visit viewing
- Place purpose editing (for assigned places)
- Reschedule request management (`src/components/VisitReschedule.ts`)
  - View pending reschedule requests for assigned places
  - Accept/decline reschedule requests with new date selection
  - Automatic notification modal for pending requests (`src/components/PendingRescheduleModal.ts`)

**Connections**:
- → Place Management: Assigns personnel to places
- → Scheduling: Checks personnel availability
- → Visit Status: Shows in-progress visits
- → Reschedule System: Personnel can process visitor reschedule requests

#### 15. Visit Status Management
**Location**: Supabase RPCs, `src/pages/dashboard/index.ts`

**Status Flow**:
- `pending` → `in_progress` (entrance scan)
- `in_progress` → `temporary_exit` (temporary exit)
- `temporary_exit` → `in_progress` (re-entry)
- `in_progress` → `completed` (exit scan)
- `in_progress` → `completed_flagged` (past date, no exit)
- `pending` → `unsuccessful` (past date, no entrance)

**Connections**:
- → Gate Processing: Updates status on scans
- → Dashboard: Displays status
- → Visit Tracking: Shows status to visitors

#### 16. Audit Logging
**Location**: `src/utils/logging.ts`, Supabase RPCs

**Features**:
- Action logging (CRUD operations)
- Gate scan logging
- AI decision logging
- Override logging
- Place deletion logging
- Visit limit enforcement logging
- Visit reschedule logging (`visit_reschedule_requested`, `visit_reschedule_accepted`, `visit_reschedule_declined`)
- Log pagination (`src/components/LogsPagination.ts`)

**Connections**:
- → All Features: Logs all significant actions
- → Dashboard: Displays logs
- → Analytics: Provides audit trail
- → Reschedule System: Logs all reschedule requests and decisions

#### 17. Notifications & Email Services
**Location**: `src/config/emailjs.ts`, `api/send-visit-email.ts`, `api/send-completion-email.ts`, `src/config/email.ts`, `src/config/completionEmail.ts`

**Features**:
- **Brevo Email Integration**: Professional transactional email service for visit confirmations and completions
  - Visit confirmation emails with embedded QR codes (`api/send-visit-email.ts`)
  - Visit completion emails with feedback survey links (`api/send-completion-email.ts`)
  - HTML email templates with responsive design
  - Serverless function support (Vercel) and local development server support
- **EmailJS Integration**: Used for contact form submissions and email verification codes (Gmail OTP)
- Email notifications for schedule creation (via Brevo)
- Email notifications for visit completion (via Brevo)
- Optional alerts for flagged events
- Email verification codes (Gmail OTP via EmailJS)

**Connections**:
- → Scheduling: Sends confirmation emails via Brevo API
- → Visit Completion: Sends completion emails via Brevo API
- → Authentication: Sends verification codes via EmailJS
- → Contact Page: Sends contact form messages via EmailJS

#### 18. Face Detection & Verification
**Location**: `src/utils/AI-Face-Detection/blazefaceModal.ts`, `src/utils/Python-AI/app.py`, `src/components/FaceDataModal.ts`

**Features**:
- Face detection (YOLOv8 primary, MediaPipe secondary, BlazeFace fallback)
- Face verification (entrance vs exit comparison)
- Face image compression and encryption
- Face data storage and retrieval
- Face data modal for viewing

**Detailed Documentation**: See `FACE_DETECTION_VERIFICATION.md`

**Connections**:
- → Scheduling: Optional enrollment
- → Guard Dashboard: Enforced capture
- → Gate Processing: Entrance/exit capture
- → Visit Tracking: Face data viewing

## System Modules

- **Authentication & Access Control**
  - Sign-in/sign-out, session management via `supabase`.
  - Role-based access for admins, guards, and staff.

- **Guard Operations Dashboard**
  - Dedicated QR scanner with adaptive cadence, manual visit ID lookup, and scan telemetry.
  - Gate selection for entrance/exit processing with face capture enforcement.
  - Manual visit ID entry for fallback when QR scanning is unavailable.
  - Enforces face capture (Python AI modal) before logging entrance/exit, including temporary exit workflow.

- **Scheduling (Visitor Pre-Registration)**
  - Create/edit schedules for visits, with optional facial data enrollment.
  - Place-specific visit purposes with required advance notice days (0-6 days).
  - Generates a unique QR for the scheduled visit.

- **Entrance Gate Processing**
  - Scan QR or use facial verification to admit visitor.
  - Checks visit status and flags, marks as "entered".

- **Exit Gate Processing**
  - Scan QR or use facial verification to exit visitor.
  - Marks visit as "exited" and closes the visit lifecycle.

- **QR Code Services**
  - Generate and validate QR codes representing visit IDs.
  - Used at gates and during schedule lookup.

- **Flagged Visits & Alerts**
  - Maintain and display flags on scheduled visitors.
  - Raise alert modals for guards and log incidents.

- **Dashboard & Reporting**
  - Overview of gate activity, active visits, flagged entries.
  - Time-based summaries for operations.

- **Notifications & Email Services**
  - Brevo integration for professional visit confirmation and completion emails with embedded QR codes.
  - EmailJS for contact form submissions and email verification codes.
  - Email notifications for schedule creation and visit completion.
  - Optional alerts for flagged events.

- **Feedback & Quality Analytics**
  - Post-visit ISO 25010 survey covering functional suitability, security, maintainability, etc.
  - Scores stored via Supabase RPCs (`submit_visit_feedback`, `has_feedback_for_visit`) with repeat-visit lockouts.
  - Public feedback display on Contact page with daily rotating testimonials (`get_public_feedback`).
  - Visit completion emails include feedback survey links for guests.

- **Audit Logging**
  - Structured logs for schedule CRUD, gate scans, AI decisions, and overrides.
  - Place deletion logging (`place_delete` action).
  - Visit limit change and enforcement logging (`visit_limit_enforced`, `place_weekly_visit_limit_update`, `place_monthly_visit_limit_update`).

- **Performance & Monitoring**
  - Basic metrics for scan latency, AI inference time, and error rates.

- **Place Management & Purposes**
  - Place-specific visit purposes with configurable advance notice requirements (0-6 days).
  - Personnel can edit place purposes for their assigned places (in addition to admins).
  - Monthly scheduled dates retrieval function (`get_place_scheduled_dates_in_month`) for calendar views.

- **Visit Reschedule System**
  - Visitors can request one reschedule per visit with reason explanation.
  - Personnel can accept/decline reschedule requests with new date selection.
  - Full validation: weekly visit limits, place limits, and date constraints.
  - Pending reschedule notification modal for personnel on dashboard login.
  - Complete audit trail for all reschedule requests and decisions.

- **Personnel Availability Management**
  - Single-day unavailability system (applies only on selected date, auto-available next day).
  - Raw availability flag exposure for advanced scheduling logic.
  - Personnel can view in_progress visits (visits that have been scanned at gate entrance).

- **Visit Status Management**
  - Enhanced handling of in_progress status visits that are past their visit date.
  - Automatic status transitions: in_progress → completed_flagged or unsuccessful based on gate scan history.
  - Improved temporary_exit workflow with proper status resumption on re-entry.

- **Visitor Role Management**
  - Auto-creation of visitor role when missing during gate entrance scanning.
  - Prevents gate scan failures due to missing user_roles records.

- **Facial Detection & Verification AI (Python service + client fallback)**
  - Detection via YOLOv8 models hosted in the Python microservice with BlazeFace/TensorFlow.js fallback in-browser.
  - Cropping, compression, and encryption handled before inserting face data into Supabase.
  - Applied during schedule enrollment, guard entrance/exit flows, and dashboard face-data review.

## End-to-End Steps to Be Taken (User Flows)

1) **Create Schedule (Admin/Staff)**
   - Enter visitor details (name, purpose, date/time, contact info).
   - Optional: Capture facial data via webcam (Detection + Verification enrollment template).
   - System generates a QR code and stores schedule + biometric template.
   - Notification email with QR is sent to visitor (optional).

2) **Entrance Gate (Guard)**
   - Guard dashboard scans visit QR or receives manual visit ID.
   - Python AI modal captures face (with fallback) before calling entrance RPCs.
   - System validates schedule, checks flags, and marks visit as "entered"; otherwise shows flagged modal.

3) **Exit Gate (Guard)**
   - Guard dashboard rescans QR/manual ID and repeats face capture.
   - System verifies the active visit, enforces completion of scheduled places, and logs exit.
   - Visit status transitions to `completed` (or `completed_flagged` when necessary).

4) **Dashboard & Reporting (Admin/Staff)**
   - View active visits, historical entries/exits, and flagged incidents.
   - Export summaries (future enhancement).

5) **Feedback Survey (Visitor/Guest)**
   - Guests receive an ISO 25010 survey covering eight quality characteristics plus overall satisfaction.
   - Responses are stored via Supabase RPCs and surfaced in dashboards/exports.
   - Visit completion emails include direct links to feedback surveys for guests.

6) **Visit Reschedule (Visitor → Personnel)**
   - Visitors can request one reschedule per visit with a reason explanation.
   - Personnel receive notification modals and can view pending requests in dashboard.
   - Personnel can accept (with new date selection) or decline reschedule requests.
   - System validates weekly visit limits, place limits, and date constraints on acceptance.
   - All reschedule actions are logged in audit trail.

## Connected Modules, Steps, and Expected Results

This table ties together the major modules listed above with their concrete flows, data effects, and logging/notification behavior.

| Module | Steps to Be Taken | Expected Results | Data Created/Updated | Notifications/Logs |
| --- | --- | --- | --- | --- |
| Authentication & Access Control | User signs in/signs out via Supabase auth modals | Session established; role (Admin/Guard/Personnel/Visitor/Guest) resolved | Supabase session; `user_roles` checked/updated | Login success/failure + role resolution logged |
| Scheduling (Visitor Pre-Registration) | Enter visitor details, select place/purpose, date/time; pass visit-limit checks | Schedule saved; visit QR generated; visit status starts as `pending` | `visits`, `visit_places`; QR asset; optional `visit_face_data` | Visitor email (optional); schedule creation log; limit enforcement log (if blocked) |
| Facial Enrollment (Schedule) | Open face modal; detect face (YOLO/MediaPipe/BlazeFace); user confirms best frame | Enrollment template saved for future verification/analytics | Encrypted biometric template in `visit_face_data` or related table | AI enrollment decision + errors logged |
| Guard Operations Dashboard | Guard opens dashboard, selects gate, scans QR or enters visit ID, confirms action | Guard sees visit details, flags, and live scan telemetry | `gate_scans` preview data (on capture), guard action context | Guard dashboard actions + view events logged |
| Entrance Gate Processing | From guard dashboard: scan QR/ID → capture face → call entrance RPC | Visit transitions `pending` → `in_progress`; entrance scan stored | `gate_scans` (entrance), `visits.status`, `visit_places` progress | Gate entry log, AI detection log, flagged alert (if any) |
| Temporary Exit Processing | From guard dashboard: choose temporary-exit action after entrance | Visit transitions `in_progress` → `temporary_exit` | `visits.status`, `gate_scans` (temporary exit event) | Temporary-exit guard action + status change logged |
| Exit Gate Processing | From guard dashboard: rescan QR/ID → capture face → call exit RPC | Visit transitions `in_progress`/`temporary_exit` → `completed` or `completed_flagged` | `gate_scans` (exit), `visits.status`, place completion records | Gate exit log; verification similarity + override decisions logged |
| Visit Tracking (Visitor View) | Visitor opens Track Schedule, enters Visit ID, views progress | Visit details, QR, places, and face data (if allowed) displayed read-only | No primary data changes (read-only), optional local view prefs | Page views + errors logged in client logs; audit logs for data access |
| Dashboard & Reporting | Admin/Staff open dashboard, filter/search visits/logs/places/personnel | Global view of operations, statuses, feedback, AI status, and gates | Read-only for visits/logs; may trigger config updates (see rows below) | Dashboard view/filter usage; configuration changes audited |
| Place Management | Admin edits/creates/deletes places and visit purposes | Places and purposes updated; advance notice rules enforced | `places`, `place_purposes`, `visit_limits` | Place CRUD + purpose changes + deletions logged |
| Personnel Management & Availability | Admin assigns personnel to places; personnel set single-day unavailability | Personnel-place links and availability flags updated | `personnel_places`, `personnel_availability` | Assignment/unassignment + availability changes logged |
| Visit Status Management | Nightly/periodic jobs run status-fix RPCs; dashboard views status timeline | Past `pending`/`in_progress` visits normalized to `unsuccessful`/`completed_flagged` | `visits.status`, related place status fields | Status auto-fix actions logged with reasons (no entrance/exit) |
| Flagged Visits & Alerts | System detects flags on visitor/visit during schedule or gate scan | Guard/admin sees flagged modal with context and override options | Flag records + override incident entries | Flag alerts, overrides, and reasons logged; optional notifications |
| QR Code Services | Generate QR during scheduling; scan QR on Guard Dashboard/QR Scanner page | Stable, scannable codes for visit/gate flows | QR image assets (printable cards) + decoded payloads in memory | QR generation events + successful/failed scans logged |
| Notifications (Brevo + EmailJS) | System triggers on schedule creation, visit completion, flags, feedback nudges | Visitor/guard/admin receive professional HTML emails with QR codes and feedback links | Brevo delivery metadata + EmailJS delivery metadata | Notification attempts, successes, and failures logged |
| Feedback & Quality Analytics | Visitor submits ISO 25010 survey after visit; dashboard loads analytics | Feedback stored per visit; repeat submissions blocked; analytics updated | `visit_feedback` rows (scores + comments) | Submission success/failure toasts; feedback ingestion + analytics queries logged |
| Visit Reschedule | Visitor requests reschedule → Personnel reviews → Accept/decline with date validation | Visit date updated (if accepted) or original date maintained (if declined) | `scheduled_visits` reschedule fields updated; visit date changed if accepted | Reschedule request, acceptance, and decline actions logged with reasons |
| Audit Logging | Any CRUD, gate, AI, or config action occurs | Centralized audit trail available from dashboard | `logs`/`audit_logs` (action, actor, context, timestamp) | All significant actions appended; filter/search usage logged |
| Facial Detection & Verification (AI Module) | Detection called from schedule enrollment or guard flows; verification called on exit/FaceDataModal | Faces detected, cropped, compressed, encrypted; similarity scores produced | Encrypted JPEG crops in `gate_scans`/`visit_face_data`; verification metrics | Detection/verification success, failures, thresholds, and overrides logged |

## Facial Detection & Verification AI Module

Scope: Used during schedule enrollment, guard-controlled entrance/exit, and dashboard face-data review.

- **Python Service (YOLOv8 + BlazeFace)**
  - Purpose: Primary face detection, cropping, and metadata enrichment hosted on Render.
  - Output: Bounding boxes, landmarks, confidence score, detection metadata for logging/compression.

- **Client Fallback (TensorFlow.js BlazeFace)**
  - Purpose: Keep detection online when the Python service is unreachable.
  - Output: Local detections that feed the same compression/encryption pipeline (reduced accuracy but resilient).

- **Enrollment Flow (Schedule Creation)**
  - Detect face (service or fallback) → capture stable frame → crop, compress, encrypt → store template linked to visit.

- **Entrance/Exit Verification Flow**
  - Guard dashboard demands successful face capture before calling Supabase RPCs for entrance/exit/temporary-exit actions.
  - Encrypted face crops persisted via `insert_guard_gate_scan_with_face` alongside confidence + metadata.

- **Privacy & Security**
  - Store encrypted JPEG crops, never raw video; decrypt only within `FaceDataModal` when authorized users request it.
  - Supabase RLS restricts access by role; images include compression metadata for auditing.
  - Provide opt-out and deletion workflows on request.

- **Performance Targets**
  - Python service detection latency < 150 ms; fallback detection < 250 ms.
  - Total guard interaction (scan + face) < 3 s for smooth gate throughput.

- **Fallbacks**
  - If detection fails: prompt for better lighting/position or fall back to QR-only logging.
  - If Python service offline: auto-switch to TensorFlow.js; still allow manual overrides when policy permits.

## Integration Points in Codebase

- Scheduling UI and logic: `src/pages/GatePage.ts`, `src/pages/dashboard/index.ts`, shared utilities in `src/utils`.
- Visitor/guard scanners: `src/pages/QRScanner.ts`, `src/pages/GatePage.ts`, `src/pages/dashboard/Gates.ts`, `src/pages/GuardDashboard.ts`.
- AI workflow: `src/utils/AI-Face-Detection/blazefaceModal.ts`, `src/utils/imageCompression.ts`, Python assets in `src/utils/Python-AI/`.
- Feedback + face data modals: `src/components/FeedbackSurveyModal.ts`, `src/components/FaceDataModal.ts`, `src/components/FlaggedVisitModal.ts`.
- Public feedback: `src/pages/Contact.ts` (uses `get_public_feedback` RPC).
- Place purposes: `src/pages/dashboard/index.ts`, `src/components/ModalFunctions.ts` (place_purposes table integration).
- Config & services: `src/config/supabase.ts`, `src/config/emailjs.ts`, `src/config/email.ts`, `src/config/completionEmail.ts`, `src/config/python-api.ts`, QR helpers in `src/utils/qrCode.ts`.
- Reschedule system: `src/components/VisitReschedule.ts`, `src/components/PendingRescheduleModal.ts`, `supabase/migrations/37_visit_reschedule_support.sql`.
- Email services: `api/send-visit-email.ts`, `api/send-completion-email.ts` (Vercel serverless functions), `server.js` (local development).

## Operational Notes

- Logging: `src/utils/logging.ts` handles AI decisions/thresholds; guard actions flow through `log_guard_action` + `insert_guard_gate_scan_with_face` RPCs.
- Notifications: Visit confirmations and completions via Brevo (`api/send-visit-email.ts`, `api/send-completion-email.ts`). Contact forms and OTP via EmailJS (`src/config/emailjs.ts`).
- Performance: Track inference timings via `src/utils/performance.ts`; guard dashboard displays live FPS/interval metrics.
- Face storage: `processFaceImageForStorage` compresses/encrypts crops before Supabase insert; `processFaceImageForDisplay` decrypts on demand.

## Feature Interconnections & Data Flow

### Complete Feature Connection Map

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION LAYER                         │
│  (AuthModals, SessionManager) → All Protected Features         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    SCHEDULING WORKFLOW                          │
│                                                                  │
│  Home Page → Schedule Modal → Place Selection → Purpose       │
│       ↓              ↓              ↓              ↓            │
│  Email Verify → Date Selection → Face Enrollment → QR Gen      │
│       ↓              ↓              ↓              ↓            │
│  EmailJS → Visit Limits → Face Detection → QR Code Service     │
│       ↓              ↓              ↓              ↓            │
│  Notification → Audit Log → Image Compression → Visit Record  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    GATE PROCESSING WORKFLOW                     │
│                                                                  │
│  Guard Dashboard → QR Scan → Gate Selection → Face Capture      │
│       ↓              ↓              ↓              ↓            │
│  Visit Lookup → Validation → Entrance/Exit → Face Detection    │
│       ↓              ↓              ↓              ↓            │
│  Visit Status → Flag Check → Face Storage → Face Verification  │
│       ↓              ↓              ↓              ↓            │
│  Status Update → Alert Modal → Image Encryption → Similarity   │
│       ↓              ↓              ↓              ↓            │
│  Audit Log → Override Log → Database Storage → Display Result  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    VISIT TRACKING WORKFLOW                       │
│                                                                  │
│  Track Schedule → Visit ID Input → Visit Lookup → Status       │
│       ↓              ↓              ↓              ↓            │
│  Visit Info → Progress Display → Places List → Gate Status     │
│       ↓              ↓              ↓              ↓            │
│  QR Display → Face Data View → Verification → Feedback         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    DASHBOARD & ANALYTICS                        │
│                                                                  │
│  Dashboard → Visit List → Filter/Search → View Details         │
│       ↓              ↓              ↓              ↓            │
│  Place Mgmt → Personnel Mgmt → Visit Limits → Face Data         │
│       ↓              ↓              ↓              ↓            │
│  Audit Logs → Feedback Analytics → AI Status → Gates Mgmt       │
└─────────────────────────────────────────────────────────────────┘
```

### Key Integration Points

1. **Scheduling → Gate Processing**
   - Scheduled visits appear in Guard Dashboard
   - QR codes generated during scheduling are scanned at gates
   - Face enrollment (optional) can be used for verification

2. **Gate Processing → Visit Status**
   - Entrance scan: `pending` → `in_progress`
   - Exit scan: `in_progress` → `completed`
   - Temporary exit: `in_progress` → `temporary_exit`

3. **Face Detection → All Gate Operations**
   - Entrance: Face capture required before entrance RPC
   - Exit: Face capture required before exit RPC
   - Verification: Compares entrance vs exit faces

4. **Visit Status → Visit Tracking**
   - Visitors can track their visit status
   - Status updates trigger notifications
   - Progress displayed in Track Schedule page

5. **Feedback → Analytics**
   - Feedback collected after visit completion
   - Stored in database via RPC
   - Displayed in dashboard analytics
   - Public feedback shown on Contact page

6. **Audit Logging → All Features**
   - All significant actions logged
   - Logs accessible in dashboard
   - Provides complete audit trail

## Future Enhancements

- Multi-face handling and crowd detection at gates.
- Liveness checks to mitigate spoofing.
- Model quantization and GPU acceleration options.
- Automated feedback analytics dashboards and scheduled exports.
- Real-time visit status updates via WebSocket.
- Mobile app for guards and visitors.
- Advanced analytics and reporting dashboards.
