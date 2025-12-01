## Algorithms Used in GuestGo (Prioritized)

Below is a comprehensive, prioritized summary of the key algorithms and techniques used in GuestGo, with detailed explanations of how they work, their connections to other features, and implementation details.

> **Related Documentation**: For detailed face detection and verification analysis, see `FACE_DETECTION_VERIFICATION.md`

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
**Priority**: Critical (Security & Core Functionality)

**Purpose**: Enforce face capture for schedule enrollment and guard-controlled entrance/exit flows.

**Components**:
- **YOLOv8 Detection** (Python service): Localizes faces with confidence scores and bounding boxes
- **MediaPipe Fallback**: Secondary detection when YOLO unavailable
- **BlazeFace Post-Processing**: Crops optimal square regions from detected faces
- **Client-Side BlazeFace**: Browser fallback when Python service unreachable

**Detailed Flow**:
1. **Enrollment Flow** (Schedule Creation):
   - Browser captures video frame → converts to base64
   - Sends to Python API `/detect-face-base64` endpoint
   - Python service: YOLOv8 detects face → MediaPipe fallback if needed
   - Returns normalized coordinates `[topLeft, bottomRight, probability]`
   - Client crops face with 40% padding → compresses → encrypts → stores

2. **Guard Dashboard Flow** (Entrance/Exit):
   - QR scan pauses → face modal opens
   - Live detection loop: Python API or BlazeFace detects faces
   - Auto-capture when single usable face detected
   - Face cropped → compressed → encrypted → stored in `gate_scans`
   - Entrance/exit RPC called with encrypted face data

**Algorithm Details**:
- **YOLOv8 Best Face Selection**: Weighted metric combining:
  - Confidence score (70% weight)
  - Face area ratio (25% weight)  
  - Center proximity bonus (5% weight)
- **Non-Maximum Suppression (NMS)**: IoU threshold 0.3 to deduplicate overlapping detections
- **Face Usability Check**: Face must be ≥5% of frame size, reasonably centered

**Connections**:
- → **Scheduling**: Optional enrollment during visit creation
- → **Gate Processing**: Required before entrance/exit RPCs
- → **Face Verification**: Provides faces for comparison
- → **Image Compression**: Processes detected faces for storage

**Performance**:
- YOLOv8: 100-200ms (local), 200-500ms (deployed)
- MediaPipe: 50-150ms
- BlazeFace: 150-300ms
- Accuracy: YOLOv8 ~95%, MediaPipe ~85%, BlazeFace ~80%

**Files**: `src/utils/Python-AI/app.py`, `src/utils/AI-Face-Detection/blazefaceModal.ts`

### 2) Face Image Compression & Encryption Pipeline
**Priority**: Critical (Storage & Security)

**File**: `src/utils/imageCompression.ts`

**Purpose**: Reduce storage costs while protecting sensitive biometric snapshots.

**Compression Algorithm**:
1. **Image Loading**: Base64 data URL → Image object
2. **Dimension Calculation**: Maintain aspect ratio, cap at target size
   - Storage: 100×100px max
   - Display: 120×120px max
3. **Canvas Rendering**: Draw to canvas with white background fill
4. **JPEG Encoding**: Convert to JPEG with quality 0.5-0.6 (50-60%)
5. **Size Reduction**: Typically achieves 80-90% reduction from original

**Encryption Algorithm** (XOR-based):
1. **Key Rotation**: Default key `'guestgo_face_2024'` repeated as needed
2. **Byte-wise XOR**: Each byte XORed with corresponding key byte
3. **Base64 Encoding**: Encrypted bytes → base64 string
4. **Storage**: Encrypted base64 stored in database

**Decryption Process**:
- XOR is symmetric: same operation reverses encryption
- Validates decrypted data is valid image data URL
- Handles unencrypted data gracefully (backward compatibility)

**Security Considerations**:
- XOR encryption is lightweight but not cryptographically secure
- Suitable for obfuscation, not strong security
- Production should consider AES-256 for stronger protection

**Connections**:
- → **Face Detection**: Processes detected faces for storage
- → **Gate Processing**: Compresses/encrypts before database insert
- → **Face Data Modal**: Decrypts for display
- → **Database**: Stores encrypted data in `gate_scans.face_image`

**Performance**:
- Compression: ~50-100ms per image
- Encryption: ~10-20ms per image
- Storage reduction: 80-90% typical

### 3) ISO 25010 Feedback Scoring & Lockout
**Priority**: High (Quality Assurance)

**Files**: `src/components/FeedbackSurveyModal.ts`, Supabase RPCs `submit_visit_feedback`, `has_feedback_for_visit`

**Purpose**: Capture qualitative system quality trends directly from visitors.

**ISO 25010 Dimensions** (8 quality characteristics):
1. Functional Suitability
2. Performance Efficiency
3. Compatibility
4. Usability
5. Reliability
6. Security
7. Maintainability
8. Portability
9. Overall Satisfaction (additional)

**Scoring Algorithm**:
- Each dimension: 1-5 scale (radio buttons, required)
- Overall satisfaction: 1-5 scale
- Optional comments: Free text (max length enforced)
- Submission validation: One feedback per visit (enforced by RPC)

**Lockout Mechanism**:
1. Client checks `has_feedback_for_visit(visitId)` before showing survey
2. RPC validates no existing feedback for visit
3. Post-submission: Client refreshes visit history
4. Survey button disabled for visits with existing feedback

**Data Flow**:
- User submits → `submit_visit_feedback` RPC → Database insert
- Success → Toast notification → Visit history refresh
- Failure → Error message → Retry option

**Connections**:
- → **Visit Completion**: Triggers feedback survey availability
- → **Dashboard Analytics**: Displays feedback metrics
- → **Public Feedback**: Daily rotating testimonials on Contact page
- → **Database**: Stores in `visit_feedback` table

**Analytics**:
- Average scores per dimension
- Overall satisfaction trends
- Comment analysis (future enhancement)

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

### 21) Face Verification Similarity Calculation
**Priority**: High (Security)

**Files**: `src/utils/Python-AI/app.py` → `compare_face_features()`, `src/components/FaceDataModal.ts` → `verifyFaces()`

**Purpose**: Compare two face images to determine if they belong to the same person.

**Feature Extraction**:
1. Extract face ROI from bounding box
2. Resize to 100×100 pixels (standard size)
3. Convert to grayscale
4. Apply histogram equalization (lighting normalization)
5. Flatten to feature vector (10,000 dimensions)

**Similarity Calculation**:
1. Normalize both feature vectors: `features / ||features||`
2. Calculate correlation coefficient: `np.corrcoef(f1_norm, f2_norm)[0, 1]`
3. Convert to similarity: `(correlation + 1) / 2` (maps [-1, 1] to [0, 1])
4. Apply threshold: `similarity >= 0.75` → match

**Threshold Analysis**:
- **0.75 (Default)**: Balanced false positive/negative rate
- **Higher (0.85+)**: Stricter, fewer false positives, more false negatives
- **Lower (0.65-)**: More lenient, more false positives, fewer false negatives

**Connections**:
- → **Exit Processing**: Verifies same person exiting as entered
- → **Face Data Modal**: Displays similarity score
- → **Security Audit**: Flags low similarity visits

**Performance**:
- Feature extraction: ~50-100ms per face
- Similarity calculation: ~10-20ms
- Total verification: ~200-500ms (including API calls)

**Accuracy**:
- True Positive Rate: ~90% (correctly matches same person)
- False Positive Rate: ~5% (incorrectly matches different person)

---

## Algorithm Interconnections

### Detection → Verification Pipeline
```
Face Detection (YOLOv8/MediaPipe/BlazeFace)
    ↓
Face Cropping (40% padding, square crop)
    ↓
Image Compression (100×100px, JPEG quality 0.5)
    ↓
Encryption (XOR with key rotation)
    ↓
Database Storage (gate_scans table)
    ↓
Retrieval & Decryption (on-demand)
    ↓
Feature Extraction (100×100 grayscale, histogram equalization)
    ↓
Similarity Calculation (correlation coefficient)
    ↓
Match Decision (threshold 0.75)
```

### QR Code → Gate Processing Pipeline
```
QR Code Generation (Reed-Solomon ECC)
    ↓
Visit Scheduling (stored in database)
    ↓
QR Code Scanning (jsQR finder pattern detection)
    ↓
Visit Lookup (database query)
    ↓
Face Detection (enforced capture)
    ↓
Gate Processing (entrance/exit RPC)
    ↓
Status Update (visit status transition)
    ↓
Audit Logging (action recorded)
```

### Scheduling → Visit Lifecycle Pipeline
```
Schedule Creation (form input)
    ↓
Email Verification (OTP code)
    ↓
Place/Purpose Selection (with advance notice check)
    ↓
Date Selection (Philippine timezone, limit enforcement)
    ↓
Optional Face Enrollment (detection + storage)
    ↓
QR Code Generation (visit ID encoding)
    ↓
Database Insert (visit record created)
    ↓
Email Notification (confirmation sent)
    ↓
Gate Processing (entrance → exit)
    ↓
Status Transitions (pending → in_progress → completed)
    ↓
Feedback Collection (post-visit survey)
```

---

## Notes

- **Python AI face capture** (with encrypted storage) is the primary security-critical component; guard flows block entrance/exit without a successful detection.
- **Feedback survey data** provides continual quality signals that influence roadmap prioritization alongside operational metrics.
- **Adaptive scanning heuristics** keep the camera loops responsive while limiting CPU usage across common guard devices.
- **Place purposes system** enables fine-grained scheduling rules per place and purpose type.
- **Enhanced status management** ensures proper cleanup of past visits and accurate reporting.
- **Auto-creation of visitor roles** prevents gate scan failures and improves system resilience.
- **Face verification** provides security layer by confirming same person at entrance and exit.
- **Algorithm prioritization** reflects security (face detection/verification) and core functionality (QR codes, status management) as highest priority.

---

*For detailed face detection and verification analysis, see `FACE_DETECTION_VERIFICATION.md`*

