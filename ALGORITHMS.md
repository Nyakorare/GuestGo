## Algorithms Used in GuestGo (Prioritized)

Below is a concise, prioritized summary of the key algorithms and techniques used in GuestGo, with the most important listed first.

## Algorithm Types (Quick Reference)

| Area | Algorithm Type | Library/Implementation |
| --- | --- | --- |
| Facial detection | CNN object detector (You Only Look Once) | YOLO |
| Facial verification | Landmark/embedding-based face verification | MediaPipe |
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

### 1) Facial Detection & Recognition (Primary)
- Purpose: Fast, reliable identity checks during schedule enrollment, entrance gate, and exit gate.
- Components:
  - Detection: YOLO (You Only Look Once).
    - Type: CNN object detector for faces; single-pass detection with bounding boxes + confidence.
  - Verification: MediaPipe-based verification.
    - Type: Landmark/embedding-based comparison against an enrolled template with a similarity threshold.
- Flow:
  - Enrollment: Detect face → capture stable frame(s) → extract features → store template (encrypted, access-controlled).
  - Gate Verify: Detect face → compare features to stored template → pass/fail by threshold → fallback to QR/manual on fail.
- Notes: Liveness/spoofing checks and multi-face handling can be added later.

### 2) QR Code Encoding (Visit/Gate)
- File: `src/utils/qrCode.ts`
- Library: `qrcode`
- Approach:
  - Full payload QR: JSON-encoded objects for visits/gates with ECC `M` and width 256.
  - Simple QR: Minimal JSON `{ type, id, timestamp }` with ECC `L` and width 200 for robust scanning at gates.
- Purpose: Trade off data richness vs. scan reliability depending on use case.
- Type: QR generation with Reed–Solomon error correction codes (ECC levels L/M).

### 3) QR Code Decoding (Camera Scanner)
- File: `src/pages/QRScanner.ts`
- Library: `jsQR`
- Approach:
  - Canvas extraction from `getUserMedia` frames → `jsQR(imageData, w, h, { inversionAttempts: 'dontInvert' })`.
  - UI feedback loop for detection states (searching, detecting, success, error).
- Purpose: Fast QR reads on commodity devices with immediate UX feedback.
- Type: QR decoding pipeline including finder pattern detection, perspective transform, and Reed–Solomon decoding.

### 4) Adaptive Scan Scheduling (Real-time Tuning)
- File: `src/pages/QRScanner.ts`
- Strategy:
  - Dynamic `scanInterval` adjusted by consecutive detection failures and detection hints.
  - Speeds up on cues, slows down when no codes are found to reduce CPU and battery use.
- Benefit: Better responsiveness while controlling resource usage.
- Type: Heuristic control loop with feedback-based interval adjustment.

### 5) Potential QR Pattern Heuristic (Pre-Detection Signal)
- File: `src/pages/QRScanner.ts` → `checkForPotentialQRPattern`
- Technique:
  - Sample luminance in a center window; count high-contrast neighbors (horizontal/vertical) with a threshold.
  - If ratio exceeds 8%, hint “hold steady” and increase scan cadence.
- Purpose: Precursor signal to guide user and optimize scanning loop before full decode.
- Type: Image processing heuristic (edge/contrast density estimation over sampled grid).

### 6) Debounce and Throttle Utilities
- File: `src/utils/performance.ts`
- Algorithms:
  - Debounce: Delay execution until no calls occur within `wait` ms.
  - Throttle: Allow first call, then block until `limit` ms elapses.
- Purpose: Stabilize UI/event handling and avoid excessive work.
- Type: Time-based rate-limiting patterns.

### 7) Performance Monitoring (Navigation Timing & Averages)
- File: `src/utils/performance.ts`
- Technique:
  - Measure per-route navigation durations; compute running averages.
- Purpose: Lightweight telemetry for perceived performance.
- Type: Descriptive statistics (running average) over event timings.

### 8) Status Evaluation Logic (Visit/Date Checks)
- File: `src/pages/QRScanner.ts` (personnel modal logic)
- Technique:
  - Normalize dates to midnight; compute `isFuture`, `isPast`, `isToday` to gate actions.
- Purpose: Enforce procedural rules (e.g., completion only on scheduled date).
- Type: Deterministic date arithmetic and conditional logic.

### 9) Supabase RPC Transactional Workflows
- Files: `src/pages/QRScanner.ts`, `src/pages/GatePage.ts`, `src/utils/logging.ts`
- Procedures:
  - `scan_gate_entrance`, `complete_visit_place`, `complete_visit`, `update_gate_status`, `get_gate_by_id`, `log_action`.
- Purpose: Atomically mutate state and record events server-side; not a single algorithm, but coordinated transactional patterns.
- Type: Database stored procedures (transactional ACID operations) via RPC.

### 10) Log Enrichment & Joining (Client-Side)
- File: `src/utils/logging.ts`
- Technique:
  - Fetch logs + join user metadata in one client flow; validate `details` payload shape, parse JSON where needed.
- Purpose: Human-readable audit views with minimal round-trips.
- Type: Client-side join/denormalization and schema validation.

### 11) Printable Card Composition (Visit/Gate)
- File: `src/utils/qrCode.ts`
- Technique:
  - Template-based HTML composition with embedded QR image, responsive styles, and zoom modal.
- Purpose: Non-interactive handoffs (printed cards) while preserving scan reliability.
- Type: String templating and DOM injection.

---

Notes
- Facial Detection & Recognition is the primary security-critical algorithmic component and sits above QR flows in importance for identity assurance.
- Where performance is critical, the scanner applies adaptive intervals and a pre-detection heuristic to balance speed and device load.

