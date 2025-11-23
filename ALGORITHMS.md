## Algorithms Used in GuestGo (Prioritized)

Below is a concise, prioritized summary of the key algorithms and techniques used in GuestGo, with the most important listed first.

## Algorithm Types (Quick Reference)

| Area | Algorithm Type | Library/Implementation |
| --- | --- | --- |
| Facial detection (primary) | YOLOv8 object detection + BlazeFace cropping via Python service | FastAPI (PyTorch YOLOv8, BlazeFace) |
| Facial detection (fallback) | Browser-side BlazeFace | TensorFlow.js |
| Face data storage | JPEG compression + XOR encryption pipeline | `imageCompression.ts` |
| QR encoding | Reed–Solomon error-correcting codes (ECC L/M), bit-matrix encoding | `qrcode` |
| QR decoding | Finder pattern detection → perspective transform → Reed–Solomon decoding | `jsQR` |
| Adaptive scan scheduling | Heuristic feedback control loop (dynamic interval) | Custom |
| Pre-detection signal | Image processing heuristic (luminance contrast/edge density) | Custom |
| Debounce | Time-based rate limiting: debounce | Custom (`performance.ts`) |
| Throttle | Time-based rate limiting: throttle | Custom (`performance.ts`) |
| Navigation timing | Running average over measured durations | Custom (`performance.ts`) |
| Status checks | Deterministic date arithmetic + conditional gating | Custom |
| RPC workflows | ACID transactional stored procedures | Supabase RPC |
| Log enrichment | Client-side join/denormalization + JSON validation | Custom |
| Printable composition | String templating for HTML generation | Custom |
| Feedback scoring | ISO 25010 weighted survey capture + Supabase RPC | `submit_visit_feedback` |
| Public feedback selection | Daily rotating random selection with date-based seed | `get_public_feedback` |
| Place purposes management | Purpose-to-place mapping with advance notice days | `place_purposes` table |
| Visit status transitions | Deterministic date arithmetic + gate scan history analysis | `update_visit_statuses_server` |
| Visitor role auto-creation | Missing role detection + default role assignment | `scan_gate_entrance_with_face` |
| Limit enforcement logging | Change tracking + visit blocking event logging | `update_place_limit_settings`, `schedule_visit` |
| Single-day unavailability | Date-based availability flagging with auto-reset | `get_personnel_availability` |
| Monthly scheduled dates | Date range filtering + distinct date extraction | `get_place_scheduled_dates_in_month` |

### 1) Python AI Face Detection & Capture (Primary)
- Purpose: Enforce face capture for schedule enrollment and guard-controlled entrance/exit flows.
- Components:
  - YOLOv8 detection (Python service) to localize faces with confidence + landmarks.
  - BlazeFace post-processing to crop optimal squares and return metadata (bounding boxes, landmarks, timestamps).
- Flow:
  - Enrollment: Browser captures frame → sends to Python API → receives cropped face + metadata → stores encrypted template.
  - Guard dashboard: QR detection pauses; face modal collects new capture → upon success, entrance/exit RPCs fire with face payload.
- Notes: Automatic fallback to TensorFlow.js BlazeFace keeps detection online when the Python API is unreachable.

### 2) Face Image Compression & Encryption Pipeline
- File: `src/utils/imageCompression.ts`
- Approach:
  - Compress captured face crops to small JPEGs (default 100×100, quality ~0.5).
  - XOR-based lightweight encryption before Supabase insertion; metadata records original vs compressed size.
  - Decryption utility restores images for `FaceDataModal` when access is permitted.
- Purpose: Reduce storage costs while protecting sensitive biometric snapshots.

### 3) ISO 25010 Feedback Scoring & Lockout
- Files: `src/components/FeedbackSurveyModal.ts`, Supabase RPCs `submit_visit_feedback`, `has_feedback_for_visit`.
- Approach:
  - Collect 8 ISO 25010 dimensions + overall satisfaction, enforced as required radio groups (1-5).
  - Supabase RPC validates one submission per visit and persists optional comments.
  - Client refreshes visitor history to disable survey buttons post-submission.
- Purpose: Capture qualitative system quality trends directly from visitors.

### 4) QR Code Encoding (Visit/Gate)
- File: `src/utils/qrCode.ts`
- Library: `qrcode`
- Approach:
  - Full payload QR: JSON-encoded objects for visits/gates with ECC `M` and width 256.
  - Simple QR: Minimal JSON `{ type, id, timestamp }` with ECC `L` and width 200 for robust scanning at gates.
- Purpose: Trade off data richness vs. scan reliability depending on use case.
- Type: QR generation with Reed–Solomon error correction codes (ECC levels L/M).

### 5) QR Code Decoding (Camera Scanner)
- File: `src/pages/QRScanner.ts`
- Library: `jsQR`
- Approach:
  - Canvas extraction from `getUserMedia` frames → `jsQR(imageData, w, h, { inversionAttempts: 'dontInvert' })`.
  - UI feedback loop for detection states (searching, detecting, success, error).
- Purpose: Fast QR reads on commodity devices with immediate UX feedback.
- Type: QR decoding pipeline including finder pattern detection, perspective transform, and Reed–Solomon decoding.

### 6) Adaptive Scan Scheduling (Real-time Tuning)
- File: `src/pages/QRScanner.ts`
- Strategy:
  - Dynamic `scanInterval` adjusted by consecutive detection failures and detection hints.
  - Speeds up on cues, slows down when no codes are found to reduce CPU and battery use.
- Benefit: Better responsiveness while controlling resource usage.
- Type: Heuristic control loop with feedback-based interval adjustment.

### 7) Potential QR Pattern Heuristic (Pre-Detection Signal)
- File: `src/pages/QRScanner.ts` → `checkForPotentialQRPattern`
- Technique:
  - Sample luminance in a center window; count high-contrast neighbors (horizontal/vertical) with a threshold.
  - If ratio exceeds 8%, hint “hold steady” and increase scan cadence.
- Purpose: Precursor signal to guide user and optimize scanning loop before full decode.
- Type: Image processing heuristic (edge/contrast density estimation over sampled grid).

### 8) Debounce and Throttle Utilities
- File: `src/utils/performance.ts`
- Algorithms:
  - Debounce: Delay execution until no calls occur within `wait` ms.
  - Throttle: Allow first call, then block until `limit` ms elapses.
- Purpose: Stabilize UI/event handling and avoid excessive work.
- Type: Time-based rate-limiting patterns.

### 9) Performance Monitoring (Navigation Timing & Averages)
- File: `src/utils/performance.ts`
- Technique:
  - Measure per-route navigation durations; compute running averages.
- Purpose: Lightweight telemetry for perceived performance.
- Type: Descriptive statistics (running average) over event timings.

### 10) Status Evaluation Logic (Visit/Date Checks)
- File: `src/pages/QRScanner.ts` (personnel modal logic)
- Technique:
  - Normalize dates to midnight; compute `isFuture`, `isPast`, `isToday` to gate actions.
- Purpose: Enforce procedural rules (e.g., completion only on scheduled date).
- Type: Deterministic date arithmetic and conditional logic.

### 11) Supabase RPC Transactional Workflows
- Files: `src/pages/QRScanner.ts`, `src/pages/GatePage.ts`, `src/utils/logging.ts`
- Procedures:
  - `scan_gate_entrance`, `complete_visit_place`, `complete_visit`, `update_gate_status`, `get_gate_by_id`, `log_action`.
- Purpose: Atomically mutate state and record events server-side; not a single algorithm, but coordinated transactional patterns.
- Type: Database stored procedures (transactional ACID operations) via RPC.

### 12) Log Enrichment & Joining (Client-Side)
- File: `src/utils/logging.ts`
- Technique:
  - Fetch logs + join user metadata in one client flow; validate `details` payload shape, parse JSON where needed.
- Purpose: Human-readable audit views with minimal round-trips.
- Type: Client-side join/denormalization and schema validation.

### 13) Printable Card Composition (Visit/Gate)
- File: `src/utils/qrCode.ts`
- Technique:
  - Template-based HTML composition with embedded QR image, responsive styles, and zoom modal.
- Purpose: Non-interactive handoffs (printed cards) while preserving scan reliability.
- Type: String templating and DOM injection.

### 14) Public Feedback Daily Rotation
- Files: `src/pages/Contact.ts`, Supabase RPC `get_public_feedback`.
- Approach:
  - Uses current date as seed for consistent random selection throughout the day.
  - Filters feedback with comments and overall_satisfaction >= 4.
  - Returns one feedback per day that changes daily but remains consistent within the same day.
- Purpose: Display positive visitor testimonials on public-facing Contact page.
- Type: Date-seeded pseudo-random selection with quality filtering.

### 15) Place Purposes with Advance Notice
- Files: `src/pages/dashboard/index.ts`, `src/components/ModalFunctions.ts`, `place_purposes` table.
- Approach:
  - Each place can have multiple purposes (e.g., "Meeting", "Tour", "Inspection").
  - Each purpose has a required_days field (0-6) indicating advance notice needed.
  - Personnel assigned to a place can edit purposes (in addition to admins).
- Purpose: Enforce scheduling rules based on visit purpose and place requirements.
- Type: Relational data model with role-based access control.

### 16) Visit Status Transition Logic (Enhanced)
- Files: Supabase functions `update_visit_statuses_server`, `fix_pending_past_visits`.
- Approach:
  - Analyzes gate scan history (entrance_scanned, exit_scanned) to determine final status.
  - Handles in_progress visits that are past their visit date.
  - Transitions: in_progress → completed_flagged (if entrance scanned but no exit) or unsuccessful (if no entrance).
  - Marks associated places as failed when visit is auto-completed.
- Purpose: Automatic cleanup and status normalization for past visits.
- Type: Deterministic date arithmetic + conditional state machine.

### 17) Visitor Role Auto-Creation
- Files: Supabase function `scan_gate_entrance_with_face`.
- Approach:
  - Detects missing user_roles record during gate entrance scanning.
  - Automatically creates default 'visitor' role if missing.
  - Prevents gate scan failures due to incomplete user setup.
- Purpose: Graceful handling of edge cases where user roles are not properly initialized.
- Type: Exception handling with default value assignment.

### 18) Visit Limit Change & Enforcement Logging
- Files: Supabase functions `update_place_limit_settings`, `schedule_visit`.
- Approach:
  - Logs limit type changes (weekly ↔ monthly) and value changes.
  - Logs visit blocking events when limits are enforced (`visit_limit_enforced` action).
  - Tracks old vs new values, visit counts, and enforcement reasons.
- Purpose: Audit trail for limit management and compliance tracking.
- Type: Change tracking with before/after state comparison.

### 19) Single-Day Personnel Unavailability
- Files: Supabase function `get_personnel_availability`.
- Approach:
  - Unavailability applies only on the selected date (`unavailable_from`).
  - Availability automatically restored on next day (no explicit end date needed).
  - Exposes raw availability flag for advanced scheduling logic.
- Purpose: Simplified unavailability management without complex date range handling.
- Type: Date-based boolean flagging with implicit auto-reset.

### 20) Monthly Scheduled Dates Retrieval
- Files: Supabase function `get_place_scheduled_dates_in_month`.
- Approach:
  - Filters scheduled visits by place and month range.
  - Returns distinct visit dates within the specified month.
  - Only includes pending, completed, or completed_flagged visits.
- Purpose: Support calendar views and date picker availability indicators.
- Type: Date range filtering with distinct aggregation.

---

Notes
- Python AI face capture (with encrypted storage) is the primary security-critical component; guard flows block entrance/exit without a successful detection.
- Feedback survey data provides continual quality signals that influence roadmap prioritization alongside operational metrics.
- Adaptive scanning heuristics keep the camera loops responsive while limiting CPU usage across common guard devices.
- Place purposes system enables fine-grained scheduling rules per place and purpose type.
- Enhanced status management ensures proper cleanup of past visits and accurate reporting.
- Auto-creation of visitor roles prevents gate scan failures and improves system resilience.

