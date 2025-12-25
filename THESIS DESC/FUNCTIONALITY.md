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

**Actions:**
- Step 1: Navigate to the application URL
- Step 2: Verify hero text displays "Welcome to GuestGo" for non-authenticated users
- Step 3: Verify feature cards (Smart Scheduling, Secure Verification, Real-time Tracking) are visible
- Step 4: Verify navigation links (Home, About, Contact Us, Track Schedule) are visible

**Expected Results:**
- Step 1: The home page loads and displays the GuestGo logo, navigation bar, and hero section
- Step 2: Hero text shows default welcome message
- Step 3: Three feature cards are displayed with icons and descriptions
- Step 4: All public navigation links are displayed in the navigation bar

**Actual Results:**
- Step 1: The home page loads and displays the GuestGo logo, navigation bar, and hero section
- Step 2: Hero text shows default welcome message
- Step 3: Three feature cards are displayed with icons and descriptions
- Step 4: All public navigation links are displayed in the navigation bar

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-002

**Test Case ID:** TC-FUN-002

**Module:** Authentication & Access Control

**Test Case Description:** Create a new user account through the sign-up process

**Objective:** To verify that a new user can successfully sign up with email and password, receive confirmation feedback, and be assigned a default role.

**Actions:**
- Step 1: Click on the Sign Up button or link in the navigation
- Step 2: Enter first name, last name, email, and password in the form fields
- Step 3: Click the Sign Up button
- Step 4: Verify success message or confirmation appears
- Step 5: Check user role assignment in database

**Expected Results:**
- Step 1: Sign Up modal opens with registration form
- Step 2: Form fields accept input and display entered values
- Step 3: System processes registration and creates account
- Step 4: Success notification appears confirming account creation
- Step 5: User is assigned default 'visitor' role in user_roles table

**Actual Results:**
- Step 1: Sign Up modal opens with registration form
- Step 2: Form fields accept input and display entered values
- Step 3: System processes registration and creates account
- Step 4: Success notification appears confirming account creation
- Step 5: User is assigned default 'visitor' role in user_roles table

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-003

**Test Case ID:** TC-FUN-003

**Module:** Authentication & Access Control

**Test Case Description:** Sign in with existing user credentials

**Objective:** To verify that an existing user can sign in with valid credentials, establish a session, and see role-based navigation updates.

**Actions:**
- Step 1: Click on the Sign In button or link in the navigation
- Step 2: Enter valid email and password
- Step 3: Click the Sign In button
- Step 4: Verify session is established
- Step 5: Verify navigation bar updates based on user role
- Step 6: Verify welcome message displays user's first name

**Expected Results:**
- Step 1: Sign In modal opens with email and password fields
- Step 2: Form accepts credentials
- Step 3: System authenticates user and establishes session
- Step 4: User is logged in and redirected to home page
- Step 5: Role-specific links (Dashboard, Guard Dashboard, QR Scanner) appear based on user role
- Step 6: Welcome message shows personalized greeting

**Actual Results:**
- Step 1: Sign In modal opens with email and password fields
- Step 2: Form accepts credentials
- Step 3: System authenticates user and establishes session
- Step 4: User is logged in and redirected to home page
- Step 5: Role-specific links (Dashboard, Guard Dashboard, QR Scanner) appear based on user role
- Step 6: Welcome message shows personalized greeting

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-004

**Test Case ID:** TC-FUN-004

**Module:** Authentication & Access Control

**Test Case Description:** Reset password using the Forgot Password functionality

**Objective:** To confirm that the "Forgot Password" flow sends a reset link and allows the user to set a new password and log in.

**Actions:**
- Step 1: Click on the Sign In button
- Step 2: Click on the "Forgot Password" link
- Step 3: Enter registered email address
- Step 4: Click "Send Reset Link" button
- Step 5: Verify confirmation message appears
- Step 6: Check email inbox for reset link
- Step 7: Click reset link and set new password
- Step 8: Log in with new password

**Expected Results:**
- Step 1: Sign In modal opens
- Step 2: Password reset form appears with email input field
- Step 3: Email field accepts input
- Step 4: System sends password reset email via Supabase
- Step 5: Success message confirms reset link has been sent
- Step 6: Password reset email is received with reset link
- Step 7: Password reset page opens and allows new password entry
- Step 8: User can successfully sign in with new password

**Actual Results:**
- Step 1: Sign In modal opens
- Step 2: Password reset form appears with email input field
- Step 3: Email field accepts input
- Step 4: System sends password reset email via Supabase
- Step 5: Success message confirms reset link has been sent
- Step 6: Password reset email is received with reset link
- Step 7: Password reset page opens and allows new password entry
- Step 8: User can successfully sign in with new password

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-005

**Test Case ID:** TC-FUN-005

**Module:** Navigation & Role-Based Access

**Test Case Description:** Verify navigation bar updates dynamically based on user role

**Objective:** To validate that the navigation bar updates dynamically based on user role (admin, log, personnel, guard, visitor, guest), showing only permitted links.

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
- Step 1: Admin user is authenticated
- Step 2: Dashboard link is visible; Guard Dashboard and QR Scanner links are hidden
- Step 3: Guard user is authenticated
- Step 4: Dashboard and Guard Dashboard links are visible; QR Scanner link is hidden; Track Schedule link is hidden
- Step 5: Personnel user is authenticated
- Step 6: Dashboard and QR Scanner links are visible; Guard Dashboard link is hidden; Track Schedule link is hidden
- Step 7: Visitor user is authenticated
- Step 8: Dashboard and Track Schedule links are visible; Guard Dashboard and QR Scanner links are hidden

**Actual Results:**
- Step 1: Admin user is authenticated
- Step 2: Dashboard link is visible; Guard Dashboard and QR Scanner links are hidden
- Step 3: Guard user is authenticated
- Step 4: Dashboard and Guard Dashboard links are visible; QR Scanner link is hidden; Track Schedule link is hidden
- Step 5: Personnel user is authenticated
- Step 6: Dashboard and QR Scanner links are visible; Guard Dashboard link is hidden; Track Schedule link is hidden
- Step 7: Visitor user is authenticated
- Step 8: Dashboard and Track Schedule links are visible; Guard Dashboard and QR Scanner links are hidden

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-006

**Test Case ID:** TC-FUN-006

**Module:** Scheduling System

**Test Case Description:** Open Schedule modal and submit a visit request as a guest

**Objective:** To ensure a guest can open the Schedule modal from the Home page, fill in required visit details, and submit a schedule request.

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
- Step 1: Home page loads with Schedule Now button visible
- Step 2: Schedule modal opens with visit registration form
- Step 3: Form fields accept input
- Step 4: Place dropdown shows available places
- Step 5: Purpose dropdown shows purposes for selected place
- Step 6: Date picker allows date selection
- Step 7: System validates form and processes schedule request
- Step 8: Visit confirmation modal displays with visit details

**Actual Results:**
- Step 1: Home page loads with Schedule Now button visible
- Step 2: Schedule modal opens with visit registration form
- Step 3: Form fields accept input
- Step 4: Place dropdown shows available places
- Step 5: Purpose dropdown shows purposes for selected place
- Step 6: Date picker allows date selection
- Step 7: System validates form and processes schedule request
- Step 8: Visit confirmation modal displays with visit details

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-007

**Test Case ID:** TC-FUN-007

**Module:** Scheduling System

**Test Case Description:** Complete Gmail OTP email verification for guest scheduling

**Objective:** To verify that Gmail OTP email verification is required and successfully completes before a guest schedule is accepted.

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
- Step 1: Email field accepts Gmail address
- Step 2: System sends OTP code via EmailJS to the provided Gmail address
- Step 3: Verification code input field and Verify button become visible
- Step 4: OTP code is received in email
- Step 5: Code field accepts input
- Step 6: System validates OTP code
- Step 7: Verification status shows success message
- Step 8: Email field is disabled and cannot be edited

**Actual Results:**
- Step 1: Email field accepts Gmail address
- Step 2: System sends OTP code via EmailJS to the provided Gmail address
- Step 3: Verification code input field and Verify button become visible
- Step 4: OTP code is received in email
- Step 5: Code field accepts input
- Step 6: System validates OTP code
- Step 7: Verification status shows success message
- Step 8: Email field is disabled and cannot be edited

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-008

**Test Case ID:** TC-FUN-008

**Module:** Scheduling System

**Test Case Description:** Attempt to schedule more than two visits per week and verify limit enforcement

**Objective:** To validate that the system enforces the maximum of two visits per week per visitor account and blocks additional requests with an appropriate message.

**Actions:**
- Step 1: Sign in as a visitor user with existing visits
- Step 2: Verify weekly visit count shows 2 visits already scheduled for current week
- Step 3: Navigate to Home page and click "Schedule Now" button
- Step 4: Fill in visit details and attempt to submit
- Step 5: Verify tooltip or message indicates visit limit reached
- Step 6: Try to schedule with a different account that has less than 2 visits

**Expected Results:**
- Step 1: Visitor dashboard shows current week visit count
- Step 2: Weekly visit status displays "No visits remaining"
- Step 3: Schedule modal opens
- Step 4: Schedule Submit button is disabled
- Step 5: Error message or tooltip explains weekly visit limit
- Step 6: Schedule request is allowed for account under limit

**Actual Results:**
- Step 1: Visitor dashboard shows current week visit count
- Step 2: Weekly visit status displays "No visits remaining"
- Step 3: Schedule modal opens
- Step 4: Schedule Submit button is disabled
- Step 5: Error message or tooltip explains weekly visit limit
- Step 6: Schedule request is allowed for account under limit

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-009

**Test Case ID:** TC-FUN-009

**Module:** Scheduling System

**Test Case Description:** Verify advance notice rules are enforced when selecting visit dates

**Objective:** To verify that place-specific advance notice rules (0–6 days) are correctly enforced when selecting visit dates.

**Actions:**
- Step 1: Open Schedule modal and select a place with 3-day advance notice requirement
- Step 2: Select a purpose that requires 3 days advance notice
- Step 3: Verify minimum date in date picker
- Step 4: Attempt to select a date less than 3 days from today
- Step 5: Select a date that meets the 3-day requirement
- Step 6: Select a different place with 0-day advance notice

**Expected Results:**
- Step 1: Place is selected and purpose dropdown becomes enabled
- Step 2: Purpose is selected and date field becomes enabled
- Step 3: Date picker shows minimum date as today + 3 days
- Step 4: Date selection is blocked or shows error message
- Step 5: Date is accepted and can be selected
- Step 6: Date picker allows selection of today's date

**Actual Results:**
- Step 1: Place is selected and purpose dropdown becomes enabled
- Step 2: Purpose is selected and date field becomes enabled
- Step 3: Date picker shows minimum date as today + 3 days
- Step 4: Date selection is blocked or shows error message
- Step 5: Date is accepted and can be selected
- Step 6: Date picker allows selection of today's date

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-010

**Test Case ID:** TC-FUN-010

**Module:** Scheduling System

**Test Case Description:** Schedule a visit to multiple places in a single request

**Objective:** To confirm that multi-place scheduling is allowed only when at least two eligible places are available and correctly stored.

**Actions:**
- Step 1: Open Schedule modal and verify at least two places are available
- Step 2: Select "Multiple Places" option if available
- Step 3: Select at least two places from the available list
- Step 4: Select purpose for each selected place
- Step 5: Select a visit date that meets all advance notice requirements
- Step 6: Submit the schedule request
- Step 7: Verify visit is created with multiple places

**Expected Results:**
- Step 1: Place dropdown shows multiple available places
- Step 2: Multiple places selection interface appears
- Step 3: Selected places are checked and displayed
- Step 4: Purpose dropdown appears for each place
- Step 5: Date is selected and validated for all places
- Step 6: System processes multi-place visit schedule
- Step 7: Visit record shows all selected places in visit_places table

**Actual Results:**
- Step 1: Place dropdown shows multiple available places
- Step 2: Multiple places selection interface appears
- Step 3: Selected places are checked and displayed
- Step 4: Purpose dropdown appears for each place
- Step 5: Date is selected and validated for all places
- Step 6: System processes multi-place visit schedule
- Step 7: Visit record shows all selected places in visit_places table

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-011

**Test Case ID:** TC-FUN-011

**Module:** QR Code Services

**Test Case Description:** Verify QR code generation and email embedding for scheduled visits

**Objective:** To verify that a unique QR code is generated for each approved visit and embedded in the confirmation email.

**Actions:**
- Step 1: Complete visit scheduling process and confirm visit
- Step 2: Verify QR code is generated for the visit
- Step 3: Check confirmation email sent to visitor
- Step 4: Verify QR code is embedded in the email
- Step 5: Verify QR code contains unique visit ID
- Step 6: Schedule another visit and verify different QR code

**Expected Results:**
- Step 1: Visit is created with status 'pending'
- Step 2: QR code image is generated with visit ID encoded
- Step 3: Email is received via Brevo service
- Step 4: Email contains embedded QR code image
- Step 5: QR code decodes to the correct visit ID when scanned
- Step 6: New visit has a different QR code with different visit ID

**Actual Results:**
- Step 1: Visit is created with status 'pending'
- Step 2: QR code image is generated with visit ID encoded
- Step 3: Email is received via Brevo service
- Step 4: Email contains embedded QR code image
- Step 5: QR code decodes to the correct visit ID when scanned
- Step 6: New visit has a different QR code with different visit ID

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-012

**Test Case ID:** TC-FUN-012

**Module:** QR Code Services

**Test Case Description:** Generate and verify printable visit card with QR code

**Objective:** To ensure that the printable visit card contains a valid QR code and essential visit details for gate use.

**Actions:**
- Step 1: Navigate to Track Schedule page and enter a valid visit ID
- Step 2: Click "Print Visit Card" button
- Step 3: Verify QR code is displayed on the card
- Step 4: Verify visit details are displayed (name, date, places, visit ID)
- Step 5: Verify card is formatted for printing
- Step 6: Test QR code scanning from printed card

**Expected Results:**
- Step 1: Visit details are loaded and displayed
- Step 2: Printable visit card modal or print preview opens
- Step 3: QR code image is visible and scannable
- Step 4: All essential visit information is shown on the card
- Step 5: Card layout is print-friendly with proper sizing
- Step 6: QR code can be scanned and decoded correctly

**Actual Results:**
- Step 1: Visit details are loaded and displayed
- Step 2: Printable visit card modal or print preview opens
- Step 3: QR code image is visible and scannable
- Step 4: All essential visit information is shown on the card
- Step 5: Card layout is print-friendly with proper sizing
- Step 6: QR code can be scanned and decoded correctly

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-013

**Test Case ID:** TC-FUN-013

**Module:** QR Scanner

**Test Case Description:** Scan visit QR code on QR Scanner page as personnel

**Objective:** To validate that the QR Scanner page allows personnel to scan a visit QR and view corresponding visit information without modifying status.

**Actions:**
- Step 1: Sign in as a personnel user
- Step 2: Navigate to QR Scanner page via navigation link
- Step 3: Click "Start Scanner" button
- Step 4: Point camera at a valid visit QR code
- Step 5: Verify visit information is displayed
- Step 6: Verify no status modification buttons are available
- Step 7: Verify visit status remains unchanged

**Expected Results:**
- Step 1: Personnel user is authenticated
- Step 2: QR Scanner page loads with camera interface
- Step 3: Camera feed activates and scanning begins
- Step 4: QR code is detected and decoded
- Step 5: Visit details (name, date, places, status) are shown
- Step 6: Only view actions are available, no gate processing buttons
- Step 7: Visit status stays as 'pending' or current status

**Actual Results:**
- Step 1: Personnel user is authenticated
- Step 2: QR Scanner page loads with camera interface
- Step 3: Camera feed activates and scanning begins
- Step 4: QR code is detected and decoded
- Step 5: Visit details (name, date, places, status) are shown
- Step 6: Only view actions are available, no gate processing buttons
- Step 7: Visit status stays as 'pending' or current status

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-014

**Test Case ID:** TC-FUN-014

**Module:** QR Scanner & Guard Dashboard

**Test Case Description:** Use manual visit ID entry when camera is unavailable

**Objective:** To verify that manual visit ID entry works as a fallback when camera access is unavailable, both on the QR Scanner and Guard Dashboard pages.

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
- Step 1: QR Scanner page loads
- Step 2: Manual input field appears
- Step 3: Visit ID is accepted
- Step 4: System retrieves visit information
- Step 5: Visit information is shown correctly
- Step 6: Guard Dashboard loads
- Step 7: Manual entry field is available
- Step 8: Visit is found and details are displayed

**Actual Results:**
- Step 1: QR Scanner page loads
- Step 2: Manual input field appears
- Step 3: Visit ID is accepted
- Step 4: System retrieves visit information
- Step 5: Visit information is shown correctly
- Step 6: Guard Dashboard loads
- Step 7: Manual entry field is available
- Step 8: Visit is found and details are displayed

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-015

**Test Case ID:** TC-FUN-015

**Module:** Gate Processing

**Test Case Description:** Process entrance gate scan with face capture

**Objective:** To ensure that a guard can scan a valid visit QR at the entrance gate, capture a face image, and transition the visit status from `pending` to `in_progress`.

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
- Step 1: Guard user is authenticated
- Step 2: Guard Dashboard loads with scanner interface
- Step 3: QR code is detected and visit details are displayed
- Step 4: Gate selection is recorded
- Step 5: Face capture interface appears with live camera feed
- Step 6: Face is detected by AI service
- Step 7: Face image is captured, compressed, and encrypted
- Step 8: Entrance RPC is called with face data
- Step 9: Visit status is updated in database
- Step 10: Gate scan entry is created in gate_scans table

**Actual Results:**
- Step 1: Guard user is authenticated
- Step 2: Guard Dashboard loads with scanner interface
- Step 3: QR code is detected and visit details are displayed
- Step 4: Gate selection is recorded
- Step 5: Face capture interface appears with live camera feed
- Step 6: Face is detected by AI service
- Step 7: Face image is captured, compressed, and encrypted
- Step 8: Entrance RPC is called with face data
- Step 9: Visit status is updated in database
- Step 10: Gate scan entry is created in gate_scans table

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-016

**Test Case ID:** TC-FUN-016

**Module:** Gate Processing

**Test Case Description:** Process temporary exit and re-entry workflow

**Objective:** To verify that temporary exit processing changes visit status from `in_progress` to `temporary_exit` and back to `in_progress` on re-entry.

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
- Step 1: Visit status becomes 'in_progress'
- Step 2: Visit details are displayed
- Step 3: Temporary exit option is selected
- Step 4: Face is captured and processed
- Step 5: Temporary exit RPC is called
- Step 6: Status is updated to 'temporary_exit'
- Step 7: Visit details are displayed with temporary_exit status
- Step 8: Entrance option is selected
- Step 9: Re-entry RPC is called
- Step 10: Status is restored to 'in_progress'

**Actual Results:**
- Step 1: Visit status becomes 'in_progress'
- Step 2: Visit details are displayed
- Step 3: Temporary exit option is selected
- Step 4: Face is captured and processed
- Step 5: Temporary exit RPC is called
- Step 6: Status is updated to 'temporary_exit'
- Step 7: Visit details are displayed with temporary_exit status
- Step 8: Entrance option is selected
- Step 9: Re-entry RPC is called
- Step 10: Status is restored to 'in_progress'

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-017

**Test Case ID:** TC-FUN-017

**Module:** Gate Processing & Face Verification

**Test Case Description:** Process exit gate scan with face verification

**Objective:** To confirm that exit processing requires a new face capture, compares it to the entrance face, and transitions status to `completed` or `completed_flagged` as appropriate.

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
- Step 1: Visit status is 'in_progress' with entrance face stored
- Step 2: Place completion status is checked
- Step 3: Visit details are displayed
- Step 4: Exit option is selected
- Step 5: Face capture interface appears
- Step 6: Exit face is captured, compressed, and encrypted
- Step 7: Entrance face is loaded for comparison
- Step 8: Similarity score is calculated
- Step 9: Similarity percentage is shown (e.g., 0.85)
- Step 10: Exit RPC is called and visit status changes to 'completed'
- Step 11: Visit status is 'completed' in database

**Actual Results:**
- Step 1: Visit status is 'in_progress' with entrance face stored
- Step 2: Place completion status is checked
- Step 3: Visit details are displayed
- Step 4: Exit option is selected
- Step 5: Face capture interface appears
- Step 6: Exit face is captured, compressed, and encrypted
- Step 7: Entrance face is loaded for comparison
- Step 8: Similarity score is calculated
- Step 9: Similarity percentage is shown (e.g., 0.85)
- Step 10: Exit RPC is called and visit status changes to 'completed'
- Step 11: Visit status is 'completed' in database

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-018

**Test Case ID:** TC-FUN-018

**Module:** Flagged Visits & Alerts

**Test Case Description:** Verify flagged visit alert modal appears for guards

**Objective:** To validate that flagged visits trigger a visible alert modal for guards and require explicit override or denial.

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
- Step 1: Flag is set on the visit record
- Step 2: Visit details are displayed
- Step 3: Alert modal shows flag warning and reason
- Step 4: Flag details and context are shown
- Step 5: Override and Deny buttons are visible
- Step 6: Override action is logged and visit processing continues
- Step 7: Override entry is created in logs table
- Step 8: Visit processing is blocked and denial is logged

**Actual Results:**
- Step 1: Flag is set on the visit record
- Step 2: Visit details are displayed
- Step 3: Alert modal shows flag warning and reason
- Step 4: Flag details and context are shown
- Step 5: Override and Deny buttons are visible
- Step 6: Override action is logged and visit processing continues
- Step 7: Override entry is created in logs table
- Step 8: Visit processing is blocked and denial is logged

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-019

**Test Case ID:** TC-FUN-019

**Module:** AI Face Detection

**Test Case Description:** Verify YOLOv8 face detection from live camera stream

**Objective:** To ensure the Python AI service can detect a face from the guard's live camera stream using YOLOv8 and return valid bounding box coordinates.

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
- Step 1: Face capture interface opens with camera feed
- Step 2: Service health check passes
- Step 3: Live video feed shows user's face
- Step 4: Frame is sent to /detect-face-base64 endpoint
- Step 5: Face detection occurs using YOLOv8
- Step 6: API returns normalized coordinates [x1, y1, x2, y2]
- Step 7: Confidence score (e.g., 0.95) is returned
- Step 8: Visual feedback shows detected face area

**Actual Results:**
- Step 1: Face capture interface opens with camera feed
- Step 2: Service health check passes
- Step 3: Live video feed shows user's face
- Step 4: Frame is sent to /detect-face-base64 endpoint
- Step 5: Face detection occurs using YOLOv8
- Step 6: API returns normalized coordinates [x1, y1, x2, y2]
- Step 7: Confidence score (e.g., 0.95) is returned
- Step 8: Visual feedback shows detected face area

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-020

**Test Case ID:** TC-FUN-020

**Module:** AI Face Detection

**Test Case Description:** Verify automatic fallback to BlazeFace when Python service is unavailable

**Objective:** To verify that when the Python AI service is unavailable, the system automatically falls back to client-side BlazeFace detection and still allows capture.

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
- Step 1: Service health check fails or times out
- Step 2: Face capture interface opens
- Step 3: UI shows "AI service unavailable - using browser fallback"
- Step 4: Live video feed shows user's face
- Step 5: BlazeFace model initializes in browser
- Step 6: Face detection occurs using BlazeFace
- Step 7: Bounding box coordinates are returned
- Step 8: Face can be captured and processed
- Step 9: System detects service availability and switches back

**Actual Results:**
- Step 1: Service health check fails or times out
- Step 2: Face capture interface opens
- Step 3: UI shows "AI service unavailable - using browser fallback"
- Step 4: Live video feed shows user's face
- Step 5: BlazeFace model initializes in browser
- Step 6: Face detection occurs using BlazeFace
- Step 7: Bounding box coordinates are returned
- Step 8: Face can be captured and processed
- Step 9: System detects service availability and switches back

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-021

**Test Case ID:** TC-FUN-021

**Module:** Face Image Processing & Storage

**Test Case Description:** Verify face image compression, encryption, and storage workflow

**Objective:** To confirm that captured face images are compressed, XOR-encrypted, stored in Supabase, and can be decrypted on demand in the Face Data modal.

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
- Step 1: Face is detected and cropped
- Step 2: Image size is reduced by 80-90%
- Step 3: Compressed JPEG is created
- Step 4: Image bytes are XOR-encrypted with key rotation
- Step 5: Encrypted base64 string is generated
- Step 6: Face image is saved in Supabase database
- Step 7: Face Data modal opens
- Step 8: Encrypted base64 is loaded
- Step 9: XOR decryption reverses encryption
- Step 10: Face image is visible in modal

**Actual Results:**
- Step 1: Face is detected and cropped
- Step 2: Image size is reduced by 80-90%
- Step 3: Compressed JPEG is created
- Step 4: Image bytes are XOR-encrypted with key rotation
- Step 5: Encrypted base64 string is generated
- Step 6: Face image is saved in Supabase database
- Step 7: Face Data modal opens
- Step 8: Encrypted base64 is loaded
- Step 9: XOR decryption reverses encryption
- Step 10: Face image is visible in modal

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-022

**Test Case ID:** TC-FUN-022

**Module:** Face Verification

**Test Case Description:** Verify face verification similarity calculation

**Objective:** To validate that the face verification endpoint computes a similarity score between entrance and exit images and flags low-similarity cases for review.

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
- Step 1: Entrance face is stored in gate_scans table
- Step 2: Exit face is captured
- Step 3: Verification request is sent to Python service
- Step 4: Feature vectors are generated (100x100 grayscale)
- Step 5: Lighting normalization is applied
- Step 6: Correlation is computed between feature vectors
- Step 7: Similarity score is calculated (e.g., 0.87)
- Step 8: Match is confirmed (similarity >= 0.75)
- Step 9: Similarity percentage is shown to user
- Step 10: System flags for review or requires override

**Actual Results:**
- Step 1: Entrance face is stored in gate_scans table
- Step 2: Exit face is captured
- Step 3: Verification request is sent to Python service
- Step 4: Feature vectors are generated (100x100 grayscale)
- Step 5: Lighting normalization is applied
- Step 6: Correlation is computed between feature vectors
- Step 7: Similarity score is calculated (e.g., 0.87)
- Step 8: Match is confirmed (similarity >= 0.75)
- Step 9: Similarity percentage is shown to user
- Step 10: System flags for review or requires override

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-023

**Test Case ID:** TC-FUN-023

**Module:** AI Status Monitoring

**Test Case Description:** Verify AI Status dashboard displays service health and metrics

**Objective:** To ensure the AI Status dashboard correctly reflects the health and latency of the Python AI microservice and fallback state.

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
- Step 1: User is authenticated
- Step 2: AI Status tab content is displayed
- Step 3: Service status (available/unavailable) is displayed
- Step 4: Average latency metrics are shown
- Step 5: BlazeFace fallback state is shown when applicable
- Step 6: Accuracy percentages are displayed
- Step 7: Status shows "Available" with latency
- Step 8: Status shows "Unavailable" and fallback active

**Actual Results:**
- Step 1: User is authenticated
- Step 2: AI Status tab content is displayed
- Step 3: Service status (available/unavailable) is displayed
- Step 4: Average latency metrics are shown
- Step 5: BlazeFace fallback state is shown when applicable
- Step 6: Accuracy percentages are displayed
- Step 7: Status shows "Available" with latency
- Step 8: Status shows "Unavailable" and fallback active

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-024

**Test Case ID:** TC-FUN-024

**Module:** Admin Dashboard

**Test Case Description:** Verify admin dashboard displays all administrative tabs

**Objective:** To verify that an admin can access the Dashboard with Places, Accounts, Gates, Feedback, and AI Status tabs visible.

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
- Step 1: Admin user is authenticated
- Step 2: Dashboard loads
- Step 3: Places tab appears in admin tabs section
- Step 4: Accounts tab appears in admin tabs section
- Step 5: Gates tab appears in admin tabs section
- Step 6: Feedback tab appears in admin tabs section
- Step 7: AI Status tab appears in admin tabs section
- Step 8: Tab content is displayed when clicked

**Actual Results:**
- Step 1: Admin user is authenticated
- Step 2: Dashboard loads
- Step 3: Places tab appears in admin tabs section
- Step 4: Accounts tab appears in admin tabs section
- Step 5: Gates tab appears in admin tabs section
- Step 6: Feedback tab appears in admin tabs section
- Step 7: AI Status tab appears in admin tabs section
- Step 8: Tab content is displayed when clicked

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-025

**Test Case ID:** TC-FUN-025

**Module:** Place Management

**Test Case Description:** Create, edit, and delete places as admin

**Objective:** To confirm that an admin can create, edit, and delete places, and see changes reflected in scheduling options on the Home and Dashboard pages.

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
- Step 1: Places management interface is displayed
- Step 2: Place creation modal opens
- Step 3: Form fields accept input
- Step 4: New place is created and saved
- Step 5: New place is visible in the list
- Step 6: Place is available for selection
- Step 7: Edit modal opens with place details
- Step 8: Place details are updated
- Step 9: Updated information is displayed
- Step 10: Delete confirmation appears
- Step 11: Place is deleted and removed from list
- Step 12: Delete action is recorded in logs

**Actual Results:**
- Step 1: Places management interface is displayed
- Step 2: Place creation modal opens
- Step 3: Form fields accept input
- Step 4: New place is created and saved
- Step 5: New place is visible in the list
- Step 6: Place is available for selection
- Step 7: Edit modal opens with place details
- Step 8: Place details are updated
- Step 9: Updated information is displayed
- Step 10: Delete confirmation appears
- Step 11: Place is deleted and removed from list
- Step 12: Delete action is recorded in logs

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-026

**Test Case ID:** TC-FUN-026

**Module:** Place & Personnel Management

**Test Case Description:** Assign personnel to places and configure visit limits and purposes

**Objective:** To validate that an admin can assign personnel to places and configure visit limits and purposes per place.

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
- Step 1: Places list is displayed
- Step 2: Place details panel opens
- Step 3: Personnel assignment interface appears
- Step 4: Personnel is selected
- Step 5: Personnel is assigned to the place
- Step 6: Assigned personnel is listed
- Step 7: Visit limit configuration modal opens
- Step 8: Limit type is selected
- Step 9: Limit value is set
- Step 10: Limit is saved and enforced
- Step 11: Purpose management interface opens
- Step 12: Purpose is configured with required days (0-6)
- Step 13: Purpose is available when place is selected

**Actual Results:**
- Step 1: Places list is displayed
- Step 2: Place details panel opens
- Step 3: Personnel assignment interface appears
- Step 4: Personnel is selected
- Step 5: Personnel is assigned to the place
- Step 6: Assigned personnel is listed
- Step 7: Visit limit configuration modal opens
- Step 8: Limit type is selected
- Step 9: Limit value is set
- Step 10: Limit is saved and enforced
- Step 11: Purpose management interface opens
- Step 12: Purpose is configured with required days (0-6)
- Step 13: Purpose is available when place is selected

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-027

**Test Case ID:** TC-FUN-027

**Module:** Log Dashboard

**Test Case Description:** Verify log-role user can access logs-only dashboard

**Objective:** To ensure that a log-role user can open the Dashboard and view only the Logs tab and content.

**Actions:**
- Step 1: Sign in as a log-role user
- Step 2: Navigate to Dashboard page
- Step 3: Verify only Logs tab is visible
- Step 4: Verify Logs tab is active and content is displayed
- Step 5: Verify log entries are displayed in list
- Step 6: Verify pagination controls are available
- Step 7: Verify other dashboard sections are hidden

**Expected Results:**
- Step 1: Log user is authenticated
- Step 2: Dashboard loads
- Step 3: Other admin tabs (Places, Accounts, Gates, Feedback, AI Status) are hidden
- Step 4: Logs content is visible with audit entries
- Step 5: Audit log entries are shown with details
- Step 6: Page navigation controls are visible
- Step 7: Visitor content and admin content are hidden

**Actual Results:**
- Step 1: Log user is authenticated
- Step 2: Dashboard loads
- Step 3: Other admin tabs (Places, Accounts, Gates, Feedback, AI Status) are hidden
- Step 4: Logs content is visible with audit entries
- Step 5: Audit log entries are shown with details
- Step 6: Page navigation controls are visible
- Step 7: Visitor content and admin content are hidden

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-028

**Test Case ID:** TC-FUN-028

**Module:** Audit Logging

**Test Case Description:** Verify log filtering functionality

**Objective:** To verify that log filters (category, action type, date range, search) correctly narrow down audit entries.

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
- Step 1: Logs interface is displayed
- Step 2: Category filter is applied
- Step 3: Log list shows only gate actions
- Step 4: Action type filter is applied
- Step 5: Only entrance scan logs are shown
- Step 6: Date range is selected
- Step 7: Only logs within date range are displayed
- Step 8: Search query is entered
- Step 9: Matching log entries are shown
- Step 10: All filters are reset
- Step 11: Complete log list is shown

**Actual Results:**
- Step 1: Logs interface is displayed
- Step 2: Category filter is applied
- Step 3: Log list shows only gate actions
- Step 4: Action type filter is applied
- Step 5: Only entrance scan logs are shown
- Step 6: Date range is selected
- Step 7: Only logs within date range are displayed
- Step 8: Search query is entered
- Step 9: Matching log entries are shown
- Step 10: All filters are reset
- Step 11: Complete log list is shown

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-029

**Test Case ID:** TC-FUN-029

**Module:** Personnel Dashboard

**Test Case Description:** Verify personnel dashboard displays correct tabs and filtered visits

**Objective:** To confirm that a personnel user sees Assignment, Visits, Requests, and Finished tabs and can view only visits for their assigned places.

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
- Step 1: Personnel user is authenticated
- Step 2: Dashboard loads
- Step 3: Assignment tab appears
- Step 4: Visits tab appears
- Step 5: Requests tab appears
- Step 6: Finished tab appears
- Step 7: Assigned places are displayed
- Step 8: Only assigned places appear in list
- Step 9: In-progress visits are displayed
- Step 10: Visits are filtered by assigned places
- Step 11: Pending reschedule requests are displayed
- Step 12: Requests are filtered by assigned places

**Actual Results:**
- Step 1: Personnel user is authenticated
- Step 2: Dashboard loads
- Step 3: Assignment tab appears
- Step 4: Visits tab appears
- Step 5: Requests tab appears
- Step 6: Finished tab appears
- Step 7: Assigned places are displayed
- Step 8: Only assigned places appear in list
- Step 9: In-progress visits are displayed
- Step 10: Visits are filtered by assigned places
- Step 11: Pending reschedule requests are displayed
- Step 12: Requests are filtered by assigned places

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-030

**Test Case ID:** TC-FUN-030

**Module:** Visit Reschedule System

**Test Case Description:** Process visitor reschedule requests as personnel

**Objective:** To validate that personnel can approve or decline visitor reschedule requests and that resulting schedule changes are enforced by the system.

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
- Step 1: Reschedule request is created
- Step 2: Personnel user is authenticated
- Step 3: Pending reschedule requests are displayed
- Step 4: Request details are shown
- Step 5: Action modal opens
- Step 6: New date is selected
- Step 7: Date validation passes
- Step 8: Reschedule decision is processed
- Step 9: Visit date changes to new date
- Step 10: Action is recorded in audit logs
- Step 11: Notification or email is sent

**Actual Results:**
- Step 1: Reschedule request is created
- Step 2: Personnel user is authenticated
- Step 3: Pending reschedule requests are displayed
- Step 4: Request details are shown
- Step 5: Action modal opens
- Step 6: New date is selected
- Step 7: Date validation passes
- Step 8: Reschedule decision is processed
- Step 9: Visit date changes to new date
- Step 10: Action is recorded in audit logs
- Step 11: Notification or email is sent

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-031

**Test Case ID:** TC-FUN-031

**Module:** Guard Dashboard

**Test Case Description:** Verify guard dashboard access and navigation

**Objective:** To ensure that a guard user sees the Guard Dashboard and AI Status tabs and can access the dedicated Guard Dashboard page.

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
- Step 1: Guard user is authenticated
- Step 2: Dashboard loads
- Step 3: Guard Dashboard tab appears
- Step 4: AI Status tab appears
- Step 5: Places, Accounts, Gates, Feedback tabs are hidden
- Step 6: Guard dashboard content is displayed
- Step 7: Dedicated Guard Dashboard page loads
- Step 8: QR scanner and gate processing interface is visible
- Step 9: Manual input field is available

**Actual Results:**
- Step 1: Guard user is authenticated
- Step 2: Dashboard loads
- Step 3: Guard Dashboard tab appears
- Step 4: AI Status tab appears
- Step 5: Places, Accounts, Gates, Feedback tabs are hidden
- Step 6: Guard dashboard content is displayed
- Step 7: Dedicated Guard Dashboard page loads
- Step 8: QR scanner and gate processing interface is visible
- Step 9: Manual input field is available

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-032

**Test Case ID:** TC-FUN-032

**Module:** Guard Dashboard

**Test Case Description:** Verify real-time scan telemetry updates

**Objective:** To verify that guard dashboard metrics (scan rate, interval, status text) update in real time during scanning.

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
- Step 1: Guard Dashboard loads
- Step 2: Scanner activates and camera feed starts
- Step 3: FPS counter appears (e.g., "Scan Rate: 15 FPS")
- Step 4: Interval counter appears (e.g., "Interval: 100ms")
- Step 5: Status messages change (e.g., "Position QR code", "Detecting", "Success")
- Step 6: QR code is detected
- Step 7: FPS and interval values change dynamically
- Step 8: Status updates to reflect scan state
- Step 9: Scanner stops and metrics reset

**Actual Results:**
- Step 1: Guard Dashboard loads
- Step 2: Scanner activates and camera feed starts
- Step 3: FPS counter appears (e.g., "Scan Rate: 15 FPS")
- Step 4: Interval counter appears (e.g., "Interval: 100ms")
- Step 5: Status messages change (e.g., "Position QR code", "Detecting", "Success")
- Step 6: QR code is detected
- Step 7: FPS and interval values change dynamically
- Step 8: Status updates to reflect scan state
- Step 9: Scanner stops and metrics reset

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-033

**Test Case ID:** TC-FUN-033

**Module:** Visitor Dashboard

**Test Case Description:** Verify visitor dashboard displays current and past visits with filtering

**Objective:** To confirm that a visitor user can open their Dashboard and view Current (Today/Future) and Past visits with correct filtering and counts.

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
- Step 1: Visitor user is authenticated
- Step 2: Dashboard loads
- Step 3: Current Visits tab appears
- Step 4: Past Visits tab appears
- Step 5: Today and future visits are displayed
- Step 6: Count shows number of current visits
- Step 7: Only today's and future visits are shown
- Step 8: Past/completed visits are displayed
- Step 9: Count shows number of past visits
- Step 10: Only past visits are shown
- Step 11: Visit information is shown for each visit

**Actual Results:**
- Step 1: Visitor user is authenticated
- Step 2: Dashboard loads
- Step 3: Current Visits tab appears
- Step 4: Past Visits tab appears
- Step 5: Today and future visits are displayed
- Step 6: Count shows number of current visits
- Step 7: Only today's and future visits are shown
- Step 8: Past/completed visits are displayed
- Step 9: Count shows number of past visits
- Step 10: Only past visits are shown
- Step 11: Visit information is shown for each visit

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-034

**Test Case ID:** TC-FUN-034

**Module:** Visit Reschedule System

**Test Case Description:** Request visit reschedule from visitor dashboard

**Objective:** To validate that visitors can request a reschedule for eligible visits directly from their Dashboard and see status updates.

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
- Step 1: Visitor user is authenticated
- Step 2: Current visits list is displayed
- Step 3: Eligible visit is found
- Step 4: Reschedule request modal opens
- Step 5: New date is selected
- Step 6: Reason field accepts input
- Step 7: Reschedule request is submitted
- Step 8: Confirmation message is displayed
- Step 9: Visit status is updated
- Step 10: Request is visible to assigned personnel
- Step 11: Updated status is reflected

**Actual Results:**
- Step 1: Visitor user is authenticated
- Step 2: Current visits list is displayed
- Step 3: Eligible visit is found
- Step 4: Reschedule request modal opens
- Step 5: New date is selected
- Step 6: Reason field accepts input
- Step 7: Reschedule request is submitted
- Step 8: Confirmation message is displayed
- Step 9: Visit status is updated
- Step 10: Request is visible to assigned personnel
- Step 11: Updated status is reflected

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-035

**Test Case ID:** TC-FUN-035

**Module:** Track Schedule

**Test Case Description:** Track visit using visit ID on Track Schedule page

**Objective:** To verify that any visitor or guest can open the Track Schedule page, enter a valid visit ID, and see full visit details and progress.

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
- Step 1: Track Schedule page loads
- Step 2: Input field is displayed
- Step 3: Visit ID is accepted
- Step 4: System retrieves visit information
- Step 5: Visit information (name, date, places, status) is shown
- Step 6: Progress indicators show current status
- Step 7: List of places with completion status is shown
- Step 8: Entrance and exit scan status are shown
- Step 9: QR code image is visible
- Step 10: Print button is visible

**Actual Results:**
- Step 1: Track Schedule page loads
- Step 2: Input field is displayed
- Step 3: Visit ID is accepted
- Step 4: System retrieves visit information
- Step 5: Visit information (name, date, places, status) is shown
- Step 6: Progress indicators show current status
- Step 7: List of places with completion status is shown
- Step 8: Entrance and exit scan status are shown
- Step 9: QR code image is visible
- Step 10: Print button is visible

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-036

**Test Case ID:** TC-FUN-036

**Module:** Track Schedule

**Test Case Description:** Verify error handling for invalid visit ID

**Objective:** To ensure that entering an invalid or unknown visit ID shows an appropriate "no visit found" state.

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
- Step 1: Track Schedule page loads
- Step 2: Invalid ID is entered
- Step 3: System attempts to retrieve visit
- Step 4: Error message is displayed
- Step 5: "No Visit Found" component is displayed
- Step 6: Message explains visit was not found
- Step 7: Invalid format is entered
- Step 8: Format validation error is shown
- Step 9: Input field is cleared and ready for new entry

**Actual Results:**
- Step 1: Track Schedule page loads
- Step 2: Invalid ID is entered
- Step 3: System attempts to retrieve visit
- Step 4: Error message is displayed
- Step 5: "No Visit Found" component is displayed
- Step 6: Message explains visit was not found
- Step 7: Invalid format is entered
- Step 8: Format validation error is shown
- Step 9: Input field is cleared and ready for new entry

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-037

**Test Case ID:** TC-FUN-037

**Module:** Track Schedule

**Test Case Description:** Verify Track Schedule displays all visit information correctly

**Objective:** To confirm that Track Schedule correctly displays gate scan status (entrance/exit), places list, and visit QR for printing.

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
- Step 1: Track Schedule page loads
- Step 2: Visit details are loaded
- Step 3: Entrance scan status (scanned/not scanned) is shown
- Step 4: Exit scan status (scanned/not scanned) is shown
- Step 5: List of places with checkmarks or status is shown
- Step 6: Completed places are marked, pending places are shown
- Step 7: QR code image is visible and scannable
- Step 8: Print preview or modal opens
- Step 9: Card has all essential information
- Step 10: Progress visualization is displayed

**Actual Results:**
- Step 1: Track Schedule page loads
- Step 2: Visit details are loaded
- Step 3: Entrance scan status (scanned/not scanned) is shown
- Step 4: Exit scan status (scanned/not scanned) is shown
- Step 5: List of places with checkmarks or status is shown
- Step 6: Completed places are marked, pending places are shown
- Step 7: QR code image is visible and scannable
- Step 8: Print preview or modal opens
- Step 9: Card has all essential information
- Step 10: Progress visualization is displayed

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-038

**Test Case ID:** TC-FUN-038

**Module:** Feedback System

**Test Case Description:** Verify feedback survey is offered after visit completion

**Objective:** To validate that after a visit is completed, the system offers an ISO 25010 feedback survey for that visit.

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
- Step 1: Visit status changes to 'completed'
- Step 2: Visitor user is authenticated
- Step 3: Page loads
- Step 4: Feedback modal opens with ISO 25010 survey
- Step 5: Survey questions cover functional suitability, performance, usability, etc.
- Step 6: Visit details are shown in modal
- Step 7: Modal can be dismissed and accessed again
- Step 8: Past visits are displayed
- Step 9: Feedback button is visible on completed visits

**Actual Results:**
- Step 1: Visit status changes to 'completed'
- Step 2: Visitor user is authenticated
- Step 3: Page loads
- Step 4: Feedback modal opens with ISO 25010 survey
- Step 5: Survey questions cover functional suitability, performance, usability, etc.
- Step 6: Visit details are shown in modal
- Step 7: Modal can be dismissed and accessed again
- Step 8: Past visits are displayed
- Step 9: Feedback button is visible on completed visits

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-039

**Test Case ID:** TC-FUN-039

**Module:** Feedback System

**Test Case Description:** Verify only one feedback submission per visit is allowed

**Objective:** To ensure that only one feedback submission per visit is accepted and subsequent attempts are blocked.

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
- Step 1: Feedback modal opens
- Step 2: Survey form accepts responses
- Step 3: Feedback is submitted and saved
- Step 4: Confirmation message is displayed
- Step 5: Feedback entry is created in feedback table
- Step 6: Feedback modal opens or button is clicked
- Step 7: Submit button is disabled or error message appears
- Step 8: Message explains feedback was already provided
- Step 9: Button is not available for this visit
- Step 10: Status indicator shows feedback is complete

**Actual Results:**
- Step 1: Feedback modal opens
- Step 2: Survey form accepts responses
- Step 3: Feedback is submitted and saved
- Step 4: Confirmation message is displayed
- Step 5: Feedback entry is created in feedback table
- Step 6: Feedback modal opens or button is clicked
- Step 7: Submit button is disabled or error message appears
- Step 8: Message explains feedback was already provided
- Step 9: Button is not available for this visit
- Step 10: Status indicator shows feedback is complete

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-040

**Test Case ID:** TC-FUN-040

**Module:** Feedback Analytics

**Test Case Description:** Verify feedback responses appear in admin analytics dashboard

**Objective:** To confirm that feedback responses appear in the Feedback analytics dashboard for admins.

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
- Step 1: Feedback is saved to database
- Step 2: Admin user is authenticated
- Step 3: Feedback analytics dashboard loads
- Step 4: Submitted feedback responses are shown
- Step 5: Visit details are associated with feedback
- Step 6: Quality attribute scores are shown
- Step 7: Visualizations show feedback trends
- Step 8: Date filter works correctly
- Step 9: Additional filters work correctly
- Step 10: Average scores and trends are displayed

**Actual Results:**
- Step 1: Feedback is saved to database
- Step 2: Admin user is authenticated
- Step 3: Feedback analytics dashboard loads
- Step 4: Submitted feedback responses are shown
- Step 5: Visit details are associated with feedback
- Step 6: Quality attribute scores are shown
- Step 7: Visualizations show feedback trends
- Step 8: Date filter works correctly
- Step 9: Additional filters work correctly
- Step 10: Average scores and trends are displayed

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-041

**Test Case ID:** TC-FUN-041

**Module:** Email Notifications

**Test Case Description:** Verify visit confirmation email is sent with QR code

**Objective:** To verify that visit confirmation emails (with QR) are sent to visitors upon successful scheduling.

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
- Step 1: Visit is created and approved
- Step 2: Visit is in pending state
- Step 3: Confirmation email is received
- Step 4: Email is delivered successfully
- Step 5: Visit date, places, and purpose are included
- Step 6: QR code image is visible in email
- Step 7: QR code can be scanned and decoded
- Step 8: Visit ID is displayed in email
- Step 9: Instructions for gate use are included
- Step 10: Email address matches visitor's email

**Actual Results:**
- Step 1: Visit is created and approved
- Step 2: Visit is in pending state
- Step 3: Confirmation email is received
- Step 4: Email is delivered successfully
- Step 5: Visit date, places, and purpose are included
- Step 6: QR code image is visible in email
- Step 7: QR code can be scanned and decoded
- Step 8: Visit ID is displayed in email
- Step 9: Instructions for gate use are included
- Step 10: Email address matches visitor's email

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-042

**Test Case ID:** TC-FUN-042

**Module:** Email Notifications

**Test Case Description:** Verify visit completion email is sent with feedback link

**Objective:** To validate that visit completion emails with feedback links are sent when a visit transitions to `completed`.

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
- Step 1: Visit status changes to 'completed'
- Step 2: Email sending process is initiated
- Step 3: Completion email is received
- Step 4: Email is delivered successfully
- Step 5: Completion message is included
- Step 6: Feedback link is clickable and functional
- Step 7: System redirects to feedback survey
- Step 8: Survey is pre-populated with visit details
- Step 9: Visit details and places visited are shown
- Step 10: Email address matches visitor's email

**Actual Results:**
- Step 1: Visit status changes to 'completed'
- Step 2: Email sending process is initiated
- Step 3: Completion email is received
- Step 4: Email is delivered successfully
- Step 5: Completion message is included
- Step 6: Feedback link is clickable and functional
- Step 7: System redirects to feedback survey
- Step 8: Survey is pre-populated with visit details
- Step 9: Visit details and places visited are shown
- Step 10: Email address matches visitor's email

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-043

**Test Case ID:** TC-FUN-043

**Module:** Security & Access Control

**Test Case Description:** Verify unauthenticated users cannot access protected pages

**Objective:** To confirm that users without an authenticated session cannot access protected pages such as Dashboard, Guard Dashboard, and QR Scanner.

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
- Step 1: User is not authenticated
- Step 2: System redirects to home or sign-in page
- Step 3: Authentication required message is shown
- Step 4: System redirects to home or sign-in page
- Step 5: System redirects to home or sign-in page
- Step 6: Dashboard, Guard Dashboard, QR Scanner links are not visible
- Step 7: User is authenticated
- Step 8: Dashboard and other pages can be accessed

**Actual Results:**
- Step 1: User is not authenticated
- Step 2: System redirects to home or sign-in page
- Step 3: Authentication required message is shown
- Step 4: System redirects to home or sign-in page
- Step 5: System redirects to home or sign-in page
- Step 6: Dashboard, Guard Dashboard, QR Scanner links are not visible
- Step 7: User is authenticated
- Step 8: Dashboard and other pages can be accessed

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-044

**Test Case ID:** TC-FUN-044

**Module:** Role-Based Access Control

**Test Case Description:** Verify role-based restrictions prevent unauthorized access

**Objective:** To ensure that role-based restrictions prevent users from accessing dashboards or actions not permitted to their role (e.g., visitors cannot access admin tabs).

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
- Step 1: Visitor user is authenticated
- Step 2: Dashboard loads
- Step 3: Admin tabs are not visible
- Step 4: Visitor tabs are displayed
- Step 5: System blocks access or redirects
- Step 6: Guard user is authenticated
- Step 7: Guard Dashboard is accessible, admin tabs are hidden
- Step 8: Personnel user is authenticated
- Step 9: QR Scanner is accessible, Guard Dashboard is hidden
- Step 10: Actions match user's role permissions

**Actual Results:**
- Step 1: Visitor user is authenticated
- Step 2: Dashboard loads
- Step 3: Admin tabs are not visible
- Step 4: Visitor tabs are displayed
- Step 5: System blocks access or redirects
- Step 6: Guard user is authenticated
- Step 7: Guard Dashboard is accessible, admin tabs are hidden
- Step 8: Personnel user is authenticated
- Step 9: QR Scanner is accessible, Guard Dashboard is hidden
- Step 10: Actions match user's role permissions

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-045

**Test Case ID:** TC-FUN-045

**Module:** About Page

**Test Case Description:** Verify About page displays all company information correctly

**Objective:** To verify that the About page displays company information, mission and vision, team profiles, technology stack, culture, values, thesis timeline, and statistics correctly.

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
- Step 1: About page loads
- Step 2: Company details and background are shown
- Step 3: Mission and vision sections are visible
- Step 4: Team member profiles with photos and roles are shown
- Step 5: Tech stack list with icons/logos is shown
- Step 6: Culture information is displayed
- Step 7: Values list is displayed
- Step 8: Timeline with milestones is shown
- Step 9: Statistics or metrics are shown
- Step 10: All sections are accessible

**Actual Results:**
- Step 1: About page loads
- Step 2: Company details and background are shown
- Step 3: Mission and vision sections are visible
- Step 4: Team member profiles with photos and roles are shown
- Step 5: Tech stack list with icons/logos is shown
- Step 6: Culture information is displayed
- Step 7: Values list is displayed
- Step 8: Timeline with milestones is shown
- Step 9: Statistics or metrics are shown
- Step 10: All sections are accessible

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-046

**Test Case ID:** TC-FUN-046

**Module:** Contact Page

**Test Case Description:** Verify Contact page functionality and content

**Objective:** To validate that the Contact page allows users to submit contact forms via EmailJS, view business hours, location information, social media links, and see daily rotating public feedback testimonials.

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
- Step 1: Contact page loads
- Step 2: Form with name, email, message fields is shown
- Step 3: Form accepts input
- Step 4: Form is submitted via EmailJS
- Step 5: Confirmation message is displayed
- Step 6: Business hours information is shown
- Step 7: Address and map (if available) are shown
- Step 8: Social media icons/links are visible
- Step 9: Links open in new tabs
- Step 10: Testimonials section shows public feedback
- Step 11: Different testimonials appear each day

**Actual Results:**
- Step 1: Contact page loads
- Step 2: Form with name, email, message fields is shown
- Step 3: Form accepts input
- Step 4: Form is submitted via EmailJS
- Step 5: Confirmation message is displayed
- Step 6: Business hours information is shown
- Step 7: Address and map (if available) are shown
- Step 8: Social media icons/links are visible
- Step 9: Links open in new tabs
- Step 10: Testimonials section shows public feedback
- Step 11: Different testimonials appear each day

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-047

**Test Case ID:** TC-FUN-047

**Module:** Profile Settings

**Test Case Description:** Verify profile settings allow password and account updates

**Objective:** To confirm that authenticated users can access Profile Settings to change their password and update account information.

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
- Step 1: User is authenticated
- Step 2: Profile Settings modal or page opens
- Step 3: Name, email, role are shown
- Step 4: Password change form appears
- Step 5: Current password field accepts input
- Step 6: New password field accepts input
- Step 7: Confirm password field accepts input
- Step 8: Password is updated via Supabase
- Step 9: Confirmation message is displayed
- Step 10: Name or other fields can be edited
- Step 11: Changes are saved to database

**Actual Results:**
- Step 1: User is authenticated
- Step 2: Profile Settings modal or page opens
- Step 3: Name, email, role are shown
- Step 4: Password change form appears
- Step 5: Current password field accepts input
- Step 6: New password field accepts input
- Step 7: Confirm password field accepts input
- Step 8: Password is updated via Supabase
- Step 9: Confirmation message is displayed
- Step 10: Name or other fields can be edited
- Step 11: Changes are saved to database

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-048

**Test Case ID:** TC-FUN-048

**Module:** Face Enrollment

**Test Case Description:** Verify optional face enrollment during scheduling

**Objective:** To verify that optional face enrollment during visit scheduling successfully captures, compresses, encrypts, and stores face data for future verification.

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
- Step 1: Schedule form is completed
- Step 2: Face enrollment option is visible
- Step 3: Face enrollment is activated
- Step 4: Camera feed and face detection appear
- Step 5: Face is detected by AI
- Step 6: Face image is captured
- Step 7: Image is reduced to 100x100px
- Step 8: Image is XOR-encrypted
- Step 9: Visit is created with face data
- Step 10: Encrypted face is saved in visit or user table
- Step 11: Face is available for future gate scans

**Actual Results:**
- Step 1: Schedule form is completed
- Step 2: Face enrollment option is visible
- Step 3: Face enrollment is activated
- Step 4: Camera feed and face detection appear
- Step 5: Face is detected by AI
- Step 6: Face image is captured
- Step 7: Image is reduced to 100x100px
- Step 8: Image is XOR-encrypted
- Step 9: Visit is created with face data
- Step 10: Encrypted face is saved in visit or user table
- Step 11: Face is available for future gate scans

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-049

**Test Case ID:** TC-FUN-049

**Module:** Weekly Visit Count Display

**Test Case Description:** Verify weekly visit count display on Home page

**Objective:** To ensure that the weekly visit count display on the Home page correctly shows remaining visit slots, active visits, and completed visits for the current week.

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
- Step 1: Visitor user is authenticated
- Step 2: Home page loads
- Step 3: Visit count widget or section is visible
- Step 4: Count shows available slots (e.g., "1 visit remaining")
- Step 5: Number of in-progress visits is shown
- Step 6: Number of completed visits this week is shown
- Step 7: Week calculation is correct
- Step 8: Visit is created
- Step 9: Count updates to reflect new visit
- Step 10: Display refreshes when visits change

**Actual Results:**
- Step 1: Visitor user is authenticated
- Step 2: Home page loads
- Step 3: Visit count widget or section is visible
- Step 4: Count shows available slots (e.g., "1 visit remaining")
- Step 5: Number of in-progress visits is shown
- Step 6: Number of completed visits this week is shown
- Step 7: Week calculation is correct
- Step 8: Visit is created
- Step 9: Count updates to reflect new visit
- Step 10: Display refreshes when visits change

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-050

**Test Case ID:** TC-FUN-050

**Module:** FAQ Section

**Test Case Description:** Verify FAQ section displays and functions correctly

**Objective:** To validate that the FAQ section on the Home page displays expandable questions and answers with smooth animations.

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
- Step 1: Home page loads
- Step 2: FAQ section is visible
- Step 3: List of questions is shown
- Step 4: Question expands to show answer
- Step 5: Answer appears with transition effect
- Step 6: Expand/collapse icon changes
- Step 7: Question collapses and answer hides
- Step 8: Answer hides with transition effect
- Step 9: Multiple answers can be visible at once
- Step 10: Questions and answers are informative

**Actual Results:**
- Step 1: Home page loads
- Step 2: FAQ section is visible
- Step 3: List of questions is shown
- Step 4: Question expands to show answer
- Step 5: Answer appears with transition effect
- Step 6: Expand/collapse icon changes
- Step 7: Question collapses and answer hides
- Step 8: Answer hides with transition effect
- Step 9: Multiple answers can be visible at once
- Step 10: Questions and answers are informative

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-051

**Test Case ID:** TC-FUN-051

**Module:** Personnel Availability

**Test Case Description:** Verify personnel can set single-day unavailability

**Objective:** To confirm that personnel can set single-day unavailability and that this prevents scheduling for their assigned places on that specific date.

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
- Step 1: Personnel user is authenticated
- Step 2: Assignment interface is displayed
- Step 3: Unavailability calendar or date picker opens
- Step 4: Date is selected
- Step 5: Unavailability is saved
- Step 6: Entry is created in unavailability table
- Step 7: Schedule modal opens
- Step 8: Date selection is prevented or warning is shown
- Step 9: Visit cannot be scheduled
- Step 10: Date can be selected
- Step 11: Visit can be scheduled

**Actual Results:**
- Step 1: Personnel user is authenticated
- Step 2: Assignment interface is displayed
- Step 3: Unavailability calendar or date picker opens
- Step 4: Date is selected
- Step 5: Unavailability is saved
- Step 6: Entry is created in unavailability table
- Step 7: Schedule modal opens
- Step 8: Date selection is prevented or warning is shown
- Step 9: Visit cannot be scheduled
- Step 10: Date can be selected
- Step 11: Visit can be scheduled

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-052

**Test Case ID:** TC-FUN-052

**Module:** Place Purpose Management

**Test Case Description:** Verify admin can create and edit place purposes with advance notice rules

**Objective:** To verify that admins can create and edit place purposes with advance notice requirements (0-6 days) and that these rules are enforced during scheduling.

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
- Step 1: Places management interface is displayed
- Step 2: Place details are shown
- Step 3: Purpose management interface opens
- Step 4: Purpose details are entered
- Step 5: Advance notice days are selected
- Step 6: Purpose is created and saved
- Step 7: Purpose is displayed
- Step 8: Edit modal opens
- Step 9: Days are updated
- Step 10: Purpose is updated
- Step 11: Schedule modal opens
- Step 12: Date picker enforces minimum date based on notice
- Step 13: Invalid dates cannot be selected

**Actual Results:**
- Step 1: Places management interface is displayed
- Step 2: Place details are shown
- Step 3: Purpose management interface opens
- Step 4: Purpose details are entered
- Step 5: Advance notice days are selected
- Step 6: Purpose is created and saved
- Step 7: Purpose is displayed
- Step 8: Edit modal opens
- Step 9: Days are updated
- Step 10: Purpose is updated
- Step 11: Schedule modal opens
- Step 12: Date picker enforces minimum date based on notice
- Step 13: Invalid dates cannot be selected

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-053

**Test Case ID:** TC-FUN-053

**Module:** User Role Management

**Test Case Description:** Verify admin can change user roles

**Objective:** To validate that admins can change user roles (e.g., visitor to personnel) and that role changes are reflected immediately in navigation and dashboard access.

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
- Step 1: Accounts management interface is displayed
- Step 2: User details are shown
- Step 3: Role change interface opens
- Step 4: New role is selected
- Step 5: Role is updated in database
- Step 6: User's role is updated in user_roles table
- Step 7: User is authenticated
- Step 8: Navigation reflects new role permissions
- Step 9: Dashboard shows appropriate tabs for new role
- Step 10: Role change action is recorded in logs

**Actual Results:**
- Step 1: Accounts management interface is displayed
- Step 2: User details are shown
- Step 3: Role change interface opens
- Step 4: New role is selected
- Step 5: Role is updated in database
- Step 6: User's role is updated in user_roles table
- Step 7: User is authenticated
- Step 8: Navigation reflects new role permissions
- Step 9: Dashboard shows appropriate tabs for new role
- Step 10: Role change action is recorded in logs

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-054

**Test Case ID:** TC-FUN-054

**Module:** Gate Management

**Test Case Description:** Verify admin can manage gates and gate status changes are logged

**Objective:** To ensure that admins can create, edit, and change gate status (active/inactive) and that gate changes are logged in the audit trail.

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
- Step 1: Gates management interface is displayed
- Step 2: Gate creation modal opens
- Step 3: Gate details are entered
- Step 4: Status is selected
- Step 5: Gate is created and saved
- Step 6: Gate is displayed
- Step 7: Edit modal opens
- Step 8: Details are updated
- Step 9: Status is changed
- Step 10: Gate is updated
- Step 11: Action is recorded in audit logs
- Step 12: Inactive gates cannot be selected in guard dashboard

**Actual Results:**
- Step 1: Gates management interface is displayed
- Step 2: Gate creation modal opens
- Step 3: Gate details are entered
- Step 4: Status is selected
- Step 5: Gate is created and saved
- Step 6: Gate is displayed
- Step 7: Edit modal opens
- Step 8: Details are updated
- Step 9: Status is changed
- Step 10: Gate is updated
- Step 11: Action is recorded in audit logs
- Step 12: Inactive gates cannot be selected in guard dashboard

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-055

**Test Case ID:** TC-FUN-055

**Module:** Place Deletion

**Test Case Description:** Verify place deletion is logged and visit data is handled

**Objective:** To verify that place deletion by admins is logged and that associated visit data is handled appropriately.

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
- Step 1: Places management interface is displayed
- Step 2: Place with visit history is found
- Step 3: Delete confirmation modal opens
- Step 4: Warning message is displayed
- Step 5: Place is deleted
- Step 6: Delete action is recorded in logs
- Step 7: Visit records are preserved or archived
- Step 8: Place no longer appears
- Step 9: Place cannot be selected for new visits
- Step 10: Past visits still show place information

**Actual Results:**
- Step 1: Places management interface is displayed
- Step 2: Place with visit history is found
- Step 3: Delete confirmation modal opens
- Step 4: Warning message is displayed
- Step 5: Place is deleted
- Step 6: Delete action is recorded in logs
- Step 7: Visit records are preserved or archived
- Step 8: Place no longer appears
- Step 9: Place cannot be selected for new visits
- Step 10: Past visits still show place information

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-056

**Test Case ID:** TC-FUN-056

**Module:** Notification System

**Test Case Description:** Verify pending feedback notification modal appears for visitors

**Objective:** To confirm that pending feedback notification modals appear for visitors when they have completed visits without submitted feedback.

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
- Step 1: Visit is completed
- Step 2: No feedback entry exists for visit
- Step 3: Visitor user is authenticated
- Step 4: Page loads
- Step 5: Notification modal opens automatically
- Step 6: Visit details are shown in modal
- Step 7: Feedback button is visible
- Step 8: Feedback survey opens
- Step 9: Modal can be closed
- Step 10: Modal shows again when user returns
- Step 11: Feedback is submitted
- Step 12: Modal does not show for this visit

**Actual Results:**
- Step 1: Visit is completed
- Step 2: No feedback entry exists for visit
- Step 3: Visitor user is authenticated
- Step 4: Page loads
- Step 5: Notification modal opens automatically
- Step 6: Visit details are shown in modal
- Step 7: Feedback button is visible
- Step 8: Feedback survey opens
- Step 9: Modal can be closed
- Step 10: Modal shows again when user returns
- Step 11: Feedback is submitted
- Step 12: Modal does not show for this visit

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-057

**Test Case ID:** TC-FUN-057

**Module:** Notification System

**Test Case Description:** Verify pending reschedule notification modal appears for personnel

**Objective:** To validate that pending reschedule notification modals appear for personnel when they have pending reschedule requests for their assigned places.

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
- Step 1: Reschedule request is created
- Step 2: Personnel assignment is confirmed
- Step 3: Personnel user is authenticated
- Step 4: Page loads
- Step 5: Notification modal opens automatically
- Step 6: Request details are shown in modal
- Step 7: Action button is visible
- Step 8: Requests tab or processing interface opens
- Step 9: Modal can be closed
- Step 10: Modal shows again when user returns
- Step 11: Request is processed
- Step 12: Modal does not show for this request

**Actual Results:**
- Step 1: Reschedule request is created
- Step 2: Personnel assignment is confirmed
- Step 3: Personnel user is authenticated
- Step 4: Page loads
- Step 5: Notification modal opens automatically
- Step 6: Request details are shown in modal
- Step 7: Action button is visible
- Step 8: Requests tab or processing interface opens
- Step 9: Modal can be closed
- Step 10: Modal shows again when user returns
- Step 11: Request is processed
- Step 12: Modal does not show for this request

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-058

**Test Case ID:** TC-FUN-058

**Module:** Face Data Modal

**Test Case Description:** Verify Face Data modal displays decrypted face images and similarity scores

**Objective:** To ensure that the Face Data modal can decrypt and display stored face images with verification similarity scores for authorized users.

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
- Step 1: Face images are stored in gate_scans table
- Step 2: Visit information is displayed
- Step 3: Face Data modal opens
- Step 4: Entrance face image is visible
- Step 5: Exit face image is visible
- Step 6: Images are clear and recognizable
- Step 7: Similarity percentage is shown (e.g., "85%")
- Step 8: Match status (verified/flagged) is shown
- Step 9: Access control is enforced
- Step 10: Modal closes when dismissed

**Actual Results:**
- Step 1: Face images are stored in gate_scans table
- Step 2: Visit information is displayed
- Step 3: Face Data modal opens
- Step 4: Entrance face image is visible
- Step 5: Exit face image is visible
- Step 6: Images are clear and recognizable
- Step 7: Similarity percentage is shown (e.g., "85%")
- Step 8: Match status (verified/flagged) is shown
- Step 9: Access control is enforced
- Step 10: Modal closes when dismissed

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-059

**Test Case ID:** TC-FUN-059

**Module:** Session Management

**Test Case Description:** Verify session management maintains user sessions across navigation

**Objective:** To verify that session management automatically refreshes tokens and maintains user sessions across page navigations.

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
- Step 1: User is authenticated and session is established
- Step 2: Token is saved in session storage
- Step 3: Pages load successfully
- Step 4: Session is maintained
- Step 5: Token refresh occurs before expiration
- Step 6: Token approaches expiration
- Step 7: New token is issued and stored
- Step 8: No re-authentication required
- Step 9: User remains logged in after refresh
- Step 10: Token is removed and session ends

**Actual Results:**
- Step 1: User is authenticated and session is established
- Step 2: Token is saved in session storage
- Step 3: Pages load successfully
- Step 4: Session is maintained
- Step 5: Token refresh occurs before expiration
- Step 6: Token approaches expiration
- Step 7: New token is issued and stored
- Step 8: No re-authentication required
- Step 9: User remains logged in after refresh
- Step 10: Token is removed and session ends

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-060

**Test Case ID:** TC-FUN-060

**Module:** Visit Status Auto-Fix

**Test Case Description:** Verify system automatically transitions past-due visits to appropriate status

**Objective:** To validate that the system automatically transitions past-due visits from `pending` to `unsuccessful` and from `in_progress` to `completed_flagged` when appropriate.

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
- Step 1: Visit with past scheduled date is created
- Step 2: Status check process executes
- Step 3: Visit status is updated to 'unsuccessful'
- Step 4: Visit with past exit time is created
- Step 5: Status check identifies overdue visit
- Step 6: Visit status is updated to 'completed_flagged'
- Step 7: Status change actions are recorded in logs
- Step 8: Notifications or emails are sent
- Step 9: Visit lists show correct statuses
- Step 10: Process executes regularly

**Actual Results:**
- Step 1: Visit with past scheduled date is created
- Step 2: Status check process executes
- Step 3: Visit status is updated to 'unsuccessful'
- Step 4: Visit with past exit time is created
- Step 5: Status check identifies overdue visit
- Step 6: Visit status is updated to 'completed_flagged'
- Step 7: Status change actions are recorded in logs
- Step 8: Notifications or emails are sent
- Step 9: Visit lists show correct statuses
- Step 10: Process executes regularly

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-061

**Test Case ID:** TC-FUN-061

**Module:** Place on Hold

**Test Case Description:** Verify Place on Hold functionality prevents new scheduling

**Objective:** To confirm that the Place on Hold functionality allows personnel to place their assigned places on hold, preventing new visit scheduling while allowing existing in-progress visits to continue.

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
- Step 1: Personnel user is authenticated
- Step 2: Assignment interface is displayed
- Step 3: Assigned place is found
- Step 4: Place on Hold modal opens
- Step 5: Hold period is selected
- Step 6: Reason is entered
- Step 7: Place hold is activated
- Step 8: Place status is updated in database
- Step 9: Schedule modal opens
- Step 10: Place is blocked or shows hold message
- Step 11: In-progress visits are not affected
- Step 12: Hold action is recorded in audit logs

**Actual Results:**
- Step 1: Personnel user is authenticated
- Step 2: Assignment interface is displayed
- Step 3: Assigned place is found
- Step 4: Place on Hold modal opens
- Step 5: Hold period is selected
- Step 6: Reason is entered
- Step 7: Place hold is activated
- Step 8: Place status is updated in database
- Step 9: Schedule modal opens
- Step 10: Place is blocked or shows hold message
- Step 11: In-progress visits are not affected
- Step 12: Hold action is recorded in audit logs

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-062

**Test Case ID:** TC-FUN-062

**Module:** Place on Hold

**Test Case Description:** Verify scheduling interface displays hold status and blocks creation

**Objective:** To verify that when a place is on hold, the scheduling interface correctly displays the hold status and blocks new schedule creation for that place.

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
- Step 1: Place status is 'on_hold'
- Step 2: Schedule modal opens
- Step 3: Place is marked as "On Hold" or similar
- Step 4: Place selection is blocked or disabled
- Step 5: Message explains place is on hold
- Step 6: Hold expiration date is shown
- Step 7: Non-held places are selectable
- Step 8: Submit button is disabled or error appears
- Step 9: Place shows hold indicator in admin/personnel views
- Step 10: Place hold is deactivated
- Step 11: Place can be selected in schedule modal

**Actual Results:**
- Step 1: Place status is 'on_hold'
- Step 2: Schedule modal opens
- Step 3: Place is marked as "On Hold" or similar
- Step 4: Place selection is blocked or disabled
- Step 5: Message explains place is on hold
- Step 6: Hold expiration date is shown
- Step 7: Non-held places are selectable
- Step 8: Submit button is disabled or error appears
- Step 9: Place shows hold indicator in admin/personnel views
- Step 10: Place hold is deactivated
- Step 11: Place can be selected in schedule modal

**Status:** Passed

**Severity:**

**Priority:**

### TC-FUN-063

**Test Case ID:** TC-FUN-063

**Module:** Place on Hold

**Test Case Description:** Verify place on hold expiration is managed automatically

**Objective:** To ensure that place on hold expiration is properly managed and that places automatically become available again after the hold period ends.

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
- Step 1: Place hold is activated with expiration
- Step 2: Expiration timestamp is saved
- Step 3: Expiration check process runs
- Step 4: Hold period elapses
- Step 5: Expiration is identified
- Step 6: Place status is updated
- Step 7: Place can be selected in schedule modal
- Step 8: Hold expiration is recorded in audit logs
- Step 9: Notification is sent (if enabled)
- Step 10: Place appears as active in all views

**Actual Results:**
- Step 1: Place hold is activated with expiration
- Step 2: Expiration timestamp is saved
- Step 3: Expiration check process runs
- Step 4: Hold period elapses
- Step 5: Expiration is identified
- Step 6: Place status is updated
- Step 7: Place can be selected in schedule modal
- Step 8: Hold expiration is recorded in audit logs
- Step 9: Notification is sent (if enabled)
- Step 10: Place appears as active in all views

**Status:** Passed

**Severity:**

**Priority:**