## GuestGo

Visitor Management and Gate Access Control system with QR flows and AI-powered face detection/verification.

### Highlights

- Guard dashboard with real-time QR scanning, manual visit lookup, and enforced face capture on entrance/exit
- Python AI microservice (YOLOv8 detection + BlazeFace cropping) with encrypted face archives in Supabase
- ISO 25010 feedback survey and analytics to track visit quality across releases
- Fast QR generation/scan, gate entry/exit processing, dashboard and logs
- Role-based access (admin, guards/personnel, staff, visitors)

### Quick Start

1) Install dependencies

   - npm install

2) Start dev server

   - npm run dev

3) Build for production

   - npm run build

4) Preview production build

   - npm run preview

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

### Tech Stack

- Vite + TypeScript
- Tailwind CSS
- Supabase (auth, database, RPC)
- jsQR, qrcode (QR flows)
- Python FastAPI/Flask AI service (YOLOv8 detection + face embeddings)
- TensorFlow.js BlazeFace fallback for in-browser detection

### Documentation

- Algorithms overview: see `ALGORITHMS.md`

## Feature Modules, Steps, and Expected Results

This section summarizes end-to-end features, steps, and expected results. It also specifies where and how facial detection and verification AI is integrated.

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

- **Notifications**
  - Email notifications for schedule creation and status changes.
  - Optional alerts for flagged events.

- **Feedback & Quality Analytics**
  - Post-visit ISO 25010 survey covering functional suitability, security, maintainability, etc.
  - Scores stored via Supabase RPCs (`submit_visit_feedback`, `has_feedback_for_visit`) with repeat-visit lockouts.
  - Public feedback display on Contact page with daily rotating testimonials (`get_public_feedback`).

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

## Connected Modules, Steps, and Expected Results

| Module | Steps to Be Taken | Expected Results | Data Created/Updated | Notifications/Logs |
| --- | --- | --- | --- | --- |
| Authentication & Access Control | Sign in via Supabase | Session established; role resolved | Session token | Login success/failure logged |
| Scheduling (Visitor Pre-Registration) | Enter visitor details, date/time, purpose; optionally enroll face | Schedule saved; visit QR generated | `visit` record; QR asset; optional biometric template | Email to visitor (optional); audit log |
| Facial Enrollment (Schedule) | Detect face (YOLO); capture best frame; confirm | Enrollment template saved for later verification | Encrypted biometric template linked to visitor/visit | AI enrollment decision logged |
| Entrance Gate Processing | Scan gate/visit QR or verify face | Admission granted; visit marked entered | Visit status → entered | Gate entry log; flagged alert if any |
| Flagged Visits & Alerts | System finds flags on visitor/visit | Guard sees flagged modal; can override | Flag incident/override record | Alert log; optional email/SMS |
| Exit Gate Processing | Scan gate/visit QR or verify face | Exit recorded; visit closed | Visit status → exited | Gate exit log |
| Dashboard & Reporting | Open dashboard; filter views | KPIs, active visits, history visible | None (read-only) | View events logged |
| QR Code Services | Generate/parse visit/gate codes | Scannable codes for flows | QR assets; parsed payloads | Generation/scan events logged |
| Notifications | Trigger on schedule, flags, completion | Emails/alerts sent | Notification records (optional) | Delivery status logged |
| Audit Logging | Perform CRUD/gate/AI actions | Immutable audit trail | Log records | Accessible in logs/reporting |
| Guard Operations Dashboard | Scan visit QR or enter manual visit ID, select gate, capture face, log entrance/exit | Visit status updated; face data stored | `gate_scans` + guard action logs | Guard action notifications; face metadata |
| Feedback & Quality Analytics | Submit ISO 25010 survey | Scores stored per visit; repeat submissions blocked | `visit_feedback` entries | Success/error toast + dashboard metrics |

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
- Config & services: `src/config/supabase.ts`, `src/config/emailjs.ts`, `src/config/python-api.ts`, QR helpers in `src/utils/qrCode.ts`.

## Operational Notes

- Logging: `src/utils/logging.ts` handles AI decisions/thresholds; guard actions flow through `log_guard_action` + `insert_guard_gate_scan_with_face` RPCs.
- Notifications: Trigger via `src/config/emailjs.ts` on schedule creation, flags, and survey nudges.
- Performance: Track inference timings via `src/utils/performance.ts`; guard dashboard displays live FPS/interval metrics.
- Face storage: `processFaceImageForStorage` compresses/encrypts crops before Supabase insert; `processFaceImageForDisplay` decrypts on demand.

## Future Enhancements

- Multi-face handling and crowd detection at gates.
- Liveness checks to mitigate spoofing.
- Model quantization and GPU acceleration options.
- Automated feedback analytics dashboards and scheduled exports.