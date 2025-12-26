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
The home page should load successfully and display the GuestGo branding including logo and navigation bar. The hero section should show the default welcome message "Welcome to GuestGo" for non-authenticated users. Three feature cards (Smart Scheduling, Secure Verification, Real-time Tracking) should be visible with their respective icons and descriptive text. All public navigation links (Home, About, Contact Us, Track Schedule) should be displayed in the navigation bar and be accessible.

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
The Sign Up modal should open when the sign up button is clicked, displaying a registration form with fields for first name, last name, email, and password. All form fields should accept input and display the entered values correctly. Upon clicking the Sign Up button, the system should process the registration request, validate the input data, and create a new user account in the Supabase authentication system. A success notification should appear confirming that the account was created successfully. The new user should be automatically assigned the default 'visitor' role in the user_roles table, which determines their access permissions and available features.

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
The Sign In modal should open when the sign in button is clicked, displaying email and password input fields. The form should accept valid user credentials and allow submission. The system should authenticate the user credentials against Supabase authentication, establish a secure session, and create a session token. Upon successful authentication, the user should be logged in and automatically redirected to the home page. The navigation bar should dynamically update to show role-specific links based on the user's assigned role (e.g., Dashboard for all authenticated users, Guard Dashboard for guard role, QR Scanner for personnel role). The hero section should display a personalized welcome message showing the user's first name instead of the default greeting.

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
The Sign In modal should open when accessed. When the "Forgot Password" link is clicked, a password reset form should appear with an email input field. The email field should accept input and validate the email format. The system should send a password reset email via Supabase's password reset functionality to the provided email address. A success message should appear confirming that the reset link has been sent to the user's email. The user should receive a password reset email containing a secure, time-limited reset link. Clicking the reset link should open the password reset page where the user can enter a new password. After setting the new password, the user should be able to successfully sign in using the new password credentials.

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
When an admin user signs in, the navigation bar should display the Dashboard link while hiding Guard Dashboard and QR Scanner links, as admins access all features through the main Dashboard. When a guard user signs in, the navigation should show both Dashboard and Guard Dashboard links, but hide QR Scanner and Track Schedule links, reflecting their gate processing responsibilities. When a personnel user signs in, the navigation should display Dashboard and QR Scanner links while hiding Guard Dashboard and Track Schedule links, as personnel need to scan QR codes but don't process gates. When a visitor user signs in, the navigation should show Dashboard and Track Schedule links while hiding Guard Dashboard and QR Scanner links, as visitors only need to manage their visits and track schedules.

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
The Home page should load with the "Schedule Now" button visible in the hero section or feature area. Clicking the button should open a Schedule modal displaying a visit registration form with fields for first name, last name, email, and phone number. All form fields should accept input and display entered values. The place dropdown should populate with all available places from the database that are not on hold. When a place is selected, the purpose dropdown should become enabled and display purposes configured for that specific place. The date picker should allow date selection within the allowed range based on advance notice requirements. Upon clicking "Schedule Visit", the system should validate all form inputs, check visit limits, and process the schedule request. A visit confirmation modal should appear displaying the visit details including visit ID, date, places, and purpose.

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
When a Gmail email address is entered in the email field, the system should detect it as a Gmail domain and enable the email verification flow. Clicking the "Send Code" button should trigger the EmailJS service to send a 6-digit OTP code to the provided Gmail address. A verification code input field and Verify button should appear in the form, replacing or appearing alongside the Send Code button. The user should receive an email containing the OTP code within a few seconds. The code input field should accept the 6-digit code. When the Verify button is clicked, the system should validate the entered code against the sent code. Upon successful verification, a success message should appear indicating email verification is complete. The email field should become read-only and disabled to prevent modification after verification.

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
The visitor dashboard should display the current week's visit count, showing how many visits the user has scheduled for the current week (Monday to Sunday). When the visit count reaches the maximum of 2 visits per week, the weekly visit status should display "No visits remaining" or a similar message indicating the limit has been reached. The Schedule modal should still open when the "Schedule Now" button is clicked, but the Schedule Submit button should be disabled to prevent submission. An error message or tooltip should appear explaining that the weekly visit limit of 2 visits has been reached and additional visits cannot be scheduled until the next week. For accounts that have less than 2 visits scheduled for the current week, the schedule request should be allowed and processed normally.

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
When a place is selected from the dropdown, the purpose dropdown should become enabled and display purposes configured for that place. After selecting a purpose, the date field should become enabled. The date picker should dynamically set the minimum selectable date based on the advance notice requirement for the selected purpose (e.g., if 3 days advance notice is required, the minimum date should be today + 3 days). Attempting to select a date that is less than the required advance notice period should be blocked by the date picker or show an error message explaining the requirement. Dates that meet the advance notice requirement should be accepted and selectable. For places or purposes with 0-day advance notice, the date picker should allow selection of today's date.

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
The place dropdown should display multiple available places that are not on hold. When at least two places are available, a "Multiple Places" option or checkbox should appear, allowing users to select multiple places in a single visit request. The multiple places selection interface should display checkboxes or a multi-select interface where users can select at least two places. Selected places should be visually indicated (checked) and displayed in a list. For each selected place, a purpose dropdown should appear, allowing the user to select a purpose for that specific place. The date picker should validate that the selected date meets the advance notice requirements for all selected places and purposes. Upon submission, the system should process the multi-place visit schedule, creating a single visit record with multiple place associations. The visit_places table should contain entries linking the visit to all selected places.

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
After completing the visit scheduling process and confirming the visit, a visit record should be created in the database with status 'pending'. The system should generate a unique QR code image using the qrcode library, encoding the visit ID as the QR code data. A confirmation email should be sent to the visitor's email address via the Brevo email service. The email should contain an embedded QR code image that displays inline in the email client. When the QR code is scanned using a QR code scanner, it should decode to the exact visit ID that was encoded. Each new visit should have a unique QR code with a different visit ID, ensuring no two visits share the same QR code.

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
When a valid visit ID is entered on the Track Schedule page, the visit details should be loaded from the database and displayed, including visitor name, visit date, places to visit, and visit ID. Clicking the "Print Visit Card" button should open a printable visit card modal or trigger a print preview that shows a formatted card layout. The QR code image should be prominently displayed on the card and be clearly visible and scannable. The card should display all essential visit information including visitor name, visit date, list of places to visit, and the visit ID. The card layout should be optimized for printing with proper sizing, margins, and formatting that fits standard paper sizes. The QR code on the printed card should be scannable and decode to the correct visit ID when scanned by the guard's QR scanner.

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
When a personnel user signs in and navigates to the QR Scanner page via the navigation link, the page should load with a camera interface that includes a "Start Scanner" button. Clicking the button should activate the camera feed and begin scanning for QR codes using the jsQR library. When a valid visit QR code is detected in the camera frame, it should be decoded to extract the visit ID. The system should retrieve the visit information from the database and display visit details including visitor name, visit date, places to visit, and current visit status. Only view actions should be available on this page; no gate processing buttons (Entrance, Exit, Temporary Exit) should be visible, as personnel cannot modify visit status. The visit status should remain unchanged after scanning, staying as 'pending' or whatever the current status is.

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
The QR Scanner page should load normally. When camera access is unavailable or the user clicks "Manual Input", a manual visit ID input field should appear, allowing users to enter a visit ID directly. The input field should accept numeric visit ID values and validate the format. When a valid visit ID is entered and submitted, the system should retrieve the visit information from the database using the visit ID. The visit information should be displayed correctly, showing the same details that would appear from a QR scan. Similarly, on the Guard Dashboard page, a manual visit ID entry section should be available as a fallback option. When a visit ID is entered manually on the Guard Dashboard, the system should look up the visit and display the visit details, allowing gate processing to continue even without camera access.

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
When a guard user signs in and navigates to the Guard Dashboard page, the dashboard should load with a QR scanner interface that includes a camera feed and scanning overlay. When a valid visit QR code with status 'pending' is scanned, the QR code should be detected and decoded, and the visit details should be displayed showing visitor information, date, and places. The guard should be able to select "Entrance" as the gate option. A face detection modal should open automatically, displaying a live camera feed. The Python AI service should detect a face in the camera frame using YOLOv8 and return bounding box coordinates. The face image should be automatically captured, cropped, compressed to 100x100px, and XOR-encrypted. The entrance RPC function should be called with the encrypted face data, visit ID, and gate type. The visit status should be updated from 'pending' to 'in_progress' in the database. A gate scan entry should be created in the gate_scans table recording the entrance scan with timestamp and face data.

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
After processing an entrance gate scan, the visit status should be 'in_progress'. When the same visit QR code is scanned again on the Guard Dashboard, the visit details should be displayed showing the current status. The guard should be able to select "Temporary Exit" as the gate option. The face capture process should complete, capturing and processing the exit face image. The temporary exit RPC function should be called, updating the visit status from 'in_progress' to 'temporary_exit' in the database. When the visit is scanned again, it should display with the 'temporary_exit' status. For re-entry, the guard should select "Entrance" as the gate option again. The re-entry RPC should be called, which should restore the visit status back to 'in_progress', allowing the visitor to continue their visit.

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
The visit should have status 'in_progress' with an entrance face image already stored in the gate_scans table from the entrance scan. The system should check that all places associated with the visit have been visited (place completion status). When the visit QR code is scanned on the Guard Dashboard, the visit details should be displayed. The guard should select "Exit" as the gate option. The face detection modal should open, requiring a new face capture for exit verification. The exit face image should be captured, compressed, and encrypted using the same process as the entrance face. The system should retrieve the entrance face from the database and decrypt it for comparison. The face verification API endpoint should be called, comparing both face images using correlation coefficient calculation. A similarity score should be calculated and displayed as a percentage (e.g., 85%). If the similarity is above the threshold (0.75), the exit RPC should be called, updating the visit status to 'completed' in the database. The visit status should be confirmed as 'completed' in the database.

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
An admin should be able to flag a visitor or visit in the system, setting a flag indicator on the visit record with an associated reason. When a guard scans a QR code for a flagged visit on the Guard Dashboard, the visit details should be displayed normally. However, a flagged visit alert modal should automatically appear, showing a warning message about the flag and displaying the flag reason and context. The modal should display flag details including why the visit or visitor was flagged. The modal should provide two options: "Override" and "Deny" buttons, allowing the guard to make an explicit decision. If the guard clicks "Override" and provides a reason, the override action should be logged in the audit logs table, and visit processing should continue normally. An override entry should be created in the logs table recording the guard's decision and reason. If the guard clicks "Deny", visit processing should be blocked and the denial should be logged in the audit logs.

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
When the face detection modal opens on the Guard Dashboard, it should display a live camera feed showing the user's face in real-time. The system should perform a health check on the Python AI service to verify it's available and responding. The live video feed should continuously show frames from the camera. Each frame should be converted to base64 format and sent to the Python AI service's /detect-face-base64 endpoint. The YOLOv8 face detection model should process the image frame and detect any faces present. The API should return normalized bounding box coordinates in the format [x1, y1, x2, y2] representing the face location in the image. A confidence score should be returned indicating the detection certainty (e.g., 0.95 for 95% confidence). Visual feedback should be displayed on the camera feed, such as a bounding box or highlight, showing the detected face area to the user.

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
When the Python AI service is unavailable (service down, network issue, or timeout), the service health check should fail or timeout. The face capture interface should still open normally. The UI should display a message indicating "AI service unavailable - using browser fallback" to inform the user that the fallback system is active. The live video feed should continue to show the user's face. The system should automatically load the TensorFlow.js BlazeFace model in the browser as a fallback detection method. Face detection should occur using the client-side BlazeFace model instead of the Python service. Bounding box coordinates should still be returned in the same format, allowing the capture process to continue. Face capture and processing should work normally using the fallback detection. When the Python service becomes available again, the system should automatically detect the service availability and switch back to using YOLOv8 for future detections.

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
When a face is detected during gate scan, the face area should be cropped from the camera frame using the bounding box coordinates. The cropped face image should be resized to 100x100 pixels, reducing the image size by approximately 80-90% compared to the original. The image should be compressed using JPEG encoding with quality 0.5 to further reduce file size while maintaining acceptable image quality. The compressed image bytes should be XOR-encrypted using a key rotation algorithm to protect biometric data. The encrypted image should be converted to a base64-encoded string for storage. The encrypted face image data should be saved in the Supabase database in the gate_scans table. When the Face Data modal is opened to view stored faces, the encrypted base64 string should be retrieved from the database. The XOR decryption process should reverse the encryption, restoring the original image data. The decrypted face image should be displayed correctly in the modal, showing the captured face.

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
The entrance face image should already be stored in the gate_scans table from the entrance gate scan. When processing the exit gate scan, a new exit face should be captured using the same process. A face verification request should be sent to the Python AI service's /metrics/verify-images endpoint with both face images. The service should extract feature vectors from both faces by converting them to 100x100 grayscale images. Histogram equalization should be applied to normalize lighting conditions and improve comparison accuracy. A correlation coefficient should be computed between the two feature vectors to measure similarity. The correlation should be converted to a similarity score on a 0-1 scale (e.g., 0.87 for 87% similarity). If the similarity score is above the threshold of 0.75, the match should be confirmed and exit processing should proceed. The similarity percentage should be displayed to the user in the Face Data modal. If the similarity is below 0.75, the system should flag the visit for review or require a guard override before allowing exit.

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
When an admin or guard user signs in and navigates to the Dashboard, they should be able to access the AI Status tab. The AI Status tab content should be displayed, showing information about the Python AI microservice health and performance. The service status should be clearly displayed, indicating whether the Python AI service is "Available" or "Unavailable". Average latency metrics should be shown, displaying the response time in milliseconds for face detection requests. When the Python service is unavailable, the BlazeFace fallback state should be indicated, showing that the browser-based fallback detection is active. Detection accuracy percentages should be displayed if available, showing the reliability of face detection. When the Python service is available, the status should show "Available" along with the current latency measurement. When the service is unavailable, the status should show "Unavailable" and indicate that the BlazeFace fallback is active.

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
When an admin user signs in and navigates to the Dashboard page, the admin should be authenticated and have full administrative access. The Dashboard should load with the admin-specific interface. The Places tab should appear in the admin tabs section, allowing management of places in the system. The Accounts tab should appear, providing user account management capabilities. The Gates tab should appear, showing gate configuration and management options. The Feedback tab should appear, displaying feedback analytics and survey responses. The AI Status tab should appear, showing the AI service health and metrics. When each tab is clicked, the corresponding tab content should be displayed, loading the appropriate interface and data for that administrative function.

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
When an admin navigates to the Places tab in the dashboard, the places management interface should be displayed showing a list of existing places. Clicking the "Add New Place" button should open a place creation modal with form fields for place name, description, and location. All form fields should accept input and validate the data. Upon submission, the new place should be created and saved to the database. The new place should immediately appear in the places list on the dashboard. The new place should also become available for selection in the scheduling dropdown on the Home page. Clicking the edit button on an existing place should open an edit modal pre-populated with the current place details. Modifications to place information should be saved when the form is submitted. The updated information should be reflected in the places list. Clicking the delete button should show a delete confirmation dialog to prevent accidental deletion. Upon confirmation, the place should be deleted and removed from the list. The delete action should be recorded in the audit logs for tracking purposes.

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
The Places tab should display a list of all places in the system. When an admin clicks on a place to view details, a place details panel should open showing place information and management options. Clicking the "Assign Personnel" button should open a personnel assignment interface displaying a list of available personnel users. A personnel user should be selectable from the list. Upon confirmation, the personnel should be assigned to the place, creating a relationship in the database. The assigned personnel should be listed in the place details, showing who is responsible for that place. Clicking "Configure Visit Limits" should open a visit limit configuration modal. The admin should be able to select a limit type (weekly or monthly). A limit value should be set (e.g., 10 visits). The limit should be saved to the database and enforced during visit scheduling. Clicking "Add Purpose" or "Edit Purposes" should open a purpose management interface. A purpose should be configurable with advance notice days ranging from 0 to 6 days. Once configured, the purpose should become available in the purpose dropdown when that place is selected during visit scheduling.

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
When a log-role user signs in and navigates to the Dashboard page, the log user should be authenticated with read-only access to audit logs. The Dashboard should load with a restricted interface. All other admin tabs (Places, Accounts, Gates, Feedback, AI Status) should be hidden from view, as log users only have access to logs. The Logs tab should be the only visible tab and should be active by default. The logs content should be visible, displaying audit log entries from the system. Audit log entries should be shown with details including timestamp, user, action type, category, and description. Pagination controls should be visible to navigate through large numbers of log entries. Visitor-specific content and other admin content should be hidden, ensuring log users can only view audit logs and cannot access other system functions.

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
The Logs tab interface should be displayed showing all audit log entries. When a category filter tab is clicked (e.g., "Gate"), the filter should be applied and the log list should show only logs matching that category. For example, selecting the "Gate" category should display only gate-related actions. When an action type filter is selected (e.g., "gate_entrance_scan"), the logs should be further filtered to show only that specific action type. When a date range filter is set with start and end dates, only log entries within that date range should be displayed. When a search query is entered in the search field, the system should filter logs by matching the search term against log descriptions, user names, or other searchable fields. Only matching log entries should be shown. When all filters are cleared or reset, the complete unfiltered log list should be displayed again, showing all audit log entries.

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
When a personnel user signs in and navigates to the Dashboard page, the personnel user should be authenticated. The Dashboard should load with personnel-specific tabs. The Assignment tab should appear, showing places assigned to the personnel user. The Visits tab should appear, displaying visits for assigned places. The Requests tab should appear, showing reschedule requests. The Finished tab should appear, displaying completed visits. When the Assignment tab is clicked, only places that have been assigned to this personnel user should be displayed in the list. When the Visits tab is clicked, in-progress visits should be displayed, but only for places assigned to the personnel user. The visits should be filtered by assigned places, ensuring personnel only see visits for their assigned locations. When the Requests tab is clicked, pending reschedule requests should be displayed. The requests should also be filtered by assigned places, showing only reschedule requests for visits to places assigned to the personnel user.

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
When a visitor requests a reschedule for a visit, a reschedule request should be created with status 'pending_reschedule'. When a personnel user assigned to the visit's place signs in and navigates to the Requests tab, the personnel user should be authenticated. Pending reschedule requests for their assigned places should be displayed in a list. Request details should be shown including the original visit date, requested new date, visitor information, and reason for reschedule. Clicking "Accept" or "Decline" should open an action modal. If accepting, the personnel should be able to select a new date from a date picker. The system should validate that the new date meets advance notice requirements and visit limits. Upon confirmation, the reschedule decision should be processed. If accepted, the visit date should be updated to the new date in the database. The reschedule action (accept or decline) should be recorded in the audit logs with details about who made the decision and when. The visitor should be notified of the decision via email or in-app notification.

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
When a guard user signs in and navigates to the Dashboard page, the guard user should be authenticated. The Dashboard should load with guard-specific tabs. The Guard Dashboard tab should appear, providing access to guard dashboard content within the main dashboard. The AI Status tab should appear, allowing guards to monitor AI service health. All other admin tabs (Places, Accounts, Gates, Feedback) should be hidden, as guards don't have administrative access. Clicking the Guard Dashboard tab should display guard dashboard content. Guards should also be able to navigate to a dedicated Guard Dashboard page via the navigation link. The dedicated Guard Dashboard page should load with a QR scanner interface and gate processing controls. The QR scanner and gate processing interface should be visible, including camera feed, scan overlay, and gate selection buttons. A manual visit ID input field should be available as a fallback when camera access is unavailable.

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
The Guard Dashboard page should load with the scanner interface. When the "Start Scanner" button is clicked, the scanner should activate and the camera feed should start displaying live video. A scan rate (FPS) counter should appear, displaying the current frames per second being processed (e.g., "Scan Rate: 15 FPS"). An interval counter should appear, showing the time interval between scan attempts (e.g., "Interval: 100ms"). Status text messages should change dynamically during scanning, showing different states such as "Position QR code", "Detecting", "Success", or "No QR code detected". When a QR code is detected in the camera frame, the detection should be processed. The FPS and interval values should update in real-time as scanning continues, reflecting the current performance metrics. The status text should update to reflect the current scan state, providing immediate feedback to the guard. When the scanner is stopped, the metrics should reset to initial values.

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
When a visitor user signs in and navigates to the Dashboard page, the visitor user should be authenticated. The Dashboard should load with visitor-specific tabs. The "Current Visits" tab should appear, displaying visits scheduled for today and future dates. The "Past Visits" tab should appear, displaying completed or past visits. When the Current Visits tab is clicked, today's visits and all future scheduled visits should be displayed in a list. A visit count should be shown indicating the total number of current visits. The filtering should ensure that only visits with dates from today onwards are shown, excluding past visits. When the Past Visits tab is clicked, past and completed visits should be displayed. A past visit count should be shown indicating the total number of past visits. The filtering should ensure that only visits with dates before today are shown. For each visit in both tabs, visit information should be displayed including visit date, places to visit, visit status, and visit ID.

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
When a visitor user signs in and navigates to the Dashboard, the visitor user should be authenticated. The Current Visits tab should display a list of visits with status 'pending' that are eligible for reschedule. A visit with status 'pending' should be found in the list. Clicking the "Request Reschedule" button on an eligible visit should open a reschedule request modal. The modal should allow the visitor to select a new date from a date picker that enforces advance notice requirements. A reason field should be available (if required) to accept input explaining why the reschedule is needed. Clicking "Submit Reschedule Request" should submit the request to the system. A success confirmation message should be displayed indicating the request was submitted. The visit status should be updated from 'pending' to 'pending_reschedule' in the database. The reschedule request should become visible to the personnel user assigned to the visit's place in their Requests tab. When the visitor refreshes the dashboard, the updated status should be reflected, showing the visit as pending reschedule.

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
The Track Schedule page should load when accessed via the navigation link, displaying a visit ID input field. The input field should be visible and ready to accept a visit ID. When a valid visit ID is entered and submitted, the system should retrieve the visit information from the database. The visit information should be displayed including visitor name, visit date, list of places to visit, and current visit status. Progress indicators should show the current status of the visit (pending, in_progress, completed, etc.). A list of places to visit should be displayed with completion status indicators showing which places have been visited. The entrance gate scan status should be shown (scanned or not scanned). The exit gate scan status should be shown (scanned or not scanned). The visit QR code image should be visible and displayable. A "Print Visit Card" button should be visible, allowing users to print the visit card with QR code.

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
The Track Schedule page should load normally. When an invalid or non-existent visit ID is entered and submitted, the system should attempt to retrieve the visit from the database. Since the visit doesn't exist, an error message should be displayed. A "No Visit Found" component or error state UI should be displayed, providing clear visual feedback. The error message should be user-friendly and explain that the visit was not found, possibly suggesting the user check the visit ID. When an invalid format is entered (non-numeric, too short, or incorrect format), a format validation error should be shown before submission, preventing invalid requests. The input field should be clearable, allowing users to reset and enter a new visit ID for another attempt.

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
The Track Schedule page should load when a valid visit ID is entered. Visit details should be loaded from the database and displayed. The entrance gate scan status should be clearly shown, indicating whether the entrance has been scanned (with timestamp) or not scanned yet. The exit gate scan status should be clearly shown, indicating whether the exit has been scanned (with timestamp) or not scanned yet. A list of places to visit should be displayed with visual indicators such as checkmarks for completed places or status text for pending places. Completed places should be marked with checkmarks or "Completed" status, while pending places should show as "Pending" or "Not Visited". The visit QR code image should be visible, clearly displayed, and scannable. Clicking the "Print Visit Card" button should open a print preview or printable modal. The printable card should contain all essential information including visitor name, visit date, places, visit ID, and QR code. A progress visualization such as a progress bar or status indicators should be displayed, showing the overall visit completion status.

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
After a visit is completed (entrance and exit scans processed), the visit status should change to 'completed' in the database. When the visitor who completed the visit signs in and navigates to the Dashboard or Home page, the visitor user should be authenticated. The page should load normally. A feedback survey modal should automatically appear, prompting the visitor to provide feedback for the completed visit. The survey should contain ISO 25010 quality attributes including functional suitability, performance efficiency, usability, reliability, security, maintainability, and portability. The survey should be specific to the completed visit, showing visit details such as date and places visited. The modal should be dismissible, allowing visitors to close it and access it again later if they choose not to provide feedback immediately. When navigating to the Past Visits tab in the dashboard, a "Provide Feedback" button should appear for completed visits that haven't received feedback yet, allowing visitors to provide feedback at their convenience.

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
When a feedback survey is opened for a completed visit, the feedback modal should open displaying the ISO 25010 survey form. All survey questions should accept responses, allowing visitors to rate different quality attributes. When the feedback survey is submitted, the feedback data should be saved to the database. A success confirmation message should be displayed indicating the feedback was submitted successfully. A feedback entry should be created in the feedback table, linking the feedback to the specific visit. When attempting to open the feedback survey for the same visit again (either through the modal or "Provide Feedback" button), the system should detect that feedback already exists. The submit button should be disabled or an error message should appear preventing duplicate submission. The error message should clearly explain that feedback was already provided for this visit. The "Provide Feedback" button should be disabled, hidden, or show a "Feedback Submitted" status. A status indicator should show that feedback is complete for this visit, preventing further feedback attempts.

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
After feedback is submitted for a completed visit, the feedback should be saved to the database in the feedback table. When an admin user signs in and navigates to the Dashboard, the admin user should be authenticated. Clicking the Feedback tab should load the feedback analytics dashboard. All submitted feedback responses should be displayed in a list or table format. Each feedback entry should be associated with visit details, showing which visit the feedback relates to. The ISO 25010 quality attribute scores should be displayed for each feedback entry, showing ratings for functional suitability, performance, usability, etc. Visualizations such as charts or graphs should show feedback trends over time, helping admins understand system performance from user perspectives. A date range filter should be available and work correctly, allowing admins to filter feedback by submission date. Additional filters should work correctly, such as filtering by visit, visitor, or quality attribute. Aggregated statistics should be displayed, showing average scores across all feedback and trends indicating improvements or areas of concern.

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
After completing the visit scheduling process and confirming the visit, a visit record should be created in the database with status 'pending'. The visit should be in the pending state, awaiting entrance gate processing. A visit confirmation email should be sent to the visitor's email address via the Brevo email service. The email should be delivered successfully to the visitor's inbox. The email should contain all visit details including the visit date, list of places to visit, and the visit purpose. The QR code image should be embedded in the email and visible when the email is opened. The QR code should be scannable directly from the email, allowing visitors to use it at the gate without printing. The visit ID should be displayed in the email, allowing visitors to track their visit. Instructions for gate use should be included in the email, explaining how to use the QR code and what to expect during the visit. The email should be sent to the correct recipient, matching the visitor's email address used during scheduling.

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
When an exit gate scan is completed and all places have been visited, the visit status should change to 'completed' in the database. The email sending process should be automatically initiated when the visit status changes to completed. A visit completion email should be sent to the visitor's email address via the Brevo service. The email should be delivered successfully to the visitor's inbox. The email should contain a completion confirmation message thanking the visitor for their visit. A feedback survey link should be included in the email, allowing visitors to provide feedback about their visit experience. The feedback link should be clickable and functional, directing users to the feedback survey. When clicked, the system should redirect to the feedback survey page or open the feedback modal. The survey should be pre-populated with visit details, ensuring the feedback is associated with the correct visit. Visit details and places visited should be shown in the email summary. The email should be sent to the correct recipient, matching the visitor's email address.

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
When a user signs out or clears their session, they should no longer be authenticated. When an unauthenticated user attempts to navigate to the Dashboard page directly via URL, the system should detect the lack of authentication and redirect to the home page or sign-in page. An authentication required message or sign-in prompt should be shown, indicating that authentication is needed to access the page. Similarly, attempting to navigate to the Guard Dashboard page directly should result in a redirect to the home or sign-in page. Attempting to navigate to the QR Scanner page directly should also result in a redirect. Protected navigation links (Dashboard, Guard Dashboard, QR Scanner) should not be visible in the navigation bar for unauthenticated users. When a user signs in with valid credentials, they should be authenticated and a session should be established. After authentication, the Dashboard and other protected pages should be accessible based on the user's role permissions.

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
When a visitor user signs in and navigates to the Dashboard page, the visitor user should be authenticated. The Dashboard should load with visitor-specific content. Admin tabs (Places, Accounts, Gates, Feedback, AI Status) should not be visible, as visitors don't have administrative access. Visitor tabs (Current Visits, Past Visits) should be displayed, showing only visitor-appropriate content. If a visitor attempts to access admin tabs via direct URL manipulation, the system should block access or redirect to an appropriate page. When a guard user signs in, the guard user should be authenticated. The Guard Dashboard should be accessible through the navigation link, but admin tabs should be hidden from guards. When a personnel user signs in, the personnel user should be authenticated. The QR Scanner should be accessible through the navigation link, but the Guard Dashboard should be hidden from personnel. All actions and features should match the user's role permissions, ensuring users can only perform operations allowed for their role.

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
When navigating to the About page via the navigation link, the About page should load successfully. A company information section should be displayed, showing company details, background, and history. Mission and vision statements should be visible, explaining the company's purpose and future goals. A team profiles section should display team member information including photos, names, and roles. A technology stack section should show the technologies used in the system with icons or logos for each technology. Company culture information should be displayed, describing the work environment and practices. A company values section should list the core values and principles. A thesis timeline section should show project milestones and development phases. Statistics or metrics should be displayed, showing system usage or achievement data. All sections should be accessible, properly formatted, and the page should be responsive and scrollable on different screen sizes.

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
When navigating to the Contact page via the navigation link, the Contact page should load successfully. A contact form should be displayed with fields for name, email, and message. The form should accept input and validate the entered data. When the form is submitted, it should be sent via the EmailJS service to the configured email address. A success confirmation message should be displayed indicating the message was sent successfully. Business hours information should be shown, displaying operating hours and availability. Location information including address and a map (if available) should be displayed. Social media links should be visible with icons or text links. Social media links should open in new tabs when clicked, allowing users to visit social media pages without leaving the contact page. A testimonials section should show public feedback from visitors, displaying positive reviews and experiences. The testimonials should rotate daily, showing different feedback each day to provide variety.

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
When any authenticated user signs in and clicks on the profile icon or settings link, the user should be authenticated. A Profile Settings modal or page should open, displaying the user's current account information. The current account information should be shown including name, email, and assigned role. A "Change Password" section should be available with a password change form. The current password field should accept input and validate against the user's existing password. A new password field should accept input and enforce password requirements (minimum 6 characters). A confirm password field should accept input and validate that it matches the new password. When the password change form is submitted, the password should be updated via Supabase authentication. A confirmation message should be displayed indicating the password was changed successfully. Account information fields such as name should be editable. When account information changes are saved, they should be saved to the database and reflected in the user's profile.

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
When a visitor completes the schedule form with all required information, the schedule form should be completed and ready for submission. A face enrollment option should be visible, allowing visitors to optionally enroll their face during scheduling. When face enrollment is activated, a face capture interface should appear. A camera feed should be displayed with live face detection running. The AI service (YOLOv8 or BlazeFace) should detect a face in the camera frame. When a face is detected, the face image should be automatically captured. The captured face image should be reduced to 100x100 pixels for storage efficiency. The face image should be XOR-encrypted using the same encryption process as gate scans. When the schedule request is submitted, the visit should be created with the face data associated. The encrypted face should be saved in the visit table or user table, depending on the implementation. The enrolled face should be available for future gate scans, allowing faster verification during entrance and exit processing.

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
When a visitor user signs in and navigates to the Home page, the visitor user should be authenticated. The Home page should load with personalized content. A weekly visit count widget or section should be visible, displaying visit statistics for the current week. The count should show available visit slots remaining (e.g., "1 visit remaining" out of the maximum 2 visits per week). The number of active (in-progress) visits should be displayed, showing visits that are currently ongoing. The number of completed visits for the current week should be shown. The week calculation should be correct, using Monday to Sunday as the week boundaries. When a new visit is scheduled, the visit should be created in the database. The remaining slots count should decrease accordingly, reflecting the new visit. The display should refresh automatically when visits change, updating the counts in real-time to show current status.

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
When navigating to the Home page, the page should load successfully. The FAQ section should be visible, typically located below the main content. A list of frequently asked questions should be displayed, each with a question text and an expand/collapse indicator. When a FAQ question is clicked, the question should expand to show the corresponding answer. The answer should appear with a smooth transition animation, providing a polished user experience. The expand/collapse icon should change to indicate the expanded state (e.g., from plus to minus). When an expanded question is clicked again, the question should collapse and the answer should hide. The answer should hide with a smooth transition effect, maintaining visual consistency. Multiple questions can be expanded simultaneously, allowing users to view multiple answers at once. The FAQ content should be relevant and helpful, addressing common questions about the system and visit process.

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
When a personnel user signs in and navigates to the Dashboard Assignment tab, the personnel user should be authenticated. The Assignment interface should be displayed showing places assigned to the personnel. A "Set Unavailability" button or similar option should be available. When clicked, an unavailability calendar or date picker should open, allowing the personnel to select a specific date. A date should be selected for unavailability. When confirmed, the unavailability should be saved to the database. An entry should be created in the unavailability table, linking the date to the personnel and their assigned place. When a visitor attempts to schedule a visit for the assigned place on the unavailable date, the schedule modal should open normally. However, date selection should be prevented for that date, or a warning message should be shown indicating the date is unavailable. Visit scheduling should be blocked for that specific date. When selecting a different available date, the date should be selectable in the date picker. Visit scheduling should work normally for available dates that are not marked as unavailable.

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
When an admin signs in and navigates to the Places tab, the places management interface should be displayed. When a place is selected for management, place details should be shown. Clicking "Add Purpose" or "Manage Purposes" should open a purpose management interface. Purpose details including name and description should be entered in the form. An advance notice requirement should be set, selecting a value between 0 and 6 days. When saved, the purpose should be created and saved to the database. The purpose should appear in the place purposes list. When editing an existing purpose, an edit modal should open with the current purpose details. The advance notice requirement can be modified to a different value (0-6 days). When changes are saved, the purpose should be updated in the database. When attempting to schedule a visit with this purpose, the schedule modal should open. The date picker should enforce the minimum date based on the advance notice requirement (e.g., if 3 days notice is required, today + 3 days is the minimum). Invalid dates that don't meet the advance notice requirement should not be selectable in the date picker.

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
When an admin signs in and navigates to the Accounts tab, the accounts management interface should be displayed showing a list of users. User details should be shown for each user including name, email, and current role. Clicking "Edit Role" or "Change Role" should open a role change interface. A new role should be selected from available roles (admin, log, personnel, guard, visitor, guest). When confirmed, the role should be updated in the database. The user's role should be updated in the user_roles table, changing their access permissions. When the user whose role was changed signs in, they should be authenticated. The navigation bar should reflect the new role permissions, showing or hiding links based on the new role. The Dashboard should show appropriate tabs for the new role (e.g., if changed to personnel, they should see Assignment, Visits, Requests, Finished tabs). The role change action should be recorded in the audit logs, tracking who made the change, when it was made, and what the change was.

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
When an admin signs in and navigates to the Gates tab, the gates management interface should be displayed showing a list of existing gates. Clicking "Add New Gate" should open a gate creation modal with form fields. Gate details including name, location, and description should be entered. An initial gate status (active or inactive) should be selected. When saved, the gate should be created and saved to the database. The new gate should appear in the gates list. When editing an existing gate, an edit modal should open with current gate details. Gate information can be modified and updated. The gate status can be changed from active to inactive or vice versa. When changes are saved, the gate should be updated in the database. All gate changes including creation, modification, and status changes should be recorded in the audit logs. Inactive gates should not be available for selection in the guard dashboard during gate processing, ensuring only active gates can be used.

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
When an admin signs in and navigates to the Places tab, the places management interface should be displayed. A place with associated visits should be located in the list. Clicking delete on the place should open a delete confirmation modal. A warning message should be displayed, alerting the admin about associated visit data and potential consequences. Upon confirmation, the place should be deleted from the database. The delete action should be recorded in the audit logs, tracking who deleted the place and when. Associated visit records should be preserved or archived, ensuring historical data is not lost. The place should no longer appear in the places list. The place should be removed from scheduling dropdown options, preventing new visits from being scheduled to that place. Historical visit data should remain accessible for reporting and audit purposes, even though the place no longer exists.

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
After a visit is completed (status becomes 'completed'), the visit should be in the completed state. No feedback entry should exist for the visit yet. When the visitor who completed the visit signs in, the visitor user should be authenticated. When navigating to the Dashboard or Home page, the page should load normally. A pending feedback notification modal should open automatically, prompting the visitor to provide feedback. The modal should display visit information including date and places visited. A "Provide Feedback" button should be visible in the modal. Clicking the button should open the feedback survey for that visit. The modal should be dismissible, allowing visitors to close it and access it later. If feedback is not submitted, the modal should show again when the user returns or logs in again. When feedback is submitted for the visit, the feedback should be saved to the database. The notification modal should no longer appear for this visit, as feedback has been provided.

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
When a visitor requests a reschedule for a visit, a reschedule request should be created with status 'pending_reschedule'. The personnel assigned to the visit's place should be confirmed. When the assigned personnel user signs in, the personnel user should be authenticated. When navigating to the Dashboard or Home page, the page should load normally. A pending reschedule notification modal should open automatically, alerting the personnel about the pending request. The modal should display reschedule request information including visitor name, original date, requested new date, and reason. A "View Requests" or "Process Request" button should be available in the modal. Clicking the action button should open the Requests tab or processing interface where the personnel can approve or decline the request. The modal should be dismissible, allowing personnel to close it and access it later. If the request is not processed, the modal should show again when the user returns or logs in again. When the reschedule request is processed (approved or declined), the request status should be updated. The notification modal should no longer appear for this processed request.

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
After completing entrance and exit gate scans for a visit, face images should be stored in the gate_scans table in encrypted format. When navigating to visit details or gate scan details, the visit information should be displayed. Clicking "View Face Data" or a similar button should open the Face Data modal. The entrance face image should be displayed after decryption, showing the face captured during entrance. The exit face image should be displayed after decryption, showing the face captured during exit. Both face images should be clear and recognizable, properly decrypted from their encrypted storage format. The similarity score should be displayed as a percentage (e.g., "85%") showing how similar the entrance and exit faces are. The verification status should be indicated, showing whether the faces matched (verified) or if there was a low similarity requiring review (flagged). Face data should only be accessible to authorized users (guards, admins) with proper role-based access control enforced. The modal should close when dismissed, hiding the face data.

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
When a user signs in with valid credentials, the user should be authenticated and a session should be established. The session token should be saved in session storage or cookies. When navigating to different pages (Home, Dashboard, About), all pages should load successfully. The user session should be maintained across all page navigations without requiring re-authentication. The session token should be automatically refreshed before expiration, ensuring continuous access. As the token approaches expiration, the system should detect the approaching expiration time. A new token should be issued and stored, replacing the old token seamlessly. No re-authentication should be required during the token refresh process. When the page is refreshed, the user should remain logged in, with the session persisting. When the user signs out, the token should be removed and the session should end, requiring authentication for future access.

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
When a visit is created with status 'pending' and a past scheduled date, the visit should be created in the database. A system background job or cron process should execute to check visit statuses. Past-due pending visits should have their status automatically updated to 'unsuccessful', indicating the visit never occurred. When a visit has status 'in_progress' and the expected exit time has passed, the visit should be identified as overdue. Past-due in-progress visits should have their status automatically updated to 'completed_flagged', indicating the visit was completed but flagged for review. All status transition actions should be recorded in the audit logs, tracking when and why statuses changed. Visitors should be notified of status changes via email or in-app notifications. The dashboard should reflect the updated statuses, showing visits with their correct current status. The auto-fix process should run on a regular schedule (daily or hourly) to ensure all past-due visits are handled promptly.

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
When a personnel user signs in and navigates to the Dashboard Assignment tab, the personnel user should be authenticated. The Assignment interface should be displayed showing places assigned to the personnel. An assigned place should be found in the list. Clicking "Place on Hold" should open a Place on Hold modal with options for setting hold duration. A hold duration or end date should be selected, specifying when the hold should expire. A reason for the hold should be entered if required. When confirmed, the place hold should be activated. The place status should be updated in the database to 'on_hold'. When attempting to schedule a new visit for the place, the schedule modal should open normally. However, the place should be blocked from selection or show a hold status message indicating it's unavailable. Existing in-progress visits should not be affected by the hold, allowing ongoing visits to continue. The hold action should be logged in the audit trail, recording who placed the hold, when, and why.

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
When a place is placed on hold, the place status should be 'on_hold' in the database. When navigating to the Home page and opening the Schedule modal, the schedule modal should open normally. In the place dropdown, the place on hold should be marked as "On Hold" or display a similar status indicator. Place selection should be blocked or disabled for the held place, preventing users from selecting it. A message or tooltip should appear explaining that the place is on hold and unavailable for scheduling. If available, the hold expiration date should be displayed, showing when the place will become available again. Other available places that are not on hold should still be selectable normally. If a user attempts to proceed with a held place, the submit button should be disabled or an error message should appear. The place should show a hold indicator in admin and personnel dashboard views, making the status visible to administrators. When the hold is removed from the place, the place hold should be deactivated and status changed to 'active'. The place should become available for selection in the schedule modal again.

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
When a place is placed on hold with a specific end date or time, the place hold should be activated with an expiration timestamp. The expiration timestamp should be saved in the database, indicating when the hold should automatically expire. A system background job should check hold expiration periodically, running on a schedule to detect expired holds. When the hold period elapses and the expiration time passes, the hold period should elapse. The system should detect the expired hold during the next expiration check. The place status should automatically change from 'on_hold' to 'active', making it available again. The place should become available for scheduling, appearing in the schedule modal dropdown. The hold expiration action should be recorded in the audit logs, tracking when the hold expired automatically. If configured, personnel should be notified of the hold expiration via email or notification. The place should appear as active in all interfaces including the places list, scheduling dropdown, and personnel assignment views.

**Actual Results:**
Hold expiration timestamp saved. Expiration check process ran. Expired hold detected. Place status updated to active. Place available for scheduling. Expiration logged. Notification sent. Place appeared as active in all views.

**Status:** Passed

**Severity:**

**Priority:**