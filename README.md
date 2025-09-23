## GuestGo — Feature Modules, Steps, and Expected Results

This document summarizes the end-to-end features of GuestGo, organized by modules, the steps users take, and the expected results. It also specifies where and how facial detection and recognition AI is integrated.

## System Modules

- **Authentication & Access Control**
  - Sign-in/sign-out, session management via `supabase`.
  - Role-based access for admins, guards, and staff.

- **Scheduling (Visitor Pre-Registration)**
  - Create/edit schedules for visits, with optional facial data enrollment.
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

- **Audit Logging**
  - Structured logs for schedule CRUD, gate scans, AI decisions, and overrides.

- **Performance & Monitoring**
  - Basic metrics for scan latency, AI inference time, and error rates.

- **Facial Detection & Recognition AI (Detection + Verification)**
  - Detection: MediaPipe BlazeFace (face presence and bounding box).
  - Verification: OpenCV Haar-based face recognition for identity verification.
  - Applied only during: Schedule creation (enrollment), Entrance gate, Exit gate.

## End-to-End Steps to Be Taken (User Flows)

1) **Create Schedule (Admin/Staff)**
   - Enter visitor details (name, purpose, date/time, contact info).
   - Optional: Capture facial data via webcam (Detection + Verification enrollment template).
   - System generates a QR code and stores schedule + biometric template.
   - Notification email with QR is sent to visitor (optional).

2) **Entrance Gate (Guard)**
   - Choose scan method: QR scan or Facial verification.
   - System validates schedule, checks flags, and visit window.
   - If allowed, marks visit as "entered" and logs the event; otherwise shows flagged modal.

3) **Exit Gate (Guard)**
   - Choose scan method: QR scan or Facial verification.
   - System verifies active "entered" visit.
   - Marks visit as "exited" and logs the event.

4) **Dashboard & Reporting (Admin/Staff)**
   - View active visits, historical entries/exits, and flagged incidents.
   - Export summaries (future enhancement).

## Connected Modules, Steps, and Expected Results

| Module | Steps to Be Taken | Expected Results | Data Created/Updated | Notifications/Logs |
| --- | --- | --- | --- | --- |
| Authentication & Access Control | Sign in via Supabase | Session established; role resolved | Session token | Login success/failure logged |
| Scheduling (Visitor Pre-Registration) | Enter visitor details, date/time, purpose; optionally enroll face | Schedule saved; visit QR generated | `visit` record; QR asset; optional biometric template | Email to visitor (optional); audit log |
| Facial Enrollment (Schedule) | Detect face (BlazeFace); capture best frame; confirm | Enrollment template saved for later verification | Encrypted biometric template linked to visitor/visit | AI enrollment decision logged |
| Entrance Gate Processing | Scan gate/visit QR or verify face | Admission granted; visit marked entered | Visit status → entered | Gate entry log; flagged alert if any |
| Flagged Visits & Alerts | System finds flags on visitor/visit | Guard sees flagged modal; can override | Flag incident/override record | Alert log; optional email/SMS |
| Exit Gate Processing | Scan gate/visit QR or verify face | Exit recorded; visit closed | Visit status → exited | Gate exit log |
| Dashboard & Reporting | Open dashboard; filter views | KPIs, active visits, history visible | None (read-only) | View events logged |
| QR Code Services | Generate/parse visit/gate codes | Scannable codes for flows | QR assets; parsed payloads | Generation/scan events logged |
| Notifications | Trigger on schedule, flags, completion | Emails/alerts sent | Notification records (optional) | Delivery status logged |
| Audit Logging | Perform CRUD/gate/AI actions | Immutable audit trail | Log records | Accessible in logs/reporting |

## Facial Detection & Recognition AI Module

Scope: Used only during Schedule creation (enrollment), Entrance gate, and Exit gate.

- **Detection (MediaPipe BlazeFace)**
  - Purpose: Quickly detect a face and return a bounding box to capture a high-quality frame.
  - Output: Face bounding box + confidence score. If low confidence, ask user to retry.

- **Verification (OpenCV Haar-based)**
  - Purpose: Confirm that the detected face matches the enrolled face template for the visit/visitor.
  - Output: Match/No-Match with a confidence threshold. If below threshold, fallback to QR or manual verification.

- **Enrollment Flow (Schedule Creation)**
  - Detect face (BlazeFace) → capture stable frame(s) → extract features → save enrollment template linked to visitor/visit.

- **Entrance/Exit Verification Flow**
  - Detect face (BlazeFace) → compare against enrollment template (Haar-based) → if match within threshold, proceed as if QR validated.

- **Privacy & Security**
  - Store templates, not raw images, whenever possible.
  - Encrypt templates at rest; restrict access by role.
  - Provide opt-out and deletion on request.

- **Performance Targets**
  - Detection latency: < 100ms on typical hardware.
  - Verification latency: < 300ms; total gate interaction < 1s.

- **Fallbacks**
  - If detection fails: prompt user to adjust lighting/position or use QR.
  - If verification fails: fallback to QR; optionally escalate to manual ID check.

## Integration Points in Codebase

- Scheduling UI and logic: `src/pages/GatePage.ts` and `src/pages/dashboard/index.ts` (overview), with shared utilities in `src/utils`.
- Gate scanning pages: `src/pages/QRScanner.ts`, `src/pages/GatePage.ts`, and `src/pages/dashboard/Gates.ts`.
- Modals for flagged visits and auth: `src/components/FlaggedVisitModal.ts`, `src/components/AuthModals.ts`.
- Config & services: `src/config/supabase.ts`, `src/config/emailjs.ts`, and QR helpers in `src/utils/qrCode.ts`.

Proposed additions for AI module (high-level):

- `src/utils/face/`
  - `detector.ts` (BlazeFace wrapper)
  - `verifier.ts` (Haar-based verification)
  - `enrollment.ts` (create/update templates)
- Gate pages call into `detector`/`verifier` for entrance/exit; schedule creation calls into `enrollment`.

## Operational Notes

- Logging: Use `src/utils/logging.ts` for AI decisions, thresholds, and overrides.
- Notifications: Trigger via `src/config/emailjs.ts` on schedule creation and critical flags.
- Performance: Track inference timings via `src/utils/performance.ts`.

## Future Enhancements

- Multi-face handling and crowd detection at gates.
- Liveness checks to mitigate spoofing.
- Model quantization and GPU acceleration options.