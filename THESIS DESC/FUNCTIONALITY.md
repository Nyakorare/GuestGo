# Project Evaluation

## Test Execution Summary (Table 7)

 Table 7 presents the consolidated test execution results across two formal system testing cycles for the GuestGo web-based system. In Cycle 1, the focus was on validating the newly panel‑recommended “Place on Hold” functionality for the personnel role, including how it interacts with visit scheduling, personnel assignments, and gate processing; all related test cases were executed and passed, confirming that the on‑hold workflow behaves as intended. After this targeted validation, the complete functional test suite—covering authentication, role-based navigation, scheduling, QR services, guard operations, AI‑driven face detection and verification, dashboards for all roles, visit tracking, feedback, email notifications, and security—was executed in Cycle 2, where 100% of the test cases passed successfully. Collectively, the two cycles demonstrate that both the enhanced personnel on‑hold feature and the broader integrated workflows of the system operate correctly under the evaluated scenarios.

## Sample Test Cases for All Roles and Features

Table 8 contains a set of use cases related to the system's functionality. Each is characterized by a unique test case ID and objectives that describe the use case. This serves as a reference to ensure that the system has been thoroughly tested and meets the objective of each use case.

### TC-FUN-001

**Test Case ID:** TC-FUN-001

**Module:** Home Page & Navigation

**Test Case Description:** Open the application and verify the home page displays correctly with role-appropriate content

**Objective:** To be able to land on the correct home page and see role-appropriate hero text, feature cards, and navigation links after opening the application.

**Preconditions:**
- Application is deployed and accessible via URL
- User is not authenticated (for non-authenticated view) or authenticated with a specific role (for role-specific view)
- Browser supports modern web standards

**Actions:**
- Step 1: Navigate to the application URL
- Step 2: Verify hero text displays "Welcome to GuestGo" for non-authenticated users
- Step 3: Verify feature cards (Smart Scheduling, Secure Verification, Real-time Tracking) are visible
- Step 4: Verify navigation links (Home, About, Contact Us, Track Schedule) are visible

**Expected Results:**
Home page loads successfully with GuestGo branding, logo, and navigation bar. Hero section shows "Welcome to GuestGo" for non-authenticated users. Three feature cards (Smart Scheduling, Secure Verification, Real-time Tracking) visible with icons and descriptions. All public navigation links (Home, About, Contact Us, Track Schedule) displayed and accessible.

**Actual Results:**
Home page loaded correctly with all elements visible. Hero section displayed default welcome message. Feature cards rendered with icons and descriptions. Navigation links appeared and functioned properly.

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-002

**Test Case ID:** TC-FUN-002

**Module:** Authentication & Access Control

**Test Case Description:** Create a new user account through the sign-up process

**Objective:** To verify that a new user can successfully sign up with email and password, receive confirmation feedback, and be assigned a default role.

**Preconditions:**
- User is not currently authenticated
- Supabase authentication service is configured and available
- Email address to be used is not already registered in the system
- Browser supports form input and modal dialogs

**Actions:**
- Step 1: Click on the Sign Up button or link in the navigation
- Step 2: Enter first name, last name, email, and password in the form fields
- Step 3: Click the Sign Up button
- Step 4: Verify success message or confirmation appears
- Step 5: Check user role assignment in database

**Expected Results:**
Sign Up modal opens displaying registration form with first name, last name, email, and password fields. Form fields accept input correctly. System processes registration, validates data, and creates account in Supabase. Success notification appears. New user automatically assigned default 'visitor' role.

**Actual Results:**
Sign Up modal opened with all required fields. Registration processed successfully. Success notification displayed. User assigned default 'visitor' role automatically.

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-003

**Test Case ID:** TC-FUN-003

**Module:** Authentication & Access Control

**Test Case Description:** Sign in with existing user credentials

**Objective:** To verify that an existing user can sign in with valid credentials, establish a session, and see role-based navigation updates.

**Preconditions:**
- User account exists in the system with valid email and password
- User has an assigned role (admin, log, personnel, guard, visitor, or guest)
- User is not currently authenticated
- Supabase authentication service is available

**Actions:**
- Step 1: Click on the Sign In button or link in the navigation
- Step 2: Enter valid email and password
- Step 3: Click the Sign In button
- Step 4: Verify session is established
- Step 5: Verify navigation bar updates based on user role
- Step 6: Verify welcome message displays user's first name

**Expected Results:**
Sign In modal opens with email and password fields. Form accepts valid credentials. System authenticates against Supabase, establishes session, and creates token. User logged in and redirected to home page. Navigation bar updates with role-specific links. Hero section displays personalized welcome message with user's first name.

**Actual Results:**
Sign In modal opened and accepted credentials. Authentication successful. Session established and user redirected. Navigation updated with role-specific links. Personalized welcome message displayed.

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-004

**Test Case ID:** TC-FUN-004

**Module:** Authentication & Access Control

**Test Case Description:** Reset password using the Forgot Password functionality

**Objective:** To confirm that the "Forgot Password" flow sends a reset link and allows the user to set a new password and log in.

**Preconditions:**
- User account exists in the system with a registered email address
- User is not currently authenticated
- Supabase password reset functionality is configured
- Email service is available to send reset links
- User has access to the registered email inbox

**Actions:**
- Step 1: Click on the Sign In button
- Step 2: Click on the "Account Settings"
- Step 3: Enter old password
- Step 4: Enter new password
- Step 5: Confirm
- Step 6: Log in again using new password


**Expected Results:**
Sign In modal opens. Account Settings accessible. Password change form accepts old password and new password. System validates old password before allowing change. New password saved securely. User can log in with new password successfully.

**Actual Results:**
Password reset form appeared. Reset email sent successfully. Email received with valid reset link. Password reset page allowed new password entry. User signed in with new password successfully.

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-005

**Test Case ID:** TC-FUN-005

**Module:** Navigation & Role-Based Access

**Test Case Description:** Verify navigation bar updates dynamically based on user role

**Objective:** To validate that the navigation bar updates dynamically based on user role (admin, log, personnel, guard, visitor, guest), showing only permitted links.

**Preconditions:**
- Multiple user accounts exist with different roles (admin, guard, personnel, visitor)
- Users are not currently authenticated
- Navigation system is configured with role-based visibility rules

**Actions:**
- Step 1: Sign in as an admin user
- Step 2: Verify navigation links for admin role
- Step 3: Sign out and sign in as a guard user
- Step 4: Verify navigation links for guard role
- Step 5: Sign out and sign in as a personnel user
- Step 6: Verify navigation links for personnel role
- Step 7: Sign out and sign in as a visitor user
- Step 8: Verify navigation links for visitor role

**Expected Results:**
Admin navigation shows Dashboard only. Guard navigation shows Dashboard and Guard Dashboard. Personnel navigation shows Dashboard and QR Scanner. Visitor navigation shows Dashboard and Track Schedule. Role-inappropriate links are hidden.

**Actual Results:**
Navigation links updated correctly for each role. Admin saw Dashboard only. Guard saw Dashboard and Guard Dashboard. Personnel saw Dashboard and QR Scanner. Visitor saw Dashboard and Track Schedule. Hidden links remained inaccessible.

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-006

**Test Case ID:** TC-FUN-006

**Module:** Scheduling System

**Test Case Description:** Open Schedule modal and submit a visit request as a guest

**Objective:** To ensure a guest can open the Schedule modal from the Home page, fill in required visit details, and submit a schedule request.

**Preconditions:**
- User is not authenticated (guest user)
- At least one place exists in the system and is not on hold
- Place has at least one purpose configured
- Schedule modal functionality is available

**Actions:**
- Step 1: Navigate to the Home page as a non-authenticated user
- Step 2: Click the "Schedule Now" button
- Step 3: Fill in first name, last name, email, and phone number
- Step 4: Select a place to visit from the dropdown
- Step 5: Select a visit purpose from the purpose dropdown
- Step 6: Select a visit date within allowed range
- Step 7: Click "Schedule Visit" button
- Step 8: Verify confirmation modal appears

**Expected Results:**
Home page loads with "Schedule Now" button visible. Schedule modal opens with form fields (first name, last name, email, phone). Place dropdown populates with available places not on hold. Purpose dropdown enables when place selected. Date picker allows selection within advance notice range. System validates inputs and processes request. Confirmation modal displays visit details (ID, date, places, purpose).

**Actual Results:**
Schedule modal opened with all required fields. Place and purpose dropdowns populated correctly. Date picker enforced advance notice rules. Form validation worked. Visit created successfully. Confirmation modal displayed visit details.

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-007

**Test Case ID:** TC-FUN-007

**Module:** Scheduling System

**Test Case Description:** Complete Gmail OTP email verification for guest scheduling

**Objective:** To verify that Gmail OTP email verification is required and successfully completes before a guest schedule is accepted.

**Preconditions:**
- User is not authenticated (guest user)
- Schedule modal is open
- EmailJS service is configured and available
- User has access to a Gmail email account
- Email service can send OTP codes

**Actions:**
- Step 1: Open Schedule modal and enter a Gmail email address
- Step 2: Click "Send Code" button
- Step 3: Verify verification code container appears
- Step 4: Check email inbox for OTP code
- Step 5: Enter the received OTP code in the verification field
- Step 6: Click "Verify" button
- Step 7: Verify success message appears
- Step 8: Verify email field becomes read-only

**Expected Results:**
System detects Gmail domain and enables verification flow. "Send Code" triggers EmailJS to send 6-digit OTP. Verification field and Verify button appear. Email received with OTP code. Code input accepts 6 digits. System validates code on Verify click. Success message appears. Email field becomes read-only after verification.

**Actual Results:**
Gmail detection worked. OTP code sent via EmailJS. Verification field appeared. Code received in email. Verification successful. Email field disabled after verification.

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-008

**Test Case ID:** TC-FUN-008

**Module:** Scheduling System

**Test Case Description:** Attempt to schedule more than two visits per week and verify limit enforcement

**Objective:** To validate that the system enforces the maximum of two visits per week per visitor account and blocks additional requests with an appropriate message.

**Preconditions:**
- Visitor user account exists and is authenticated
- Visitor has already scheduled 2 visits for the current week (Monday-Sunday)
- Weekly visit limit enforcement is configured
- At least one place is available for scheduling

**Actions:**
- Step 1: Sign in as a visitor user with existing visits
- Step 2: Verify weekly visit count shows 2 visits already scheduled for current week
- Step 3: Navigate to Home page and click "Schedule Now" button
- Step 4: Fill in visit details and attempt to submit
- Step 5: Verify tooltip or message indicates visit limit reached
- Step 6: Try to schedule with a different account that has less than 2 visits

**Expected Results:**
Dashboard displays current week's visit count (Monday-Sunday). When limit reached (2 visits), status shows "No visits remaining". Schedule modal opens but Submit button disabled. Error message explains limit reached. Accounts with less than 2 visits can schedule normally.

**Actual Results:**
Weekly visit count displayed correctly. Limit enforcement worked. Submit button disabled at limit. Error message shown. Scheduling allowed for accounts under limit.

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-009

**Test Case ID:** TC-FUN-009

**Module:** Scheduling System

**Test Case Description:** Verify advance notice rules are enforced when selecting visit dates

**Objective:** To verify that place-specific advance notice rules (0–6 days) are correctly enforced when selecting visit dates.

**Preconditions:**
- Schedule modal is accessible
- At least one place exists with a purpose requiring advance notice (e.g., 3 days)
- At least one place exists with 0-day advance notice
- Date picker functionality is available

**Actions:**
- Step 1: Open Schedule modal and select a place with 3-day advance notice requirement
- Step 2: Select a purpose that requires 3 days advance notice
- Step 3: Verify minimum date in date picker
- Step 4: Attempt to select a date less than 3 days from today
- Step 5: Select a date that meets the 3-day requirement
- Step 6: Select a different place with 0-day advance notice

**Expected Results:**
Purpose dropdown enables when place selected. Date field enables after purpose selection. Date picker sets minimum date based on advance notice (e.g., 3 days notice = today + 3 days minimum). Dates below requirement blocked with error message. Valid dates accepted. Zero-day notice allows same-day selection.

**Actual Results:**
Date picker enforced advance notice rules correctly. Minimum date calculated properly. Invalid dates blocked. Valid dates accepted. Zero-day notice allowed same-day selection.

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-010

**Test Case ID:** TC-FUN-010

**Module:** Scheduling System

**Test Case Description:** Schedule a visit to multiple places in a single request

**Objective:** To confirm that multi-place scheduling is allowed only when at least two eligible places are available and correctly stored.

**Preconditions:**
- Schedule modal is accessible
- At least two places exist in the system and are not on hold
- Each place has at least one purpose configured
- Multi-place scheduling feature is enabled

**Actions:**
- Step 1: Open Schedule modal and verify at least two places are available
- Step 2: Select "Multiple Places" option if available
- Step 3: Select at least two places from the available list
- Step 4: Select purpose for each selected place
- Step 5: Select a visit date that meets all advance notice requirements
- Step 6: Submit the schedule request
- Step 7: Verify visit is created with multiple places

**Expected Results:**
Place dropdown shows available places not on hold. "Multiple Places" option appears when 2+ places available. Multi-select interface allows selecting multiple places. Selected places visually indicated. Purpose dropdown appears for each place. Date picker validates advance notice for all places. System creates single visit with multiple place associations. visit_places table links visit to all selected places.

**Actual Results:**
Multiple places selection interface appeared. Places selected and displayed correctly. Purpose dropdowns appeared for each place. Date validation worked for all places. Multi-place visit created successfully. All places linked in visit_places table.

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-011

**Test Case ID:** TC-FUN-011

**Module:** QR Code Services

**Test Case Description:** Verify QR code generation and email embedding for scheduled visits

**Objective:** To verify that a unique QR code is generated for each approved visit and embedded in the confirmation email.

**Preconditions:**
- Visit scheduling process can be completed
- QR code generation library (qrcode) is available
- Brevo email service is configured and available
- Visitor email address is valid and accessible

**Actions:**
- Step 1: Complete visit scheduling process and confirm visit
- Step 2: Verify QR code is generated for the visit
- Step 3: Check confirmation email sent to visitor
- Step 4: Verify QR code is embedded in the email
- Step 5: Verify QR code contains unique visit ID
- Step 6: Schedule another visit and verify different QR code

**Expected Results:**
Visit record created with 'pending' status. QR code generated using qrcode library with visit ID encoded. Confirmation email sent via Brevo with embedded QR code. QR code decodes to correct visit ID when scanned. Each visit has unique QR code.

**Actual Results:**
Visit created with pending status. QR code generated with visit ID. Confirmation email sent via Brevo. QR code embedded in email. QR code decoded correctly to visit ID. Each visit had unique QR code.

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-012

**Test Case ID:** TC-FUN-012

**Module:** QR Code Services

**Test Case Description:** Generate and verify printable visit card with QR code

**Objective:** To ensure that the printable visit card contains a valid QR code and essential visit details for gate use.

**Preconditions:**
- A visit exists in the system with a valid visit ID
- Visit has an associated QR code
- Track Schedule page is accessible
- Print functionality is available in the browser

**Actions:**
- Step 1: Navigate to Track Schedule page and enter a valid visit ID
- Step 2: Click "Print Visit Card" button
- Step 3: Verify QR code is displayed on the card
- Step 4: Verify visit details are displayed (name, date, places, visit ID)
- Step 5: Verify card is formatted for printing
- Step 6: Test QR code scanning from printed card

**Expected Results:**
Valid visit ID loads visit details (name, date, places, ID). "Print Visit Card" opens printable modal or print preview. QR code prominently displayed and scannable. Card shows all essential information. Layout optimized for printing. QR code on printed card decodes correctly.

**Actual Results:**
Visit details loaded successfully. Print card modal opened. QR code displayed clearly. All visit information shown. Card formatted for printing. QR code scanned correctly from printed card.

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-013

**Test Case ID:** TC-FUN-013

**Module:** QR Scanner

**Test Case Description:** Scan visit QR code on QR Scanner page as personnel

**Objective:** To validate that the QR Scanner page allows personnel to scan a visit QR and view corresponding visit information without modifying status.

**Preconditions:**
- Personnel user account exists and is authenticated
- QR Scanner page is accessible to personnel role
- Camera access is available or manual input can be used
- A valid visit QR code exists for testing
- jsQR library is loaded

**Actions:**
- Step 1: Sign in as a personnel user
- Step 2: Navigate to QR Scanner page via navigation link
- Step 3: Click "Start Scanner" button
- Step 4: Point camera at a valid visit QR code
- Step 5: Verify visit information is displayed
- Step 6: Verify no status modification buttons are available
- Step 7: Verify visit status remains unchanged

**Expected Results:**
QR Scanner page loads with camera interface and "Start Scanner" button. Camera activates and scans using jsQR library. Valid QR code decoded to extract visit ID. Visit details retrieved and displayed (name, date, places, status). Only view actions available; no gate processing buttons visible. Visit status remains unchanged after scanning.

**Actual Results:**
QR Scanner page loaded with camera interface. Scanner activated and QR code detected. Visit details displayed correctly. No gate processing buttons visible. Visit status remained unchanged.

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-014

**Test Case ID:** TC-FUN-014

**Module:** QR Scanner & Guard Dashboard

**Test Case Description:** Use manual visit ID entry when camera is unavailable

**Objective:** To verify that manual visit ID entry works as a fallback when camera access is unavailable, both on the QR Scanner and Guard Dashboard pages.

**Preconditions:**
- QR Scanner page or Guard Dashboard page is accessible
- Camera access is unavailable or user chooses manual input
- A valid visit ID exists in the system for testing
- Manual input functionality is implemented

**Actions:**
- Step 1: Navigate to QR Scanner page
- Step 2: Click "Manual Input" button
- Step 3: Enter a valid visit ID in the input field
- Step 4: Click "Lookup Visit" or similar button
- Step 5: Verify visit details are displayed
- Step 6: Navigate to Guard Dashboard page
- Step 7: Use manual visit ID entry section
- Step 8: Enter visit ID and verify lookup works

**Expected Results:**
QR Scanner page loads normally. Manual input field appears when camera unavailable or "Manual Input" clicked. Field accepts numeric visit ID and validates format. Valid ID retrieves visit information from database. Details displayed same as QR scan. Guard Dashboard also has manual entry fallback. Manual entry allows gate processing without camera.

**Actual Results:**
Manual input field appeared on both pages. Visit ID accepted and validated. Visit information retrieved and displayed correctly. Fallback functionality worked as expected.

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-015

**Test Case ID:** TC-FUN-015

**Module:** Gate Processing

**Test Case Description:** Process entrance gate scan with face capture

**Objective:** To ensure that a guard can scan a valid visit QR at the entrance gate, capture a face image, and transition the visit status from `pending` to `in_progress`.

**Preconditions:**
- Guard user account exists and is authenticated
- Guard Dashboard page is accessible
- A visit exists with status 'pending' and a valid QR code
- Camera access is available for face capture
- Python AI service (YOLOv8) is available or BlazeFace fallback is active
- Entrance RPC function is configured

**Actions:**
- Step 1: Sign in as a guard user
- Step 2: Navigate to Guard Dashboard page
- Step 3: Scan a valid visit QR code with status 'pending'
- Step 4: Select "Entrance" gate option
- Step 5: Face detection modal opens automatically
- Step 6: Position face in camera frame
- Step 7: Face is automatically captured
- Step 8: Click confirm or process entrance
- Step 9: Verify visit status changes to 'in_progress'
- Step 10: Verify entrance scan is logged

**Expected Results:**
Guard Dashboard loads with QR scanner interface. Valid 'pending' QR code scanned and decoded. Visit details displayed. Guard selects "Entrance". Face detection modal opens automatically. Python AI detects face using YOLOv8. Face captured, cropped, compressed to 100x100px, and XOR-encrypted. Entrance RPC called with encrypted data. Visit status updated to 'in_progress'. Gate scan entry created in gate_scans table.

**Actual Results:**
Guard Dashboard loaded with scanner. QR code scanned and visit details shown. Face capture modal opened automatically. Face detected and captured. Face image processed and encrypted. Entrance RPC executed. Visit status updated to in_progress. Gate scan logged.

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-016

**Test Case ID:** TC-FUN-016

**Module:** Gate Processing

**Test Case Description:** Process temporary exit and re-entry workflow

**Objective:** To verify that temporary exit processing changes visit status from `in_progress` to `temporary_exit` and back to `in_progress` on re-entry.

**Preconditions:**
- Guard user is authenticated
- A visit exists with status 'in_progress' (entrance already processed)
- Visit QR code is available
- Camera access is available for face capture
- Temporary exit and re-entry RPC functions are configured

**Actions:**
- Step 1: Process entrance gate scan for a visit
- Step 2: Scan the same visit QR code on Guard Dashboard
- Step 3: Select "Temporary Exit" gate option
- Step 4: Complete face capture process
- Step 5: Confirm temporary exit
- Step 6: Verify visit status changes to 'temporary_exit'
- Step 7: Scan the same visit QR code again for re-entry
- Step 8: Select "Entrance" gate option
- Step 9: Complete face capture and confirm re-entry
- Step 10: Verify visit status returns to 'in_progress'

**Expected Results:**
After entrance, visit status is 'in_progress'. Scanning same QR code displays current status. Guard selects "Temporary Exit". Face capture completes and processes exit face. Temporary exit RPC updates status to 'temporary_exit'. Visit displays with 'temporary_exit' status. For re-entry, guard selects "Entrance" again. Re-entry RPC restores status to 'in_progress'.

**Actual Results:**
Temporary exit processed successfully. Status changed to temporary_exit. Visit details updated. Re-entry processed. Status restored to in_progress. Workflow completed correctly.

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-017

**Test Case ID:** TC-FUN-017

**Module:** Gate Processing & Face Verification

**Test Case Description:** Process exit gate scan with face verification

**Objective:** To confirm that exit processing requires a new face capture, compares it to the entrance face, and transitions status to `completed` or `completed_flagged` as appropriate.

**Preconditions:**
- Guard user is authenticated
- A visit exists with status 'in_progress' with entrance face already captured
- All places associated with the visit have been visited
- Camera access is available for exit face capture
- Face verification API endpoint is available
- Exit RPC function is configured

**Actions:**
- Step 1: Process entrance gate scan for a visit
- Step 2: Verify all places have been visited
- Step 3: Scan the same visit QR code on Guard Dashboard
- Step 4: Select "Exit" gate option
- Step 5: Face detection modal opens
- Step 6: Capture exit face image
- Step 7: System retrieves entrance face from database
- Step 8: Face verification API compares both faces
- Step 9: Verify similarity score is displayed
- Step 10: Confirm exit if similarity is above threshold (0.75)
- Step 11: Verify visit is marked as completed

**Expected Results:**
Visit has 'in_progress' status with entrance face stored. System checks all places are completed. QR code scanned displays visit details. Guard selects "Exit". Face detection modal opens for exit verification. Exit face captured, compressed, and encrypted. Entrance face retrieved and decrypted for comparison. Face verification API compares images using correlation coefficient. Similarity score calculated and displayed (e.g., 85%). If above threshold (0.75), exit RPC updates status to 'completed'.

**Actual Results:**
Exit face captured successfully. Entrance face retrieved for comparison. Face verification API calculated similarity score. Similarity displayed correctly. Exit RPC executed. Visit status updated to completed.

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-018

**Test Case ID:** TC-FUN-018

**Module:** Flagged Visits & Alerts

**Test Case Description:** Verify flagged visit alert modal appears for guards

**Objective:** To validate that flagged visits trigger a visible alert modal for guards and require explicit override or denial.

**Preconditions:**
- Admin user exists and can flag visits
- A visit or visitor exists that can be flagged
- Guard user is authenticated
- Guard Dashboard is accessible
- Flagged visit alert system is configured

**Actions:**
- Step 1: Admin flags a visitor or visit in the system
- Step 2: Guard scans QR code for the flagged visit
- Step 3: Verify flagged visit alert modal appears
- Step 4: Verify modal displays visit and visitor information
- Step 5: Verify override and deny options are available
- Step 6: Click "Override" button with reason
- Step 7: Verify override is recorded in audit logs
- Step 8: Test "Deny" option

**Expected Results:**
Admin can flag visitor or visit with reason. Guard scanning flagged visit QR code displays visit details normally. Flagged visit alert modal appears automatically with warning and flag reason. Modal shows flag details. "Override" and "Deny" buttons provided. Override logs action in audit logs and allows processing. Deny blocks processing and logs denial.

**Actual Results:**
Flagged visit alert modal appeared automatically. Flag warning and reason displayed. Override and Deny buttons visible. Override action logged. Visit processing continued after override. Denial blocked processing and logged.

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-019

**Test Case ID:** TC-FUN-019

**Module:** AI Face Detection

**Test Case Description:** Verify YOLOv8 face detection from live camera stream

**Objective:** To ensure the Python AI service can detect a face from the guard's live camera stream using YOLOv8 and return valid bounding box coordinates.

**Preconditions:**
- Guard user is authenticated
- Face detection modal can be opened
- Camera access is available
- Python AI service is running and accessible
- YOLOv8 model is loaded and ready
- /detect-face-base64 endpoint is available

**Actions:**
- Step 1: Open face detection modal on Guard Dashboard
- Step 2: Verify Python AI service is available
- Step 3: Position face in camera frame
- Step 4: System sends frame to Python AI service
- Step 5: YOLOv8 model processes the image
- Step 6: Verify bounding box coordinates are returned
- Step 7: Verify confidence score is provided
- Step 8: Verify face is highlighted or indicated in UI

**Expected Results:**
Face detection modal displays live camera feed. System performs health check on Python AI service. Video feed continuously shows frames. Frames converted to base64 and sent to /detect-face-base64 endpoint. YOLOv8 processes frame and detects faces. API returns normalized bounding box coordinates [x1, y1, x2, y2]. Confidence score returned (e.g., 0.95). Visual feedback (bounding box) displayed on camera feed.

**Actual Results:**
Face capture interface opened with live camera feed. Python AI service health check passed. Frames sent to detection endpoint. YOLOv8 detected face successfully. Normalized coordinates returned. Confidence score provided. Visual feedback displayed detected face area.

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-020

**Test Case ID:** TC-FUN-020

**Module:** AI Face Detection

**Test Case Description:** Verify automatic fallback to BlazeFace when Python service is unavailable

**Objective:** To verify that when the Python AI service is unavailable, the system automatically falls back to client-side BlazeFace detection and still allows capture.

**Preconditions:**
- Guard user is authenticated
- Face detection modal can be opened
- Camera access is available
- Python AI service can be made unavailable (simulated or actual)
- TensorFlow.js BlazeFace model can be loaded in browser
- Fallback detection system is implemented

**Actions:**
- Step 1: Simulate Python AI service unavailability
- Step 2: Open face detection modal
- Step 3: Verify fallback message appears
- Step 4: Position face in camera frame
- Step 5: System loads TensorFlow.js BlazeFace model
- Step 6: BlazeFace processes the frame
- Step 7: Verify face is detected and coordinates returned
- Step 8: Verify face capture still works
- Step 9: Restore Python service and verify automatic switch back

**Expected Results:**
When Python AI service unavailable, health check fails or times out. Face capture interface opens normally. UI displays "AI service unavailable - using browser fallback" message. Video feed continues. System automatically loads TensorFlow.js BlazeFace as fallback. Face detection uses client-side BlazeFace. Bounding boxes returned in same format. Face capture works normally with fallback. System auto-detects service availability and switches back to YOLOv8 when available.

**Actual Results:**
Service unavailability detected. Fallback message displayed. BlazeFace model loaded in browser. Face detection worked with fallback. Bounding box coordinates returned. Face capture processed successfully. System switched back to Python service when available.

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-021

**Test Case ID:** TC-FUN-021

**Module:** Face Image Processing & Storage

**Test Case Description:** Verify face image compression, encryption, and storage workflow

**Objective:** To confirm that captured face images are compressed, XOR-encrypted, stored in Supabase, and can be decrypted on demand in the Face Data modal.

**Preconditions:**
- Face capture can be performed during gate scan
- Image compression and encryption functions are implemented
- Supabase database is accessible
- Face Data modal is accessible to authorized users
- XOR encryption/decryption functions are available

**Actions:**
- Step 1: Capture a face image during gate scan
- Step 2: System compresses the image to 100x100px
- Step 3: System applies JPEG encoding with quality 0.5
- Step 4: System encrypts image using XOR encryption
- Step 5: Encrypted image is base64 encoded
- Step 6: Encrypted data is stored in gate_scans table
- Step 7: Open Face Data modal to view stored face
- Step 8: System retrieves encrypted data from database
- Step 9: System decrypts the image
- Step 10: Verify decrypted image displays correctly

**Expected Results:**
Face area cropped using bounding box coordinates. Image resized to 100x100px (80-90% size reduction). JPEG compression applied (quality 0.5). Image XOR-encrypted with key rotation. Encrypted image converted to base64. Data saved in gate_scans table. Face Data modal retrieves encrypted base64. XOR decryption restores original image. Decrypted face displayed correctly in modal.

**Actual Results:**
Face detected and cropped successfully. Image compressed to 100x100px. JPEG compression applied. XOR encryption completed. Encrypted data stored in database. Face Data modal retrieved and decrypted image. Face displayed correctly in modal.

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-022

**Test Case ID:** TC-FUN-022

**Module:** Face Verification

**Test Case Description:** Verify face verification similarity calculation

**Objective:** To validate that the face verification endpoint computes a similarity score between entrance and exit images and flags low-similarity cases for review.

**Preconditions:**
- Entrance gate scan has been processed with face capture
- Exit gate scan is being processed
- Face verification API endpoint (/metrics/verify-images) is available
- Python AI service is running
- Similarity threshold (0.75) is configured

**Actions:**
- Step 1: Process entrance gate scan with face capture
- Step 2: Process exit gate scan with face capture
- Step 3: System calls /metrics/verify-images API endpoint
- Step 4: Service extracts features from both faces
- Step 5: Service applies histogram equalization
- Step 6: Service calculates correlation coefficient
- Step 7: Service converts correlation to similarity (0-1 scale)
- Step 8: Verify similarity score is above threshold (0.75)
- Step 9: Verify similarity score is displayed in Face Data modal
- Step 10: Test with low similarity (< 0.75)

**Expected Results:**
Entrance face already stored from entrance scan. Exit face captured using same process. Face verification request sent to /metrics/verify-images with both images. Service extracts feature vectors (100x100 grayscale). Histogram equalization applied. Correlation coefficient computed. Similarity score calculated (0-1 scale, e.g., 0.87). If above threshold (0.75), match confirmed and exit proceeds. Similarity percentage displayed in Face Data modal. If below 0.75, visit flagged for review or requires guard override.

**Actual Results:**
Face verification request sent to Python service. Feature vectors generated and normalized. Correlation computed successfully. Similarity score calculated (above threshold). Match confirmed. Similarity percentage displayed. Low similarity cases flagged for review.

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-023

**Test Case ID:** TC-FUN-023

**Module:** AI Status Monitoring

**Test Case Description:** Verify AI Status dashboard displays service health and metrics

**Objective:** To ensure the AI Status dashboard correctly reflects the health and latency of the Python AI microservice and fallback state.

**Preconditions:**
- Admin or guard user is authenticated
- Dashboard with AI Status tab is accessible
- Python AI service can be tested for availability
- Service health check functionality is implemented
- Metrics collection system is active

**Actions:**
- Step 1: Sign in as admin or guard user
- Step 2: Navigate to Dashboard and click AI Status tab
- Step 3: Verify Python service health status is shown
- Step 4: Verify service response time/latency is displayed
- Step 5: Verify fallback status is indicated
- Step 6: Verify detection accuracy metrics if available
- Step 7: Test with Python service available
- Step 8: Test with Python service unavailable

**Expected Results:**
AI Status tab accessible to admin/guard users. Tab displays Python AI service health and performance. Service status shown ("Available" or "Unavailable"). Average latency metrics displayed in milliseconds. BlazeFace fallback state indicated when Python unavailable. Detection accuracy percentages displayed if available. Status updates based on service availability.

**Actual Results:**
AI Status tab displayed service health information. Service status shown correctly. Latency metrics displayed. Fallback state indicated when applicable. Accuracy percentages shown. Status updated correctly based on service availability.

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-024

**Test Case ID:** TC-FUN-024

**Module:** Admin Dashboard

**Test Case Description:** Verify admin dashboard displays all administrative tabs

**Objective:** To verify that an admin can access the Dashboard with Places, Accounts, Gates, Feedback, and AI Status tabs visible.

**Preconditions:**
- Admin user account exists and is authenticated
- Dashboard page is accessible
- Admin role has full access permissions
- All admin tabs are configured and available

**Actions:**
- Step 1: Sign in as an admin user
- Step 2: Navigate to Dashboard page
- Step 3: Verify Places tab is visible
- Step 4: Verify Accounts tab is visible
- Step 5: Verify Gates tab is visible
- Step 6: Verify Feedback tab is visible
- Step 7: Verify AI Status tab is visible
- Step 8: Click each tab and verify content loads

**Expected Results:**
Admin authenticated with full access. Dashboard loads with admin interface. Places tab appears for place management. Accounts tab appears for user management. Gates tab appears for gate configuration. Feedback tab appears for analytics. AI Status tab appears for service health. Each tab displays corresponding content when clicked.

**Actual Results:**
Admin Dashboard loaded with all tabs visible. Places, Accounts, Gates, Feedback, and AI Status tabs appeared. Tab content loaded correctly when clicked. All administrative functions accessible.

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-025

**Test Case ID:** TC-FUN-025

**Module:** Place Management

**Test Case Description:** Create, edit, and delete places as admin

**Objective:** To confirm that an admin can create, edit, and delete places, and see changes reflected in scheduling options on the Home and Dashboard pages.

**Preconditions:**
- Admin user is authenticated
- Places management interface is accessible
- Database is available for place creation/modification
- Audit logging system is configured
- Home page scheduling dropdown is functional

**Actions:**
- Step 1: Sign in as admin and navigate to Places tab
- Step 2: Click "Add New Place" button
- Step 3: Enter place name, description, and location
- Step 4: Submit place creation
- Step 5: Verify place appears in places list
- Step 6: Verify place appears in scheduling dropdown on Home page
- Step 7: Click edit on an existing place
- Step 8: Modify place information and save
- Step 9: Verify changes are reflected in places list
- Step 10: Click delete on a place
- Step 11: Confirm deletion
- Step 12: Verify deletion is logged in audit trail

**Expected Results:**
Places management interface displays list of places. "Add New Place" opens creation modal with name, description, location fields. Form accepts and validates input. New place created and saved. Place appears in list and scheduling dropdown. Edit button opens modal with current details. Updates saved and reflected in list. Delete shows confirmation dialog. Place deleted and removed. Delete action logged.

**Actual Results:**
Places management interface displayed. Place creation modal opened. New place created and saved. Place appeared in list and scheduling dropdown. Edit modal opened with place details. Updates saved successfully. Delete confirmation appeared. Place deleted and removed. Delete action logged.

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-026

**Test Case ID:** TC-FUN-026

**Module:** Place & Personnel Management

**Test Case Description:** Assign personnel to places and configure visit limits and purposes

**Objective:** To validate that an admin can assign personnel to places and configure visit limits and purposes per place.

**Preconditions:**
- Admin user is authenticated
- At least one place exists in the system
- At least one personnel user account exists
- Places management interface is accessible
- Personnel assignment functionality is available

**Actions:**
- Step 1: Navigate to Places tab in admin dashboard
- Step 2: Click on a place to view details
- Step 3: Click "Assign Personnel" button
- Step 4: Select a personnel user from available list
- Step 5: Confirm personnel assignment
- Step 6: Verify assignment is reflected in place details
- Step 7: Click "Configure Visit Limits" button
- Step 8: Select limit type (weekly or monthly)
- Step 9: Enter limit value (e.g., 10 visits)
- Step 10: Save visit limit configuration
- Step 11: Click "Add Purpose" or "Edit Purposes"
- Step 12: Create or edit place purpose with advance notice days
- Step 13: Verify purpose appears in scheduling dropdown

**Expected Results:**
Places tab displays all places. Clicking place opens details panel. "Assign Personnel" opens assignment interface with available personnel list. Personnel selectable and assignable. Assignment creates database relationship. Assigned personnel listed in place details. "Configure Visit Limits" opens limit modal. Admin selects limit type (weekly/monthly) and sets value. Limit saved and enforced during scheduling. "Add Purpose" opens purpose management. Purpose configurable with advance notice (0-6 days). Purpose available in scheduling dropdown.

**Actual Results:**
Place details panel opened. Personnel assigned successfully. Assigned personnel listed. Visit limit configured and saved. Purpose management interface opened. Purpose configured with advance notice days. Purpose available in scheduling dropdown.

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-027

**Test Case ID:** TC-FUN-027

**Module:** Log Dashboard

**Test Case Description:** Verify log-role user can access logs-only dashboard

**Objective:** To ensure that a log-role user can open the Dashboard and view only the Logs tab and content.

**Preconditions:**
- Log-role user account exists and is authenticated
- Dashboard page is accessible
- Audit logs exist in the system
- Logs tab is configured for log-role users
- Other admin tabs are restricted from log users

**Actions:**
- Step 1: Sign in as a log-role user
- Step 2: Navigate to Dashboard page
- Step 3: Verify only Logs tab is visible
- Step 4: Verify Logs tab is active and content is displayed
- Step 5: Verify log entries are displayed in list
- Step 6: Verify pagination controls are available
- Step 7: Verify other dashboard sections are hidden

**Expected Results:**
Log user authenticated with read-only access. Dashboard loads with restricted interface. Other admin tabs (Places, Accounts, Gates, Feedback, AI Status) hidden. Logs tab only visible tab, active by default. Logs content displays audit entries. Entries show timestamp, user, action type, category, description. Pagination controls visible. Other content hidden.

**Actual Results:**
Log user authenticated. Dashboard loaded with restricted access. Only Logs tab visible. Audit log entries displayed with details. Pagination controls available. Other tabs and content hidden correctly.

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-028

**Test Case ID:** TC-FUN-028

**Module:** Audit Logging

**Test Case Description:** Verify log filtering functionality

**Objective:** To verify that log filters (category, action type, date range, search) correctly narrow down audit entries.

**Preconditions:**
- Log-role user or admin is authenticated
- Logs tab is accessible
- Multiple audit log entries exist with different categories, action types, and dates
- Filtering functionality is implemented

**Actions:**
- Step 1: Navigate to Logs tab in dashboard
- Step 2: Click on category filter tab (e.g., "Gate")
- Step 3: Verify only gate-related logs are displayed
- Step 4: Select action type filter (e.g., "gate_entrance_scan")
- Step 5: Verify logs are further filtered by action type
- Step 6: Set date range filter (start and end dates)
- Step 7: Verify logs are filtered by date range
- Step 8: Enter search term in search field
- Step 9: Verify logs are filtered by search term
- Step 10: Clear all filters
- Step 11: Verify all logs are displayed again

**Expected Results:**
Logs tab displays all audit entries. Category filter (e.g., "Gate") filters logs by category. Action type filter further narrows results. Date range filter shows entries within range. Search query filters by matching descriptions, user names, or searchable fields. Clearing filters displays complete unfiltered list.

**Actual Results:**
Category filter applied correctly. Log list filtered by category. Action type filter narrowed results. Date range filter worked. Search query filtered logs. Filters reset successfully. Complete log list displayed when filters cleared.

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-029

**Test Case ID:** TC-FUN-029

**Module:** Personnel Dashboard

**Test Case Description:** Verify personnel dashboard displays correct tabs and filtered visits

**Objective:** To confirm that a personnel user sees Assignment, Visits, Requests, and Finished tabs and can view only visits for their assigned places.

**Preconditions:**
- Personnel user account exists and is authenticated
- Personnel is assigned to at least one place
- Visits exist for assigned places
- Dashboard page is accessible
- Role-based filtering is configured

**Actions:**
- Step 1: Sign in as a personnel user
- Step 2: Navigate to Dashboard page
- Step 3: Verify Assignment tab is visible
- Step 4: Verify Visits tab is visible
- Step 5: Verify Requests tab is visible
- Step 6: Verify Finished tab is visible
- Step 7: Click Assignment tab
- Step 8: Verify only places assigned to personnel are shown
- Step 9: Click Visits tab
- Step 10: Verify only visits for assigned places are shown
- Step 11: Click Requests tab
- Step 12: Verify only requests for assigned places are shown

**Expected Results:**
Personnel authenticated. Dashboard loads with personnel tabs (Assignment, Visits, Requests, Finished). Assignment tab shows only assigned places. Visits tab shows in-progress visits for assigned places only. Requests tab shows reschedule requests for assigned places only. Finished tab shows completed visits. All tabs filtered by assigned places.

**Actual Results:**
Personnel Dashboard loaded with all tabs. Assignment tab showed only assigned places. Visits tab filtered by assigned places. Requests tab filtered by assigned places. Finished tab displayed completed visits. All filtering worked correctly.

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-030

**Test Case ID:** TC-FUN-030

**Module:** Visit Reschedule System

**Test Case Description:** Process visitor reschedule requests as personnel

**Objective:** To validate that personnel can approve or decline visitor reschedule requests and that resulting schedule changes are enforced by the system.

**Preconditions:**
- Personnel user is authenticated and assigned to a place
- Visitor has requested a reschedule for a visit to the personnel's assigned place
- Reschedule request exists with status 'pending_reschedule'
- Requests tab is accessible
- Reschedule processing functionality is available

**Actions:**
- Step 1: Visitor requests a reschedule for a visit
- Step 2: Sign in as personnel assigned to the visit's place
- Step 3: Navigate to Requests tab in dashboard
- Step 4: Verify reschedule request appears in list
- Step 5: Click "Accept" or "Decline" button
- Step 6: If accepting, select a new date that meets requirements
- Step 7: Verify system validates new date (limits, advance notice)
- Step 8: Confirm acceptance or decline
- Step 9: Verify visit date is updated if accepted
- Step 10: Verify reschedule action is logged
- Step 11: Verify visitor is notified of decision

**Expected Results:**
Reschedule request created with 'pending_reschedule' status. Personnel sees requests for assigned places in Requests tab. Request details shown (original date, new date, visitor info, reason). "Accept" or "Decline" opens action modal. Accept allows new date selection. System validates new date (advance notice, limits). Decision processed. If accepted, visit date updated. Action logged in audit trail. Visitor notified of decision.

**Actual Results:**
Reschedule requests displayed in Requests tab. Request details shown correctly. Action modal opened. New date selected and validated. Reschedule decision processed. Visit date updated when accepted. Action logged in audit trail. Visitor notified of decision.

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-031

**Test Case ID:** TC-FUN-031

**Module:** Guard Dashboard

**Test Case Description:** Verify guard dashboard access and navigation

**Objective:** To ensure that a guard user sees the Guard Dashboard and AI Status tabs and can access the dedicated Guard Dashboard page.

**Preconditions:**
- Guard user account exists and is authenticated
- Dashboard page is accessible
- Guard Dashboard page is accessible via navigation
- Guard role has appropriate permissions

**Actions:**
- Step 1: Sign in as a guard user
- Step 2: Navigate to Dashboard page
- Step 3: Verify Guard Dashboard tab is visible
- Step 4: Verify AI Status tab is visible
- Step 5: Verify other admin tabs are hidden
- Step 6: Click Guard Dashboard tab
- Step 7: Navigate to Guard Dashboard page via navigation link
- Step 8: Verify Guard Dashboard page has scanner interface
- Step 9: Verify page has manual visit ID entry section

**Expected Results:**
Guard authenticated. Dashboard loads with guard tabs (Guard Dashboard, AI Status). Other admin tabs hidden. Guard Dashboard tab displays guard content. Dedicated Guard Dashboard page accessible via navigation. Page loads with QR scanner and gate processing interface. Camera feed, scan overlay, and gate selection buttons visible. Manual visit ID input available as fallback.

**Actual Results:**
Guard Dashboard tab appeared. AI Status tab visible. Other admin tabs hidden. Guard dashboard content displayed. Dedicated Guard Dashboard page loaded. QR scanner and gate processing interface visible. Manual input field available.

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-032

**Test Case ID:** TC-FUN-032

**Module:** Guard Dashboard

**Test Case Description:** Verify real-time scan telemetry updates

**Objective:** To verify that guard dashboard metrics (scan rate, interval, status text) update in real time during scanning.

**Preconditions:**
- Guard user is authenticated
- Guard Dashboard page is accessible
- Scanner functionality is available
- Camera access is available
- Real-time metrics update system is implemented

**Actions:**
- Step 1: Navigate to Guard Dashboard page
- Step 2: Click "Start Scanner" button
- Step 3: Verify scan rate (FPS) indicator is displayed
- Step 4: Verify scan interval indicator is displayed
- Step 5: Verify status text updates during scanning
- Step 6: Point camera at QR code
- Step 7: Verify metrics update in real time
- Step 8: Verify status text changes to "Detecting" or "Success"
- Step 9: Stop scanner

**Expected Results:**
Guard Dashboard loads with scanner interface. "Start Scanner" activates camera feed. FPS counter displays scan rate (e.g., "15 FPS"). Interval counter shows time between scans (e.g., "100ms"). Status text updates dynamically ("Position QR code", "Detecting", "Success"). QR detection processed when detected. FPS and interval update in real-time. Status text reflects current scan state. Metrics reset when scanner stopped.

**Actual Results:**
Scanner activated and camera feed started. FPS counter displayed scan rate. Interval counter showed scan interval. Status messages updated dynamically. QR code detection worked. Metrics updated in real-time. Status reflected scan state correctly. Metrics reset when scanner stopped.

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-033

**Test Case ID:** TC-FUN-033

**Module:** Visitor Dashboard

**Test Case Description:** Verify visitor dashboard displays current and past visits with filtering

**Objective:** To confirm that a visitor user can open their Dashboard and view Current (Today/Future) and Past visits with correct filtering and counts.

**Preconditions:**
- Visitor user account exists and is authenticated
- Visitor has visits scheduled (some current, some past)
- Dashboard page is accessible
- Date filtering logic is implemented

**Actions:**
- Step 1: Sign in as a visitor user
- Step 2: Navigate to Dashboard page
- Step 3: Verify "Current Visits" tab is visible
- Step 4: Verify "Past Visits" tab is visible
- Step 5: Click "Current Visits" tab
- Step 6: Verify visit count is displayed correctly
- Step 7: Verify visits are filtered by date (today and future)
- Step 8: Click "Past Visits" tab
- Step 9: Verify past visit count is displayed
- Step 10: Verify visits are filtered by date (past dates)
- Step 11: Verify visit details are displayed (date, places, status)

**Expected Results:**
Visitor authenticated. Dashboard loads with visitor tabs (Current Visits, Past Visits). Current Visits tab shows today and future visits with count. Filtering excludes past visits. Past Visits tab shows completed/past visits with count. Filtering shows only dates before today. Each visit displays date, places, status, and ID.

**Actual Results:**
Visitor Dashboard loaded with Current and Past Visits tabs. Current Visits showed today and future visits. Visit count displayed correctly. Past Visits showed completed visits. Filtering worked correctly for both tabs. Visit information displayed for each visit.

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-034

**Test Case ID:** TC-FUN-034

**Module:** Visit Reschedule System

**Test Case Description:** Request visit reschedule from visitor dashboard

**Objective:** To validate that visitors can request a reschedule for eligible visits directly from their Dashboard and see status updates.

**Preconditions:**
- Visitor user is authenticated
- Visitor has at least one visit with status 'pending'
- Dashboard with Current Visits tab is accessible
- Reschedule request functionality is available
- Personnel is assigned to the visit's place

**Actions:**
- Step 1: Sign in as a visitor user
- Step 2: Navigate to Dashboard and view Current Visits
- Step 3: Locate a visit with status 'pending'
- Step 4: Click "Request Reschedule" button on the visit
- Step 5: Select a new date that meets advance notice requirements
- Step 6: Enter reason for reschedule (if required)
- Step 7: Click "Submit Reschedule Request" button
- Step 8: Verify success message appears
- Step 9: Verify visit status changes to 'pending_reschedule'
- Step 10: Verify reschedule request appears in personnel dashboard
- Step 11: Refresh dashboard and verify status update

**Expected Results:**
Visitor authenticated. Current Visits tab shows eligible 'pending' visits. "Request Reschedule" opens modal. Modal allows new date selection with advance notice enforcement. Reason field available if required. "Submit Reschedule Request" submits request. Success message displayed. Visit status updated to 'pending_reschedule'. Request visible to assigned personnel. Status updated on dashboard refresh.

**Actual Results:**
Reschedule request modal opened. New date selected with validation. Reason field accepted input. Request submitted successfully. Confirmation message displayed. Visit status updated to pending_reschedule. Request visible to assigned personnel. Status updated on refresh.

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-035

**Test Case ID:** TC-FUN-035

**Module:** Track Schedule

**Test Case Description:** Track visit using visit ID on Track Schedule page

**Objective:** To verify that any visitor or guest can open the Track Schedule page, enter a valid visit ID, and see full visit details and progress.

**Preconditions:**
- Track Schedule page is accessible (no authentication required)
- A visit exists in the system with a valid visit ID
- Visit has associated places and gate scan data
- QR code exists for the visit

**Actions:**
- Step 1: Navigate to Track Schedule page via navigation link
- Step 2: Verify visit ID input field is visible
- Step 3: Enter a valid visit ID in the input field
- Step 4: Click "Track Visit" or "Search" button
- Step 5: Verify visit details are displayed
- Step 6: Verify visit progress is displayed
- Step 7: Verify places to visit list is displayed
- Step 8: Verify gate scan status is displayed
- Step 9: Verify visit QR code is displayed
- Step 10: Verify print visit card option is available

**Expected Results:**
Track Schedule page loads with visit ID input field. Valid ID retrieves visit from database. Visit information displayed (name, date, places, status). Progress indicators show current status. Places list shows completion status. Entrance and exit gate scan status shown. QR code visible and displayable. "Print Visit Card" button available.

**Actual Results:**
Track Schedule page loaded. Visit ID input field displayed. Visit information retrieved successfully. Visit details shown correctly. Progress indicators displayed status. Places list showed completion status. Gate scan status displayed. QR code visible. Print button available.

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-036

**Test Case ID:** TC-FUN-036

**Module:** Track Schedule

**Test Case Description:** Verify error handling for invalid visit ID

**Objective:** To ensure that entering an invalid or unknown visit ID shows an appropriate "no visit found" state.

**Preconditions:**
- Track Schedule page is accessible
- Error handling system is implemented
- Input validation is configured

**Actions:**
- Step 1: Navigate to Track Schedule page
- Step 2: Enter an invalid visit ID (non-existent)
- Step 3: Click "Track Visit" button
- Step 4: Verify "No Visit Found" message appears
- Step 5: Verify appropriate error state UI is shown
- Step 6: Verify error message is user-friendly
- Step 7: Enter an invalid format (non-numeric or too short)
- Step 8: Verify validation error appears
- Step 9: Clear input and verify reset

**Expected Results:**
Track Schedule page loads normally. Invalid/non-existent ID shows error message. "No Visit Found" component displayed. Error message user-friendly. Invalid format shows validation error before submission. Input field clearable for new entry.

**Actual Results:**
Invalid visit ID handled correctly. Error message displayed. "No Visit Found" component shown. Format validation prevented invalid input. Input field cleared for new entry. Error handling worked as expected.

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-037

**Test Case ID:** TC-FUN-037

**Module:** Track Schedule

**Test Case Description:** Verify Track Schedule displays all visit information correctly

**Objective:** To confirm that Track Schedule correctly displays gate scan status (entrance/exit), places list, and visit QR for printing.

**Preconditions:**
- Track Schedule page is accessible
- A visit exists with valid visit ID
- Visit has entrance and/or exit gate scans
- Visit has associated places
- QR code exists for the visit
- Print functionality is available

**Actions:**
- Step 1: Navigate to Track Schedule page
- Step 2: Enter a valid visit ID and track visit
- Step 3: Verify entrance gate scan status is displayed
- Step 4: Verify exit gate scan status is displayed
- Step 5: Verify places to visit list is displayed
- Step 6: Verify place completion status is indicated
- Step 7: Verify visit QR code is displayed
- Step 8: Click "Print Visit Card" button
- Step 9: Verify printable card contains QR code and details
- Step 10: Verify visit progress bar or indicator is shown

**Expected Results:**
Track Schedule loads with valid visit ID. Visit details loaded and displayed. Entrance and exit scan status shown with timestamps. Places list shows completion indicators (checkmarks for completed, status for pending). QR code visible and scannable. "Print Visit Card" opens print preview. Card contains all essential information. Progress visualization shows overall completion status.

**Actual Results:**
Visit details loaded correctly. Entrance and exit scan status displayed. Places list showed completion status. QR code visible and scannable. Print preview opened. Card contained all essential information. Progress visualization displayed correctly.

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-038

**Test Case ID:** TC-FUN-038

**Module:** Feedback System

**Test Case Description:** Verify feedback survey is offered after visit completion

**Objective:** To validate that after a visit is completed, the system offers an ISO 25010 feedback survey for that visit.

**Preconditions:**
- A visit has been completed (entrance and exit scans processed)
- Visitor user account exists and can be authenticated
- Feedback survey system is configured
- ISO 25010 quality attributes are defined
- Dashboard or Home page is accessible

**Actions:**
- Step 1: Complete a visit (entrance and exit scans processed)
- Step 2: Sign in as the visitor who completed the visit
- Step 3: Navigate to Dashboard or Home page
- Step 4: Verify feedback survey modal appears automatically
- Step 5: Verify survey contains ISO 25010 quality attributes
- Step 6: Verify survey is specific to the completed visit
- Step 7: Verify survey can be closed and reopened later
- Step 8: Navigate to Past Visits tab
- Step 9: Verify "Provide Feedback" button appears for completed visits

**Expected Results:**
Completed visit status is 'completed'. Visitor authenticated. Feedback survey modal appears automatically. Survey contains ISO 25010 quality attributes. Survey specific to completed visit with details. Modal dismissible and accessible later. "Provide Feedback" button appears in Past Visits tab for visits without feedback.

**Actual Results:**
Visit status updated to completed. Feedback modal appeared automatically. ISO 25010 survey displayed. Visit details shown in modal. Modal dismissible and accessible later. Feedback button visible on completed visits in Past Visits tab.

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-039

**Test Case ID:** TC-FUN-039

**Module:** Feedback System

**Test Case Description:** Verify only one feedback submission per visit is allowed

**Objective:** To ensure that only one feedback submission per visit is accepted and subsequent attempts are blocked.

**Preconditions:**
- A completed visit exists
- Feedback survey can be accessed
- Feedback submission system is configured
- Duplicate submission prevention is implemented

**Actions:**
- Step 1: Open feedback survey for a completed visit
- Step 2: Fill in all survey questions
- Step 3: Submit feedback survey
- Step 4: Verify success message appears
- Step 5: Verify feedback is recorded in database
- Step 6: Attempt to open feedback survey for the same visit again
- Step 7: Verify submission is blocked
- Step 8: Verify message indicates feedback already submitted
- Step 9: Verify "Provide Feedback" button is disabled or hidden
- Step 10: Verify visit shows "Feedback Submitted" status

**Expected Results:**
Feedback modal opens with ISO 25010 survey form. All questions accept responses. Feedback saved to database on submission. Success message displayed. Feedback entry created and linked to visit. Duplicate submission detected and blocked. Error message explains feedback already provided. "Provide Feedback" button disabled/hidden. Status indicator shows feedback complete.

**Actual Results:**
Feedback modal opened. Survey responses accepted. Feedback submitted and saved. Confirmation message displayed. Feedback entry created in database. Duplicate submission blocked. Error message shown. Feedback button disabled. Status indicator showed feedback complete.

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-040

**Test Case ID:** TC-FUN-040

**Module:** Feedback Analytics

**Test Case Description:** Verify feedback responses appear in admin analytics dashboard

**Objective:** To confirm that feedback responses appear in the Feedback analytics dashboard for admins.

**Preconditions:**
- At least one feedback submission exists in the system
- Admin user is authenticated
- Feedback analytics dashboard is accessible
- Feedback data is stored in the database
- Analytics and visualization tools are configured

**Actions:**
- Step 1: Submit feedback for a completed visit
- Step 2: Sign in as an admin user
- Step 3: Navigate to Dashboard and click Feedback tab
- Step 4: Verify feedback entries are displayed in list
- Step 5: Verify feedback data includes visit information
- Step 6: Verify ISO 25010 attribute scores are displayed
- Step 7: Verify analytics charts or summaries are displayed
- Step 8: Verify feedback can be filtered by date range
- Step 9: Verify feedback can be filtered by visit or visitor
- Step 10: Verify aggregated statistics are calculated

**Expected Results:**
Feedback saved to database. Admin authenticated. Feedback tab loads analytics dashboard. All feedback responses displayed in list/table. Each entry associated with visit details. ISO 25010 quality attribute scores displayed. Visualizations show feedback trends. Date range filter available. Additional filters work (visit, visitor, attribute). Aggregated statistics displayed.

**Actual Results:**
Feedback saved to database. Feedback analytics dashboard loaded. Feedback responses displayed with visit details. Quality attribute scores shown. Visualizations displayed trends. Date filter worked. Additional filters functioned correctly. Aggregated statistics calculated and displayed.

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-041

**Test Case ID:** TC-FUN-041

**Module:** Email Notifications

**Test Case Description:** Verify visit confirmation email is sent with QR code

**Objective:** To verify that visit confirmation emails (with QR) are sent to visitors upon successful scheduling.

**Preconditions:**
- Visit scheduling process can be completed
- Brevo email service is configured and available
- QR code generation is functional
- Visitor email address is valid and accessible
- Email template with QR code embedding is configured

**Actions:**
- Step 1: Complete visit scheduling process
- Step 2: Verify visit status is 'pending'
- Step 3: Check visitor's email inbox
- Step 4: Verify email is sent via Brevo service
- Step 5: Verify email contains visit details
- Step 6: Verify QR code is embedded in email
- Step 7: Verify QR code is scannable from email
- Step 8: Verify email contains visit ID
- Step 9: Verify email contains instructions
- Step 10: Verify email is sent to correct recipient

**Expected Results:**
Visit created with 'pending' status. Confirmation email sent via Brevo. Email delivered successfully. Email contains visit details (date, places, purpose). QR code embedded and visible. QR code scannable from email. Visit ID displayed. Instructions included. Email sent to correct recipient.

**Actual Results:**
Visit created with pending status. Confirmation email sent via Brevo. Email delivered successfully. Visit details included in email. QR code embedded and visible. QR code scannable from email. Visit ID displayed. Instructions included. Email sent to correct recipient.

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-042

**Test Case ID:** TC-FUN-042

**Module:** Email Notifications

**Test Case Description:** Verify visit completion email is sent with feedback link

**Objective:** To validate that visit completion emails with feedback links are sent when a visit transitions to `completed`.

**Preconditions:**
- A visit can be completed (exit gate scan processed)
- Visit status can transition to 'completed'
- Brevo email service is configured
- Email trigger system is implemented
- Feedback survey link generation is functional
- Visitor email address is valid

**Actions:**
- Step 1: Complete exit gate scan for a visit
- Step 2: Verify completion email trigger is activated
- Step 3: Check visitor's email inbox
- Step 4: Verify email is sent via Brevo service
- Step 5: Verify email contains visit completion confirmation
- Step 6: Verify feedback survey link is included in email
- Step 7: Click feedback link in email
- Step 8: Verify feedback survey opens for correct visit
- Step 9: Verify email contains visit summary
- Step 10: Verify email is sent to correct recipient

**Expected Results:**
Exit scan completed, visit status 'completed'. Email process initiated automatically. Completion email sent via Brevo. Email delivered successfully. Completion confirmation message included. Feedback survey link included and functional. Link redirects to feedback survey. Survey pre-populated with visit details. Visit summary included. Email sent to correct recipient.

**Actual Results:**
Visit status updated to completed. Completion email sent via Brevo. Email delivered successfully. Completion message included. Feedback link functional. System redirected to feedback survey. Survey pre-populated with visit details. Visit summary included. Email sent to correct recipient.

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-043

**Test Case ID:** TC-FUN-043

**Module:** Security & Access Control

**Test Case Description:** Verify unauthenticated users cannot access protected pages

**Objective:** To confirm that users without an authenticated session cannot access protected pages such as Dashboard, Guard Dashboard, and QR Scanner.

**Preconditions:**
- User is not authenticated or session is cleared
- Protected pages exist (Dashboard, Guard Dashboard, QR Scanner)
- Access control system is implemented
- Redirect functionality is configured

**Actions:**
- Step 1: Sign out or clear session
- Step 2: Attempt to navigate to Dashboard page directly via URL
- Step 3: Verify redirect message or sign-in prompt appears
- Step 4: Attempt to navigate to Guard Dashboard page directly
- Step 5: Attempt to navigate to QR Scanner page directly
- Step 6: Verify protected navigation links are hidden
- Step 7: Sign in with valid credentials
- Step 8: Verify protected pages are now accessible

**Expected Results:**
User no longer authenticated after sign out. Unauthenticated access to Dashboard redirects to home/sign-in. Authentication required message shown. Guard Dashboard and QR Scanner also redirect. Protected navigation links hidden. After sign-in, session established. Protected pages accessible based on role.

**Actual Results:**
Unauthenticated access attempts redirected. Authentication required message shown. Protected navigation links hidden. After sign-in, protected pages accessible. Access control enforced correctly.

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-044

**Test Case ID:** TC-FUN-044

**Module:** Role-Based Access Control

**Test Case Description:** Verify role-based restrictions prevent unauthorized access

**Objective:** To ensure that role-based restrictions prevent users from accessing dashboards or actions not permitted to their role (e.g., visitors cannot access admin tabs).

**Preconditions:**
- Multiple user accounts exist with different roles (visitor, guard, personnel, admin)
- Users can be authenticated with their respective roles
- Role-based access control (RBAC) is implemented
- Dashboard pages are accessible
- URL manipulation attempts can be tested

**Actions:**
- Step 1: Sign in as a visitor user
- Step 2: Navigate to Dashboard page
- Step 3: Verify admin tabs (Places, Accounts, Gates, Feedback, AI Status) are hidden
- Step 4: Verify visitor tabs (Current Visits, Past Visits) are visible
- Step 5: Attempt to access admin tab via direct URL manipulation
- Step 6: Sign in as a guard user
- Step 7: Verify guard can access Guard Dashboard but not admin tabs
- Step 8: Sign in as a personnel user
- Step 9: Verify personnel can access QR Scanner but not Guard Dashboard
- Step 10: Verify role-based actions are restricted

**Expected Results:**
Visitor authenticated. Dashboard loads with visitor content. Admin tabs hidden. Visitor tabs displayed. URL manipulation blocked/redirected. Guard authenticated. Guard Dashboard accessible, admin tabs hidden. Personnel authenticated. QR Scanner accessible, Guard Dashboard hidden. Actions match role permissions.

**Actual Results:**
Role-based access control enforced correctly. Visitor saw only visitor tabs. Admin tabs hidden from non-admin users. Guard Dashboard accessible to guards only. QR Scanner accessible to personnel only. URL manipulation blocked. Actions restricted by role permissions.

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-045

**Test Case ID:** TC-FUN-045

**Module:** About Page

**Test Case Description:** Verify About page displays all company information correctly

**Objective:** To verify that the About page displays company information, mission and vision, team profiles, technology stack, culture, values, thesis timeline, and statistics correctly.

**Preconditions:**
- About page is accessible via navigation
- Company information content is available
- Page content is configured and populated
- Responsive design is implemented

**Actions:**
- Step 1: Navigate to About page via navigation link
- Step 2: Verify company information section is displayed
- Step 3: Verify mission and vision statements are displayed
- Step 4: Verify team profiles section is displayed
- Step 5: Verify technology stack section is displayed
- Step 6: Verify company culture section is displayed
- Step 7: Verify company values section is displayed
- Step 8: Verify thesis timeline section is displayed
- Step 9: Verify statistics section is displayed
- Step 10: Verify page is responsive and scrollable

**Expected Results:**
About page loads successfully. Company information section displayed. Mission and vision statements visible. Team profiles section displayed. Technology stack shown with icons. Company culture information displayed. Company values listed. Thesis timeline shown. Statistics/metrics displayed. Page responsive and scrollable.

**Actual Results:**
About page loaded successfully. All sections displayed correctly. Company information, mission, vision shown. Team profiles displayed. Tech stack listed. Culture and values shown. Timeline displayed. Statistics visible. Page responsive and accessible.

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-046

**Test Case ID:** TC-FUN-046

**Module:** Contact Page

**Test Case Description:** Verify Contact page functionality and content

**Objective:** To validate that the Contact page allows users to submit contact forms via EmailJS, view business hours, location information, social media links, and see daily rotating public feedback testimonials.

**Preconditions:**
- Contact page is accessible via navigation
- EmailJS service is configured
- Contact form is functional
- Public feedback testimonials exist in the system
- Daily rotation system is implemented

**Actions:**
- Step 1: Navigate to Contact page via navigation link
- Step 2: Verify contact form is displayed
- Step 3: Fill in contact form fields
- Step 4: Submit contact form
- Step 5: Verify success message appears
- Step 6: Verify business hours section is displayed
- Step 7: Verify location information is displayed
- Step 8: Verify social media links are displayed
- Step 9: Verify social media links are clickable
- Step 10: Verify daily rotating feedback testimonials are displayed
- Step 11: Verify testimonials rotate daily

**Expected Results:**
Contact page loads successfully. Contact form displayed with name, email, message fields. Form accepts and validates input. Submission sent via EmailJS. Success message displayed. Business hours shown. Location information displayed. Social media links visible and open in new tabs. Testimonials section shows public feedback. Testimonials rotate daily.

**Actual Results:**
Contact page loaded. Contact form displayed and functional. Form submitted via EmailJS. Confirmation message shown. Business hours displayed. Location information shown. Social media links visible and functional. Testimonials displayed. Daily rotation worked correctly.

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-047

**Test Case ID:** TC-FUN-047

**Module:** Profile Settings

**Test Case Description:** Verify profile settings allow password and account updates

**Objective:** To confirm that authenticated users can access Profile Settings to change their password and update account information.

**Preconditions:**
- User is authenticated with any role
- Profile Settings functionality is accessible
- Supabase authentication allows password changes
- Account information can be updated
- Current password is known

**Actions:**
- Step 1: Sign in as any authenticated user
- Step 2: Click on profile icon or settings link
- Step 3: Verify current account information is displayed
- Step 4: Click "Change Password" section
- Step 5: Enter current password
- Step 6: Enter new password
- Step 7: Confirm new password
- Step 8: Submit password change
- Step 9: Verify success message appears
- Step 10: Verify account information can be updated
- Step 11: Save account information changes

**Expected Results:**
Profile Settings opens displaying current account information (name, email, role). "Change Password" section available. Current password validated. New password enforces requirements (min 6 chars). Confirm password validates match. Password updated via Supabase. Confirmation message displayed. Account information editable. Changes saved to database.

**Actual Results:**
Profile Settings opened. Current account information displayed. Password change form appeared. Password updated via Supabase. Confirmation message shown. Account information editable. Changes saved to database.

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-048

**Test Case ID:** TC-FUN-048

**Module:** Face Enrollment

**Test Case Description:** Verify optional face enrollment during scheduling

**Objective:** To verify that optional face enrollment during visit scheduling successfully captures, compresses, encrypts, and stores face data for future verification.

**Preconditions:**
- Schedule modal is accessible
- Face enrollment option is available
- Camera access is available
- AI face detection service (YOLOv8 or BlazeFace) is available
- Image compression and encryption functions are implemented

**Actions:**
- Step 1: Open Schedule modal and fill in visit details
- Step 2: Verify "Optional Face Enrollment" checkbox or option is available
- Step 3: Enable face enrollment option
- Step 4: Face capture interface opens
- Step 5: Position face in camera frame
- Step 6: Face is automatically captured
- Step 7: Verify face image is compressed
- Step 8: Verify face image is encrypted
- Step 9: Submit schedule request
- Step 10: Verify face data is stored in database
- Step 11: Verify enrolled face can be used for verification

**Expected Results:**
Schedule form ready for submission. Face enrollment option visible. Face capture interface appears when activated. Camera feed shows live face detection. AI service detects face. Face automatically captured. Image reduced to 100x100px. Image XOR-encrypted. Visit created with face data. Encrypted face saved. Face available for future verification.

**Actual Results:**
Face enrollment option appeared. Face capture interface activated. Face detected and captured. Image compressed and encrypted. Visit created with face data. Encrypted face saved in database. Face available for future verification.

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-049

**Test Case ID:** TC-FUN-049

**Module:** Weekly Visit Count Display

**Test Case Description:** Verify weekly visit count display on Home page

**Objective:** To ensure that the weekly visit count display on the Home page correctly shows remaining visit slots, active visits, and completed visits for the current week.

**Preconditions:**
- Visitor user is authenticated
- Home page is accessible
- Weekly visit count widget is implemented
- Visitor has some visits scheduled (current week)
- Week calculation uses Monday-Sunday boundaries

**Actions:**
- Step 1: Sign in as a visitor user
- Step 2: Navigate to Home page
- Step 3: Verify weekly visit count section is displayed
- Step 4: Verify remaining visit slots are displayed
- Step 5: Verify active visits count is displayed
- Step 6: Verify completed visits count is displayed
- Step 7: Verify counts are calculated for current week (Monday-Sunday)
- Step 8: Schedule a new visit
- Step 9: Verify remaining slots count decreases
- Step 10: Verify counts update in real time

**Expected Results:**
Visitor authenticated. Home page loads with personalized content. Weekly visit count widget visible. Remaining slots shown (e.g., "1 visit remaining"). Active visits count displayed. Completed visits count shown. Week calculation correct (Monday-Sunday). New visit created when scheduled. Remaining slots decrease. Display refreshes automatically.

**Actual Results:**
Weekly visit count section displayed. Remaining slots shown correctly. Active visits count displayed. Completed visits count displayed. Week calculation correct (Monday-Sunday). Counts updated when new visit scheduled. Display refreshed automatically.

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-050

**Test Case ID:** TC-FUN-050

**Module:** FAQ Section

**Test Case Description:** Verify FAQ section displays and functions correctly

**Objective:** To validate that the FAQ section on the Home page displays expandable questions and answers with smooth animations.

**Preconditions:**
- Home page is accessible
- FAQ section is implemented
- FAQ content is populated
- Expand/collapse animation system is configured

**Actions:**
- Step 1: Navigate to Home page
- Step 2: Scroll to FAQ section
- Step 3: Verify FAQ questions are displayed
- Step 4: Click on a FAQ question
- Step 5: Verify answer is displayed with smooth animation
- Step 6: Verify expanded question shows collapse indicator
- Step 7: Click on expanded question again
- Step 8: Verify collapse animation is smooth
- Step 9: Verify multiple questions can be expanded simultaneously
- Step 10: Verify FAQ content is relevant and helpful

**Expected Results:**
Home page loads successfully. FAQ section visible. Questions displayed with expand/collapse indicators. Clicking question expands answer with smooth animation. Icon changes to indicate expanded state. Clicking again collapses with smooth transition. Multiple questions expandable simultaneously. Content relevant and helpful.

**Actual Results:**
FAQ section displayed correctly. Questions listed. Expand/collapse functionality worked. Smooth animations applied. Multiple questions expandable simultaneously. Content relevant and informative.

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-051

**Test Case ID:** TC-FUN-051

**Module:** Personnel Availability

**Test Case Description:** Verify personnel can set single-day unavailability

**Objective:** To confirm that personnel can set single-day unavailability and that this prevents scheduling for their assigned places on that specific date.

**Preconditions:**
- Personnel user is authenticated
- Personnel is assigned to at least one place
- Assignment tab is accessible
- Unavailability management system is implemented
- Schedule modal can be tested

**Actions:**
- Step 1: Sign in as a personnel user
- Step 2: Navigate to Dashboard and Assignment tab
- Step 3: Click on "Set Unavailability" or similar button
- Step 4: Select a specific date for unavailability
- Step 5: Confirm unavailability setting
- Step 6: Verify unavailability is recorded in database
- Step 7: Attempt to schedule a visit for assigned place on unavailable date
- Step 8: Verify date is blocked or shows unavailability message
- Step 9: Verify scheduling is blocked for that date
- Step 10: Select a different available date
- Step 11: Verify scheduling works for available dates

**Expected Results:**
Personnel authenticated. Assignment interface shows assigned places. "Set Unavailability" button available. Unavailability calendar opens. Date selected and saved. Entry created in unavailability table. Schedule modal opens normally. Date selection prevented or warning shown. Scheduling blocked for unavailable date. Available dates selectable. Scheduling works for available dates.

**Actual Results:**
Unavailability calendar opened. Date selected and saved. Entry created in database. Date selection blocked for unavailable dates. Warning message shown. Scheduling prevented for unavailable dates. Available dates selectable. Scheduling worked for available dates.

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-052

**Test Case ID:** TC-FUN-052

**Module:** Place Purpose Management

**Test Case Description:** Verify admin can create and edit place purposes with advance notice rules

**Objective:** To verify that admins can create and edit place purposes with advance notice requirements (0-6 days) and that these rules are enforced during scheduling.

**Preconditions:**
- Admin user is authenticated
- Places management interface is accessible
- At least one place exists
- Purpose management functionality is available
- Schedule modal can be tested for enforcement

**Actions:**
- Step 1: Sign in as admin and navigate to Places tab
- Step 2: Select a place to manage
- Step 3: Click "Add Purpose" or "Manage Purposes" button
- Step 4: Enter purpose name and description
- Step 5: Set advance notice requirement (0-6 days)
- Step 6: Save purpose configuration
- Step 7: Verify purpose appears in place purposes list
- Step 8: Edit an existing purpose
- Step 9: Modify advance notice requirement
- Step 10: Save changes
- Step 11: Attempt to schedule visit with this purpose
- Step 12: Verify advance notice rule is enforced
- Step 13: Verify scheduling blocks dates that don't meet requirement

**Expected Results:**
Places management interface displayed. Place details shown when selected. "Add Purpose" opens purpose management. Purpose name and description entered. Advance notice set (0-6 days). Purpose created and saved. Purpose appears in list. Edit modal opens with current details. Advance notice modifiable. Purpose updated when saved. Schedule modal opens. Date picker enforces minimum date based on advance notice. Invalid dates not selectable.

**Actual Results:**
Purpose management interface opened. Purpose created with advance notice requirement. Purpose displayed in list. Purpose edited successfully. Advance notice rule enforced during scheduling. Date picker blocked invalid dates. Valid dates selectable.

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-053

**Test Case ID:** TC-FUN-053

**Module:** User Role Management

**Test Case Description:** Verify admin can change user roles

**Objective:** To validate that admins can change user roles (e.g., visitor to personnel) and that role changes are reflected immediately in navigation and dashboard access.

**Preconditions:**
- Admin user is authenticated
- Accounts management interface is accessible
- At least one user account exists (other than admin)
- Role change functionality is implemented
- Audit logging system is configured

**Actions:**
- Step 1: Sign in as admin and navigate to Accounts tab
- Step 2: Locate a user in the accounts list
- Step 3: Click "Edit Role" or "Change Role" button
- Step 4: Select a new role (e.g., change visitor to personnel)
- Step 5: Confirm role change
- Step 6: Verify role change is saved
- Step 7: Sign in as the user whose role was changed
- Step 8: Verify navigation links update based on new role
- Step 9: Verify dashboard access matches new role
- Step 10: Verify role change is logged in audit trail

**Expected Results:**
Accounts management interface shows user list. User details shown (name, email, role). "Edit Role" opens role change interface. New role selected from available roles. Role updated in database. user_roles table updated. User authenticated after role change. Navigation bar reflects new role. Dashboard shows appropriate tabs. Role change logged in audit trail.

**Actual Results:**
Role change interface opened. New role selected and saved. User role updated in database. Navigation updated based on new role. Dashboard tabs matched new role. Role change logged in audit trail.

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-054

**Test Case ID:** TC-FUN-054

**Module:** Gate Management

**Test Case Description:** Verify admin can manage gates and gate status changes are logged

**Objective:** To ensure that admins can create, edit, and change gate status (active/inactive) and that gate changes are logged in the audit trail.

**Preconditions:**
- Admin user is authenticated
- Gates management interface is accessible
- Gate management functionality is implemented
- Audit logging system is configured
- Guard Dashboard can test gate availability

**Actions:**
- Step 1: Sign in as admin and navigate to Gates tab
- Step 2: Click "Add New Gate" button
- Step 3: Enter gate name, location, and description
- Step 4: Set initial gate status (active/inactive)
- Step 5: Save gate creation
- Step 6: Verify gate appears in gates list
- Step 7: Click edit on an existing gate
- Step 8: Modify gate information
- Step 9: Change gate status from active to inactive
- Step 10: Save gate changes
- Step 11: Verify gate status change is logged
- Step 12: Verify inactive gates are not available for scanning

**Expected Results:**
Gates management interface shows gate list. "Add New Gate" opens creation modal. Gate details entered (name, location, description). Initial status selected (active/inactive). Gate created and saved. Gate appears in list. Edit modal opens with current details. Gate information modifiable. Status changeable. Gate updated when saved. All changes logged. Inactive gates not selectable in guard dashboard.

**Actual Results:**
Gate creation modal opened. Gate created and saved. Gate displayed in list. Gate edited successfully. Status changed. Gate updated. Changes logged in audit trail. Inactive gates not selectable in guard dashboard.

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-055

**Test Case ID:** TC-FUN-055

**Module:** Place Deletion

**Test Case Description:** Verify place deletion is logged and visit data is handled

**Objective:** To verify that place deletion by admins is logged and that associated visit data is handled appropriately.

**Preconditions:**
- Admin user is authenticated
- Places management interface is accessible
- At least one place exists with associated visits
- Audit logging system is configured
- Visit data preservation/archiving system is implemented

**Actions:**
- Step 1: Sign in as admin and navigate to Places tab
- Step 2: Locate a place with associated visits
- Step 3: Click delete on the place
- Step 4: Verify warning about associated data appears
- Step 5: Confirm place deletion
- Step 6: Verify deletion is logged in audit trail
- Step 7: Verify associated visit data is handled (archived or preserved)
- Step 8: Verify place is removed from places list
- Step 9: Verify place is removed from scheduling options
- Step 10: Verify historical visit data remains accessible

**Expected Results:**
Places management interface displayed. Place with associated visits located. Delete opens confirmation modal. Warning message displayed about associated data. Place deleted from database on confirmation. Delete action logged in audit trail. Visit records preserved or archived. Place removed from places list. Place removed from scheduling dropdown. Historical visit data remains accessible.

**Actual Results:**
Delete confirmation modal opened. Warning message displayed. Place deleted successfully. Delete action logged. Visit records preserved. Place removed from list and scheduling options. Historical data remained accessible.

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-056

**Test Case ID:** TC-FUN-056

**Module:** Notification System

**Test Case Description:** Verify pending feedback notification modal appears for visitors

**Objective:** To confirm that pending feedback notification modals appear for visitors when they have completed visits without submitted feedback.

**Preconditions:**
- A visit has been completed (status is 'completed')
- No feedback has been submitted for the visit
- Visitor user account exists and can be authenticated
- Notification system is configured
- Dashboard or Home page is accessible

**Actions:**
- Step 1: Complete a visit (status becomes 'completed')
- Step 2: Verify feedback has not been submitted
- Step 3: Sign in as the visitor who completed the visit
- Step 4: Navigate to Dashboard or Home page
- Step 5: Verify pending feedback notification modal appears
- Step 6: Verify modal displays visit information
- Step 7: Verify "Provide Feedback" button is available
- Step 8: Click "Provide Feedback" button
- Step 9: Verify modal can be dismissed
- Step 10: Verify modal reappears on next login if feedback not submitted
- Step 11: Submit feedback for the visit
- Step 12: Verify notification modal no longer appears

**Expected Results:**
Visit completed, no feedback yet. Visitor authenticated. Dashboard/Home page loads. Pending feedback modal appears automatically. Modal displays visit information. "Provide Feedback" button visible. Button opens feedback survey. Modal dismissible. Modal reappears if feedback not submitted. Feedback saved when submitted. Modal no longer appears after feedback.

**Actual Results:**
Pending feedback notification modal appeared automatically. Visit details displayed in modal. Feedback button visible. Modal dismissible. Modal reappeared when feedback not submitted. Feedback submitted successfully. Modal no longer appeared after feedback submission.

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-057

**Test Case ID:** TC-FUN-057

**Module:** Notification System

**Test Case Description:** Verify pending reschedule notification modal appears for personnel

**Objective:** To validate that pending reschedule notification modals appear for personnel when they have pending reschedule requests for their assigned places.

**Preconditions:**
- A reschedule request exists with status 'pending_reschedule'
- Personnel user is assigned to the visit's place
- Personnel user account exists and can be authenticated
- Notification system is configured
- Dashboard or Home page is accessible

**Actions:**
- Step 1: Visitor requests a reschedule for a visit
- Step 2: Verify personnel is assigned to the visit's place
- Step 3: Sign in as the assigned personnel user
- Step 4: Navigate to Dashboard or Home page
- Step 5: Verify pending reschedule notification modal appears
- Step 6: Verify modal displays reschedule request information
- Step 7: Verify "View Requests" or "Process Request" button is available
- Step 8: Click action button
- Step 9: Verify modal can be dismissed
- Step 10: Verify modal reappears on next login if request not processed
- Step 11: Process the reschedule request (approve or decline)
- Step 12: Verify notification modal no longer appears for processed request

**Expected Results:**
Reschedule request created with 'pending_reschedule'. Personnel assigned confirmed. Personnel authenticated. Dashboard/Home page loads. Pending reschedule modal appears automatically. Modal displays request information. "View Requests" or "Process Request" button available. Button opens Requests tab. Modal dismissible. Modal reappears if request not processed. Request status updated when processed. Modal no longer appears after processing.

**Actual Results:**
Pending reschedule notification modal appeared automatically. Request details displayed. Action button visible. Modal dismissible. Modal reappeared when request not processed. Request processed successfully. Modal no longer appeared after processing.

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-058

**Test Case ID:** TC-FUN-058

**Module:** Face Data Modal

**Test Case Description:** Verify Face Data modal displays decrypted face images and similarity scores

**Objective:** To ensure that the Face Data modal can decrypt and display stored face images with verification similarity scores for authorized users.

**Preconditions:**
- Entrance and exit gate scans have been completed for a visit
- Face images are stored in gate_scans table (encrypted)
- Visit details are accessible
- Authorized user (guard or admin) is authenticated
- Face Data modal is accessible
- Decryption functionality is implemented

**Actions:**
- Step 1: Complete entrance and exit gate scans for a visit
- Step 2: Navigate to visit details or gate scan details
- Step 3: Click "View Face Data" or similar button
- Step 4: Verify entrance face image is displayed
- Step 5: Verify exit face image is displayed
- Step 6: Verify face images are decrypted correctly
- Step 7: Verify similarity score is displayed
- Step 8: Verify verification status is indicated
- Step 9: Verify face data is only accessible to authorized users
- Step 10: Verify modal can be closed

**Expected Results:**
Face images stored encrypted in gate_scans table. Visit details displayed. "View Face Data" opens modal. Entrance face displayed after decryption. Exit face displayed after decryption. Images clear and recognizable. Similarity score displayed as percentage (e.g., "85%"). Verification status indicated (verified/flagged). Access restricted to authorized users (guards, admins). Modal closes when dismissed.

**Actual Results:**
Face Data modal opened. Entrance and exit face images displayed correctly. Images decrypted and clear. Similarity percentage shown. Verification status indicated. Access control enforced. Modal closed properly.

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-059

**Test Case ID:** TC-FUN-059

**Module:** Session Management

**Test Case Description:** Verify session management maintains user sessions across navigation

**Objective:** To verify that session management automatically refreshes tokens and maintains user sessions across page navigations.

**Preconditions:**
- User account exists
- Authentication system is configured
- Session management is implemented
- Token refresh mechanism is active
- Multiple pages are accessible (Home, Dashboard, About)

**Actions:**
- Step 1: Sign in as any user
- Step 2: Verify session token is stored
- Step 3: Navigate to different pages (Home, Dashboard, About)
- Step 4: Verify user remains authenticated across navigation
- Step 5: Verify session token is automatically refreshed
- Step 6: Wait for token expiration time
- Step 7: Verify automatic token refresh occurs
- Step 8: Verify user session continues without interruption
- Step 9: Verify session persists after page refresh
- Step 10: Sign out and verify session is cleared

**Expected Results:**
User authenticated, session established. Token saved in storage/cookies. Pages load successfully. Session maintained across navigation. Token auto-refreshed before expiration. New token issued seamlessly. No re-authentication required. Session persists after page refresh. Token removed on sign out. Session ends, authentication required.

**Actual Results:**
Session established successfully. Token stored. Session maintained across navigation. Token refreshed automatically. No re-authentication required. Session persisted after page refresh. Session cleared on sign out.

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-060

**Test Case ID:** TC-FUN-060

**Module:** Visit Status Auto-Fix

**Test Case Description:** Verify system automatically transitions past-due visits to appropriate status

**Objective:** To validate that the system automatically transitions past-due visits from `pending` to `unsuccessful` and from `in_progress` to `completed_flagged` when appropriate.

**Preconditions:**
- Visits exist with past dates (pending) or past exit times (in_progress)
- Background job or cron system is configured
- Auto-fix process is implemented
- Audit logging system is configured
- Notification system is available

**Actions:**
- Step 1: Create a visit with status 'pending' and past date
- Step 2: Verify system background job or cron runs
- Step 3: Verify past-due pending visit status changes to 'unsuccessful'
- Step 4: Create a visit with status 'in_progress' and past exit time
- Step 5: Verify system detects past-due in-progress visit
- Step 6: Verify past-due in-progress visit status changes to 'completed_flagged'
- Step 7: Verify status transitions are logged
- Step 8: Verify visitors are notified of status changes
- Step 9: Verify dashboard reflects updated statuses
- Step 10: Verify auto-fix runs on schedule (daily or hourly)

**Expected Results:**
Visit created with past date. Background job checks visit statuses. Past-due pending visits updated to 'unsuccessful'. Past-due in-progress visits identified as overdue. Status updated to 'completed_flagged'. Status transitions logged. Visitors notified of changes. Dashboard reflects updated statuses. Auto-fix runs on schedule (daily/hourly).

**Actual Results:**
Status check process executed. Past-due pending visits updated to unsuccessful. Past-due in-progress visits updated to completed_flagged. Status changes logged. Notifications sent. Dashboard reflected updated statuses. Auto-fix ran on schedule.

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-061

**Test Case ID:** TC-FUN-061

**Module:** Place on Hold

**Test Case Description:** Verify Place on Hold functionality prevents new scheduling

**Objective:** To confirm that the Place on Hold functionality allows personnel to place their assigned places on hold, preventing new visit scheduling while allowing existing in-progress visits to continue.

**Preconditions:**
- Personnel user is authenticated
- Personnel is assigned to at least one place
- Assignment tab is accessible
- Place on Hold functionality is implemented
- At least one in-progress visit exists for the place (optional)
- Audit logging system is configured

**Actions:**
- Step 1: Sign in as a personnel user
- Step 2: Navigate to Dashboard and Assignment tab
- Step 3: Locate an assigned place
- Step 4: Click "Place on Hold" button
- Step 5: Select hold duration or end date
- Step 6: Enter reason for hold (if required)
- Step 7: Confirm place on hold
- Step 8: Verify place status changes to 'on_hold'
- Step 9: Attempt to schedule a new visit for the place
- Step 10: Verify place is not available for selection or shows hold status
- Step 11: Verify existing in-progress visits can continue
- Step 12: Verify hold action is logged

**Expected Results:**
Personnel authenticated. Assignment interface shows assigned places. "Place on Hold" opens modal. Hold duration/end date selected. Reason entered if required. Place hold activated. Status updated to 'on_hold'. Schedule modal opens normally. Place blocked or shows hold message. In-progress visits unaffected. Hold action logged.

**Actual Results:**
Place on Hold modal opened. Hold duration selected. Reason entered. Place hold activated. Status updated to on_hold. Place blocked from scheduling. Hold message displayed. In-progress visits unaffected. Hold action logged.

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-062

**Test Case ID:** TC-FUN-062

**Module:** Place on Hold

**Test Case Description:** Verify scheduling interface displays hold status and blocks creation

**Objective:** To verify that when a place is on hold, the scheduling interface correctly displays the hold status and blocks new schedule creation for that place.

**Preconditions:**
- A place has been placed on hold (status is 'on_hold')
- Schedule modal is accessible
- Hold status display system is implemented
- At least one other place exists that is not on hold
- Place hold removal functionality is available

**Actions:**
- Step 1: Place a place on hold
- Step 2: Navigate to Home page and open Schedule modal
- Step 3: Verify place dropdown shows hold status
- Step 4: Attempt to select the place on hold
- Step 5: Verify hold message or tooltip appears
- Step 6: Verify hold end date is displayed (if available)
- Step 7: Verify other available places can still be selected
- Step 8: Verify schedule creation is blocked for held place
- Step 9: Verify hold status is visible in place list on Dashboard
- Step 10: Remove hold from place
- Step 11: Verify place becomes available for scheduling again

**Expected Results:**
Place status 'on_hold' in database. Schedule modal opens normally. Place marked as "On Hold" in dropdown. Place selection blocked/disabled. Hold message/tooltip appears. Expiration date displayed if available. Other places selectable. Submit button disabled for held place. Hold indicator visible in dashboards. Hold removed, status 'active'. Place available for scheduling again.

**Actual Results:**
Place marked as "On Hold" in dropdown. Place selection blocked. Hold message displayed. Expiration date shown. Other places selectable. Submit button disabled for held place. Hold indicator visible in dashboards. Hold removed successfully. Place available for scheduling again.

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-063

**Test Case ID:** TC-FUN-063

**Module:** Place on Hold

**Test Case Description:** Verify place on hold expiration is managed automatically

**Objective:** To ensure that place on hold expiration is properly managed and that places automatically become available again after the hold period ends.

**Preconditions:**
- A place has been placed on hold with a specific expiration date/time
- Hold expiration timestamp is stored in database
- Background job or cron system is configured to check expiration
- Expiration check process is implemented
- Audit logging system is configured
- Notification system is available (if configured)

**Actions:**
- Step 1: Place a place on hold with specific end date/time
- Step 2: Verify hold expiration is stored in database
- Step 3: Verify system background job checks hold expiration
- Step 4: Wait for hold expiration time to pass
- Step 5: Verify system detects expired hold
- Step 6: Verify place status automatically changes from 'on_hold' to 'active'
- Step 7: Verify place becomes available for scheduling
- Step 8: Verify expiration action is logged
- Step 9: Verify personnel are notified of hold expiration (if configured)
- Step 10: Verify place shows as available in all interfaces

**Expected Results:**
Place hold activated with expiration timestamp. Timestamp saved in database. Background job checks expiration periodically. Expired hold detected. Place status changes to 'active'. Place available for scheduling. Expiration action logged. Personnel notified if configured. Place appears active in all interfaces.

**Actual Results:**
Hold expiration timestamp saved. Expiration check process ran. Expired hold detected. Place status updated to active. Place available for scheduling. Expiration logged. Notification sent. Place appeared as active in all views.

**Status:** Passed

**Severity:**

**Priority:**