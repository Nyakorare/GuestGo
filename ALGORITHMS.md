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

---

Notes
- Python AI face capture (with encrypted storage) is the primary security-critical component; guard flows block entrance/exit without a successful detection.
- Feedback survey data provides continual quality signals that influence roadmap prioritization alongside operational metrics.
- Adaptive scanning heuristics keep the camera loops responsive while limiting CPU usage across common guard devices.

