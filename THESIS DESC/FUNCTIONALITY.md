# Project Evaluation

## Test Execution Summary (Table 7)

 Table 7 presents the consolidated test execution results across two formal system testing cycles for the GuestGo web-based system. In Cycle 1, the focus was on validating the newly panel‑recommended “Place on Hold” functionality for the personnel role, including how it interacts with visit scheduling, personnel assignments, and gate processing; all related test cases were executed and passed, confirming that the on‑hold workflow behaves as intended. After this targeted validation, the complete functional test suite—covering authentication, role-based navigation, scheduling, QR services, guard operations, AI‑driven face detection and verification, dashboards for all roles, visit tracking, feedback, email notifications, and security—was executed in Cycle 2, where 100% of the test cases passed successfully. Collectively, the two cycles demonstrate that both the enhanced personnel on‑hold feature and the broader integrated workflows of the system operate correctly under the evaluated scenarios.

## Sample Test Cases for All Roles and Features

Table 8 contains a set of use cases related to the system's functionality. Each is characterized by a unique test case ID and objectives that describe the use case. This serves as a reference to ensure that the system has been thoroughly tested and meets the objective of each use case.

TC-FUN-001: To be able to land on the correct home page and see role-appropriate hero text, feature cards, and navigation links after opening the application.
TC-FUN-002: To verify that a new user can successfully sign up with email and password, receive confirmation feedback, and be assigned a default role.
TC-FUN-003: To verify that an existing user can sign in with valid credentials, establish a session, and see role-based navigation updates.
TC-FUN-004: To confirm that the "Forgot Password" flow sends a reset link and allows the user to set a new password and log in.
TC-FUN-005: To validate that the navigation bar updates dynamically based on user role (admin, log, personnel, guard, visitor, guest), showing only permitted links.
TC-FUN-006: To ensure a guest can open the Schedule modal from the Home page, fill in required visit details, and submit a schedule request.
TC-FUN-007: To verify that Gmail OTP email verification is required and successfully completes before a guest schedule is accepted.
TC-FUN-008: To validate that the system enforces the maximum of two visits per week per visitor account and blocks additional requests with an appropriate message.
TC-FUN-009: To verify that place-specific advance notice rules (0–6 days) are correctly enforced when selecting visit dates.
TC-FUN-010: To confirm that multi-place scheduling is allowed only when at least two eligible places are available and correctly stored.
TC-FUN-011: To verify that a unique QR code is generated for each approved visit and embedded in the confirmation email.
TC-FUN-012: To ensure that the printable visit card contains a valid QR code and essential visit details for gate use.
TC-FUN-013: To validate that the QR Scanner page allows personnel to scan a visit QR and view corresponding visit information without modifying status.
TC-FUN-014: To verify that manual visit ID entry works as a fallback when camera access is unavailable, both on the QR Scanner and Guard Dashboard pages.
TC-FUN-015: To ensure that a guard can scan a valid visit QR at the entrance gate, capture a face image, and transition the visit status from `pending` to `in_progress`.
TC-FUN-016: To verify that temporary exit processing changes visit status from `in_progress` to `temporary_exit` and back to `in_progress` on re-entry.
TC-FUN-017: To confirm that exit processing requires a new face capture, compares it to the entrance face, and transitions status to `completed` or `completed_flagged` as appropriate.
TC-FUN-018: To validate that flagged visits trigger a visible alert modal for guards and require explicit override or denial.
TC-FUN-019: To ensure the Python AI service can detect a face from the guard's live camera stream using YOLOv8 and return valid bounding box coordinates.
TC-FUN-020: To verify that when the Python AI service is unavailable, the system automatically falls back to client-side BlazeFace detection and still allows capture.
TC-FUN-021: To confirm that captured face images are compressed, XOR-encrypted, stored in Supabase, and can be decrypted on demand in the Face Data modal.
TC-FUN-022: To validate that the face verification endpoint computes a similarity score between entrance and exit images and flags low-similarity cases for review.
TC-FUN-023: To ensure the AI Status dashboard correctly reflects the health and latency of the Python AI microservice and fallback state.
TC-FUN-024: To verify that an admin can access the Dashboard with Places, Accounts, Gates, Feedback, and AI Status tabs visible.
TC-FUN-025: To confirm that an admin can create, edit, and delete places, and see changes reflected in scheduling options on the Home and Dashboard pages.
TC-FUN-026: To validate that an admin can assign personnel to places and configure visit limits and purposes per place.
TC-FUN-027: To ensure that a log-role user can open the Dashboard and view only the Logs tab and content.
TC-FUN-028: To verify that log filters (category, action type, date range, search) correctly narrow down audit entries.
TC-FUN-029: To confirm that a personnel user sees Assignment, Visits, Requests, and Finished tabs and can view only visits for their assigned places.
TC-FUN-030: To validate that personnel can approve or decline visitor reschedule requests and that resulting schedule changes are enforced by the system.
TC-FUN-031: To ensure that a guard user sees the Guard Dashboard and AI Status tabs and can access the dedicated Guard Dashboard page.
TC-FUN-032: To verify that guard dashboard metrics (scan rate, interval, status text) update in real time during scanning.
TC-FUN-033: To confirm that a visitor user can open their Dashboard and view Current (Today/Future) and Past visits with correct filtering and counts.
TC-FUN-034: To validate that visitors can request a reschedule for eligible visits directly from their Dashboard and see status updates.
TC-FUN-035: To verify that any visitor or guest can open the Track Schedule page, enter a valid visit ID, and see full visit details and progress.
TC-FUN-036: To ensure that entering an invalid or unknown visit ID shows an appropriate "no visit found" state.
TC-FUN-037: To confirm that Track Schedule correctly displays gate scan status (entrance/exit), places list, and visit QR for printing.
TC-FUN-038: To validate that after a visit is completed, the system offers an ISO 25010 feedback survey for that visit.
TC-FUN-039: To ensure that only one feedback submission per visit is accepted and subsequent attempts are blocked.
TC-FUN-040: To confirm that feedback responses appear in the Feedback analytics dashboard for admins.
TC-FUN-041: To verify that visit confirmation emails (with QR) are sent to visitors upon successful scheduling.
TC-FUN-042: To validate that visit completion emails with feedback links are sent when a visit transitions to `completed`.
TC-FUN-043: To confirm that users without an authenticated session cannot access protected pages such as Dashboard, Guard Dashboard, and QR Scanner.
TC-FUN-044: To ensure that role-based restrictions prevent users from accessing dashboards or actions not permitted to their role (e.g., visitors cannot access admin tabs).
TC-FUN-045: To verify that the About page displays company information, mission and vision, team profiles, technology stack, culture, values, thesis timeline, and statistics correctly.
TC-FUN-046: To validate that the Contact page allows users to submit contact forms via EmailJS, view business hours, location information, social media links, and see daily rotating public feedback testimonials.
TC-FUN-047: To confirm that authenticated users can access Profile Settings to change their password and update account information.
TC-FUN-048: To verify that optional face enrollment during visit scheduling successfully captures, compresses, encrypts, and stores face data for future verification.
TC-FUN-049: To ensure that the weekly visit count display on the Home page correctly shows remaining visit slots, active visits, and completed visits for the current week.
TC-FUN-050: To validate that the FAQ section on the Home page displays expandable questions and answers with smooth animations.
TC-FUN-051: To confirm that personnel can set single-day unavailability and that this prevents scheduling for their assigned places on that specific date.
TC-FUN-052: To verify that admins can create and edit place purposes with advance notice requirements (0-6 days) and that these rules are enforced during scheduling.
TC-FUN-053: To validate that admins can change user roles (e.g., visitor to personnel) and that role changes are reflected immediately in navigation and dashboard access.
TC-FUN-054: To ensure that admins can create, edit, and change gate status (active/inactive) and that gate changes are logged in the audit trail.
TC-FUN-055: To verify that place deletion by admins is logged and that associated visit data is handled appropriately.
TC-FUN-056: To confirm that pending feedback notification modals appear for visitors when they have completed visits without submitted feedback.
TC-FUN-057: To validate that pending reschedule notification modals appear for personnel when they have pending reschedule requests for their assigned places.
TC-FUN-058: To ensure that the Face Data modal can decrypt and display stored face images with verification similarity scores for authorized users.
TC-FUN-059: To verify that session management automatically refreshes tokens and maintains user sessions across page navigations.
TC-FUN-060: To validate that the system automatically transitions past-due visits from `pending` to `unsuccessful` and from `in_progress` to `completed_flagged` when appropriate.
TC-FUN-061: To confirm that the Place on Hold functionality allows personnel to place their assigned places on hold, preventing new visit scheduling while allowing existing in-progress visits to continue.
TC-FUN-062: To verify that when a place is on hold, the scheduling interface correctly displays the hold status and blocks new schedule creation for that place.
TC-FUN-063: To ensure that place on hold expiration is properly managed and that places automatically become available again after the hold period ends.