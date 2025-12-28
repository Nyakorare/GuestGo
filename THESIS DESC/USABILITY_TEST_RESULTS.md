# Usability Test Results

## Test Execution Summary (Table 9)

Table 9 presents the consolidated usability test execution results across two formal system testing cycles for the GuestGo web-based visitor management system. During Cycle 1, 75% of the test cases were executed successfully, all of them passing, indicating strong initial usability and user experience design. The remaining 25% of test cases were not executed during this time, based on their newly-recommended status by the panel after evaluating the system and recommending enhancements to improve user interaction patterns, visual feedback mechanisms, and accessibility features. Those recommended enhancements were executed and verified during Cycle 2, where 100% of the test cases, including both the new additions and originals, were executed and all were successful, demonstrating comprehensive usability improvements across all user roles and interface components.

## Usability Test Cases

### TC-USAB-001

**Test Case ID:** TC-USAB-001

**Module:** Navigation & User Interface

**Test Case Description:** Verify hover effects on navigation links provide visual feedback

**Objective:** To be able to view visual feedback when hovering over navigation links, including color changes and underline animations that indicate interactive elements.

**Preconditions:** 
- User is on any page of the GuestGo application
- Browser supports CSS transitions and hover states
- Navigation bar is visible

**Actions:**
- Step 1: Navigate to the home page
- Step 2: Move mouse cursor over any navigation link (Home, About, Contact Us, Track Schedule)
- Step 3: Observe the visual changes that occur on hover
- Step 4: Move cursor away from the link and observe the transition back to normal state

**Expected Results:**
Navigation links display smooth hover feedback with color transition (gray to blue) and animated underline expanding from left to right. Transitions occur over 200ms duration. When cursor moves away, link returns to default state smoothly.

**Actual Results:**
Hover effects work as expected. Links change color and show underline animation smoothly. Transitions are smooth and provide clear feedback.

**Status:** Passed

**Severity:**

**Priority:**

---

### TC-USAB-002

**Test Case ID:** TC-USAB-002

**Module:** Dashboard & Cards

**Test Case Description:** Verify hover effects on dashboard cards and feature cards

**Objective:** To be able to see hover effects on dashboard cards, visit cards, and feature cards that provide visual feedback indicating interactivity and improve user engagement.

**Preconditions:**
- User is logged in and viewing a dashboard page (Admin, Personnel, Guard, or Visitor)
- Dashboard contains cards or visit items
- Browser supports CSS transforms and transitions

**Actions:**
- Step 1: Navigate to any dashboard page
- Step 2: Move mouse cursor over a dashboard card or visit card
- Step 3: Observe the visual transformations that occur
- Step 4: Move cursor away and observe the return animation

**Expected Results:**
Cards display hover effects including upward translation (4px lift), enhanced shadow, and gradient overlay. Gradient transitions from transparent to visible. Shadow intensifies for better separation. Effects clearly indicate interactivity.

**Actual Results:**
Cards lift up on hover with enhanced shadows. Gradient overlays appear smoothly. Interactive feedback is clear and engaging.

**Status:** Passed

**Severity:**

**Priority:**

---

### TC-USAB-003

**Test Case ID:** TC-USAB-003

**Module:** Forms & Input Validation

**Test Case Description:** Verify real-time form validation provides clear feedback

**Objective:** To be able to receive immediate and clear visual feedback when entering data in form fields, including error messages, border color changes, and validation indicators that guide users to correct input errors.

**Preconditions:**
- User is on a page containing a form (Sign Up, Sign In, Schedule Visit, Contact Form)
- Form contains required fields and validation rules
- Browser supports JavaScript and DOM manipulation

**Actions:**
- Step 1: Navigate to a form page (e.g., Sign Up modal)
- Step 2: Click on a required input field and leave it empty
- Step 3: Click outside the field (blur event) or attempt to submit
- Step 4: Observe the validation feedback displayed
- Step 5: Enter invalid data (e.g., invalid email format) and observe feedback
- Step 6: Correct the input and observe the error message disappear

**Expected Results:**
Form fields show immediate feedback on validation failure: red border, error messages in red text near the field. Email format validation displays specific messages. When input is corrected, red border and error message disappear smoothly. Validation occurs on blur and form submission.

**Actual Results:**
Invalid fields show red borders and error messages immediately. Email format validation works correctly. Errors clear when input is corrected. Feedback is timely and non-intrusive.

**Status:** Passed

**Severity:**

**Priority:**

---

### TC-USAB-004

**Test Case ID:** TC-USAB-004

**Module:** Buttons & Interactive Elements

**Test Case Description:** Verify button hover states and loading indicators

**Objective:** To be able to distinguish interactive buttons from static elements through hover effects, and to see clear loading states during asynchronous operations that indicate the system is processing user actions.

**Preconditions:**
- User is on any page with buttons (forms, dashboards, modals)
- Browser supports CSS transitions and JavaScript
- User has network connectivity for operations that require server communication

**Actions:**
- Step 1: Navigate to a page containing action buttons
- Step 2: Move mouse cursor over various buttons (primary, secondary, danger buttons)
- Step 3: Observe the hover effects on each button type
- Step 4: Click a button that triggers an asynchronous operation (e.g., Submit, Log Entrance, Scan QR)
- Step 5: Observe the loading state displayed during processing
- Step 6: Wait for the operation to complete and observe the success or error feedback

**Expected Results:**
Buttons display hover effects: color darkening, scale transformations, shadow enhancements. Primary buttons show scale increases and enhanced shadows. Danger buttons show darker tones. Loading states display disabled appearance, spinner animations, and text changes. Upon completion, buttons return to normal state with success/error messages.

**Actual Results:**
Button hover effects work correctly with color changes and scale transformations. Loading states show spinners and disabled appearance. Success/error feedback appears after operations complete.

**Status:** Passed

**Severity:**

**Priority:**

---

### TC-USAB-005

**Test Case ID:** TC-USAB-005

**Module:** Dark Mode & Theme Toggle

**Test Case Description:** Verify dark mode toggle functionality and theme persistence

**Objective:** To be able to switch between light and dark themes seamlessly, with the selected preference persisting across sessions and providing consistent visual experience throughout the application.

**Preconditions:**
- User is on any page of the GuestGo application
- Browser supports localStorage for preference storage
- Theme toggle button is visible in the navigation bar

**Actions:**
- Step 1: Navigate to any page and observe the current theme (light or dark)
- Step 2: Click the theme toggle button in the navigation bar
- Step 3: Observe the theme transition from light to dark or vice versa
- Step 4: Navigate to different pages and verify theme consistency
- Step 5: Refresh the page and verify theme preference persists
- Step 6: Close and reopen the browser, then verify theme preference is maintained

**Expected Results:**
Theme toggle smoothly transitions all UI elements between light and dark modes simultaneously. Icon changes to indicate current theme. Preference stored in localStorage and persists across navigations, refreshes, and sessions. All components maintain consistent theming. Dark mode provides adequate contrast for readability.

**Actual Results:**
Theme toggle works smoothly without flickering. All UI elements update simultaneously. Theme preference persists across sessions. Dark mode provides good contrast and readability.

**Status:** Passed

**Severity:**

**Priority:**

---

### TC-USAB-006

**Test Case ID:** TC-USAB-006

**Module:** Modals & Overlays

**Test Case Description:** Verify modal interactions and animations

**Objective:** To be able to interact with modal dialogs smoothly, with clear open and close animations, backdrop interactions, and proper focus management that guides user attention effectively.

**Preconditions:**
- User is on any page that contains modals (authentication, scheduling, face detection, etc.)
- Browser supports CSS animations and backdrop filters
- JavaScript is enabled for modal functionality

**Actions:**
- Step 1: Trigger a modal to open (e.g., click Sign In button, Schedule Visit button)
- Step 2: Observe the modal opening animation
- Step 3: Verify the backdrop overlay appears and dims the background
- Step 4: Attempt to close the modal by clicking the backdrop, close button, or Cancel button
- Step 5: Observe the closing animation
- Step 6: Verify focus is properly managed (keyboard navigation works within modal)

**Expected Results:**
Modals open with smooth fade-in and slide-up animations. Backdrop has blur and darkening effects. Content centered and properly sized. Multiple close methods work (backdrop, X button, Escape key, Cancel). Focus trapped within modal. Focus returns to triggering element on close. Content readable in both themes.

**Actual Results:**
Modals open with smooth animations and backdrop blur. Multiple close methods work (backdrop, X button, Escape key). Focus management works correctly. Content is readable in both themes.

**Status:** Passed

**Severity:**

**Priority:**

---

### TC-USAB-007

**Test Case ID:** TC-USAB-007

**Module:** Toast Notifications & Feedback Messages

**Test Case Description:** Verify toast notifications and success/error messages

**Objective:** To be able to receive clear, non-intrusive feedback messages for system actions including success confirmations, error notifications, and warning messages that inform users about the status of their operations without disrupting workflow.

**Preconditions:**
- User is logged in and performing actions that generate notifications
- Browser supports JavaScript and CSS animations
- User has performed or is performing an action (form submission, gate scan, visit scheduling)

**Actions:**
- Step 1: Perform an action that generates a success message (e.g., successfully log entrance, submit feedback)
- Step 2: Observe the success notification appearance and content
- Step 3: Perform an action that generates an error message (e.g., invalid input, network error)
- Step 4: Observe the error notification appearance and content
- Step 5: Wait for notifications to auto-dismiss or manually dismiss them
- Step 6: Verify multiple notifications stack properly if they appear simultaneously

**Expected Results:**
Success notifications appear as green toast messages with checkmark icons. Error notifications appear as red messages with error icons. Warning notifications appear as yellow/amber messages. All include smooth slide-in animations, remain visible 3-5 seconds, and auto-dismiss. Multiple notifications stack vertically. Notifications readable in both themes and non-intrusive.

**Actual Results:**
Toast notifications appear with correct colors (green for success, red for errors). They auto-dismiss after 3-5 seconds. Multiple notifications stack properly. Notifications are readable and non-intrusive.

**Status:** Passed

**Severity:**

**Priority:**

---

### TC-USAB-008

**Test Case ID:** TC-USAB-008

**Module:** QR Scanner Interface

**Test Case Description:** Verify QR scanner interface provides clear visual feedback

**Objective:** To be able to use the QR scanner interface effectively with clear visual indicators, live feedback, and guidance that helps users position QR codes correctly for successful scanning.

**Preconditions:**
- User is on the Guard Dashboard or QR Scanner page
- Device has a camera available and permissions granted
- Browser supports camera access and video streaming

**Actions:**
- Step 1: Navigate to Guard Dashboard or QR Scanner page
- Step 2: Click "Start Scanner" button
- Step 3: Grant camera permissions when prompted
- Step 4: Observe the camera feed and scanner overlay
- Step 5: Position a QR code within the scanner frame
- Step 6: Observe the live feedback indicators and scanning animations
- Step 7: Verify QR code detection feedback when code is successfully scanned

**Expected Results:**
QR scanner displays live camera feed with scanning overlay including corner brackets. Animated scanning lines and focus indicators provide visual feedback. Status messages guide users ("Position QR code in frame", "QR code detected!"). Detected codes highlighted with green border. Performance indicators show scan rate and interval. Scan frequency adapts based on detection. Error messages displayed clearly when issues occur.

**Actual Results:**
Scanner shows live camera feed with clear overlay and corner brackets. Status messages guide users effectively. QR detection highlights with green border. Performance indicators display correctly. Error messages are clear when issues occur.

**Status:** Passed

**Severity:**

**Priority:**

---

### TC-USAB-009

**Test Case ID:** TC-USAB-009

**Module:** Face Detection Modal

**Test Case Description:** Verify face detection modal provides clear instructions and feedback

**Objective:** To be able to use the face detection interface effectively with clear instructions, real-time detection feedback, and visual indicators that guide users to position their face correctly for successful face capture.

**Preconditions:**
- User is performing an action that requires face detection (entrance scan, exit scan, temporary exit verification)
- Device has a camera available and permissions granted
- Browser supports camera access and face detection libraries

**Actions:**
- Step 1: Trigger face detection (e.g., click "Log Entrance" button)
- Step 2: Observe the face detection modal opening
- Step 3: Read the instructions displayed in the modal
- Step 4: Click "Start Face Detection" button
- Step 5: Position face within the camera frame
- Step 6: Observe the real-time detection feedback (face indicators, bounding boxes)
- Step 7: Click "Take Photo" when face is detected
- Step 8: Observe the processing indicator and success feedback

**Expected Results:**
Face detection modal displays clear instructions. Live camera feed shows color-coded indicators (green for perfect, blue for detected, red for multiple, gray for none). Bounding boxes appear when face detected. "Take Photo" button enables on detection. Real-time feedback guides positioning. Processing indicator shows after capture. Success feedback confirms detection. Error messages explain failures and provide retry guidance. Modal responsive across devices.

**Actual Results:**
Modal shows clear instructions and live camera feed. Color-coded indicators (green/blue/red/gray) provide real-time feedback. Bounding boxes appear when face is detected. Processing indicators and success feedback work correctly. Error messages are helpful.

**Status:** Passed

**Severity:**

**Priority:**

---

### TC-USAB-010

**Test Case ID:** TC-USAB-010

**Module:** Responsive Design & Mobile Interface

**Test Case Description:** Verify responsive design works across different screen sizes

**Objective:** To be able to use the application effectively on various device sizes including desktop, tablet, and mobile devices, with layouts that adapt appropriately and maintain usability across all screen dimensions.

**Preconditions:**
- User has access to devices with different screen sizes (desktop, tablet, mobile)
- Browser supports responsive CSS and media queries
- Application is accessible on all test devices

**Actions:**
- Step 1: Open the application on a desktop browser (1920x1080 or larger)
- Step 2: Observe the layout and navigation structure
- Step 3: Resize browser window to tablet size (768px - 1024px width)
- Step 4: Observe layout adaptations and navigation changes
- Step 5: Resize browser window to mobile size (320px - 767px width)
- Step 6: Observe mobile menu activation and layout stacking
- Step 7: Test touch interactions on mobile device (if available)
- Step 8: Verify all functionality works correctly at each screen size

**Expected Results:**
Application displays appropriately across all screen sizes. Desktop shows horizontal navigation and multi-column grids. Tablet adjusts to fewer columns with appropriately sized touch targets. Mobile uses hamburger menu, single-column layout, and full-width cards. Touch targets meet 44x44px minimum. Mobile menu slides in smoothly. All elements remain usable at all sizes. Text readable without horizontal scrolling. Visual hierarchy maintained across breakpoints.

**Actual Results:**
Layout adapts correctly across all screen sizes. Desktop shows horizontal navigation and multi-column grids. Mobile uses hamburger menu and single-column layout. Touch targets meet size requirements. All elements remain usable at all breakpoints.

**Status:** Passed

**Severity:**

**Priority:**

---

### TC-USAB-011

**Test Case ID:** TC-USAB-011

**Module:** Logo & Branding Animations

**Test Case Description:** Verify logo hover animations provide engaging interaction

**Objective:** To be able to see engaging hover animations on the GuestGo logo that enhance brand recognition and provide delightful micro-interactions that improve overall user experience.

**Preconditions:**
- User is on any page with the GuestGo logo visible
- Browser supports CSS animations and JavaScript
- Logo is present in the navigation bar

**Actions:**
- Step 1: Navigate to any page and locate the GuestGo logo
- Step 2: Move mouse cursor over the logo
- Step 3: Observe the animation that triggers on hover
- Step 4: Move cursor away and observe the animation completion
- Step 5: Hover over the logo multiple times to see different animation variations

**Expected Results:**
Logo displays engaging hover animations (rotation, scaling, bouncing, floating). Random animation selected on each hover. Animations smooth and performant (0.5-2 seconds). Logo maintains clickable appearance. Animations complete gracefully when cursor moves away. Logo remains functional as navigation element while enhancing brand personality.

**Actual Results:**
Logo hover animations work smoothly with random variations (rotation, scaling, bouncing). Animations complete within 0.5-2 seconds without performance issues. Logo remains clickable and functional. Animations enhance user experience without distraction.

**Status:** Passed

**Severity:**

**Priority:**

---

### TC-USAB-012

**Test Case ID:** TC-USAB-012

**Module:** Data Tables & Lists

**Test Case Description:** Verify data tables and lists display information clearly

**Objective:** To be able to view and interact with data tables, visit lists, and log entries in a clear, organized manner with proper formatting, sorting capabilities, and visual hierarchy that facilitates information comprehension.

**Preconditions:**
- User is logged in and viewing a dashboard with data tables (Admin Dashboard, Logs page, Visit History)
- Data exists in the system to display
- Browser supports table rendering and JavaScript for interactions

**Actions:**
- Step 1: Navigate to a dashboard page containing data tables (e.g., Admin Dashboard, Logs)
- Step 2: Observe the table structure, headers, and data formatting
- Step 3: Verify column headers are clearly labeled and aligned
- Step 4: Check that data rows are properly formatted and readable
- Step 5: Test sorting functionality if available (click column headers)
- Step 6: Test search/filter functionality if available
- Step 7: Verify pagination controls work correctly if tables are paginated
- Step 8: Check table responsiveness on different screen sizes

**Expected Results:**
Tables display data in clear, organized structure with proper alignment and spacing. Column headers visually distinct and clearly labeled. Data cells formatted consistently. Row hover effects highlight entire row. Sorting provides clear visual indicators (arrows). Search/filter controls visible and functional. Pagination shows current page and navigation. Tables adapt responsively to mobile (horizontal scroll or card layout). Readable in both themes.

**Actual Results:**
Tables display data clearly with proper alignment and spacing. Row hover effects improve readability. Sorting works with clear visual indicators. Search/filter and pagination function correctly. Tables adapt responsively to mobile screens.

**Status:** Passed

**Severity:**

**Priority:**

---

### TC-USAB-013

**Test Case ID:** TC-USAB-013

**Module:** Status Indicators & Badges

**Test Case Description:** Verify status indicators and badges are clearly distinguishable

**Objective:** To be able to quickly identify visit statuses, place completion statuses, and system states through color-coded badges and indicators that use consistent visual language throughout the application.

**Preconditions:**
- User is viewing pages with status indicators (dashboards, visit details, place lists)
- System contains visits and places with various statuses
- Browser supports CSS styling and color rendering

**Actions:**
- Step 1: Navigate to a dashboard or visit details page
- Step 2: Observe status badges for visits (pending, in_progress, completed, temporary_exit, etc.)
- Step 3: Observe status badges for places (pending, completed, completed_flagged, etc.)
- Step 4: Verify color coding consistency across different pages
- Step 5: Check that status text is readable and clearly labeled
- Step 6: Verify status indicators work in both light and dark themes

**Expected Results:**
Status badges use consistent color coding (green for completed, blue for in-progress, yellow for warnings, red for errors, gray for cancelled). Badges have rounded corners, appropriate padding, and clear labels. Status terminology consistent across pages. Badges maintain adequate contrast in both themes. Status indicators appear consistently in same locations. Visual design allows quick scanning and understanding.

**Actual Results:**
Status badges use consistent color coding (green/blue/yellow/red/gray) throughout the application. Badges are readable with proper contrast in both themes. Status terminology is consistent. Badges are easy to locate and distinguish at a glance.

**Status:** Passed

**Severity:**

**Priority:**

---

### TC-USAB-014

**Test Case ID:** TC-USAB-014

**Module:** Loading States & Skeleton Screens

**Test Case Description:** Verify loading states provide clear feedback during data fetching

**Objective:** To be able to see clear loading indicators and skeleton screens during data loading operations that inform users about system activity and prevent confusion about unresponsive interfaces.

**Preconditions:**
- User is performing actions that require data fetching (loading dashboards, fetching visit details, submitting forms)
- Network connection is available but may have variable latency
- Browser supports JavaScript and asynchronous operations

**Actions:**
- Step 1: Navigate to a dashboard page that loads data
- Step 2: Observe loading indicators during initial page load
- Step 3: Trigger a data refresh or filter operation
- Step 4: Observe loading states during data fetching
- Step 5: Perform an action that requires server communication (e.g., submit form)
- Step 6: Observe button loading states and form submission feedback
- Step 7: Verify loading states disappear when operations complete

**Expected Results:**
Loading states clearly visible throughout application. Initial page loads show skeleton screens or spinners. Buttons show loading states with spinners, disabled appearance, and text changes. Tables show loading indicators or skeleton rows. Spinners use consistent styling and appropriate positioning. Loading states prevent interaction with processing elements. Indicators disappear smoothly when operations complete. Consistent across application and both themes.

**Actual Results:**
Loading indicators appear during data fetching and operations. Skeleton screens and spinners provide clear feedback. Buttons show disabled state and text changes during processing. Loading states prevent duplicate submissions. Indicators disappear smoothly when operations complete.

**Status:** Passed

**Severity:**

**Priority:**

---

### TC-USAB-015

**Test Case ID:** TC-USAB-015

**Module:** Error Handling & Recovery

**Test Case Description:** Verify error messages are helpful and recovery options are clear

**Objective:** To be able to understand what went wrong when errors occur and to have clear guidance on how to recover from errors, with actionable error messages that help users resolve issues without frustration.

**Preconditions:**
- User is performing operations that may encounter errors (network issues, validation errors, permission errors)
- System may experience various error conditions
- Browser supports error handling and message display

**Actions:**
- Step 1: Attempt to submit a form with invalid data
- Step 2: Observe the error messages displayed
- Step 3: Attempt to perform an action without proper permissions
- Step 4: Observe permission error messages
- Step 5: Simulate a network error (disable network temporarily)
- Step 6: Observe network error handling and messages
- Step 7: Verify error messages provide actionable guidance
- Step 8: Test error recovery (correcting input, retrying operations)

**Expected Results:**
Error messages are clear, specific, and actionable. Validation errors appear near relevant fields with specific guidance. Network errors display user-friendly messages with retry options. Permission errors state required permissions. Messages use consistent styling (red text, error icons) and appear in predictable locations. Plain language used without technical jargon. Recovery options provided (retry buttons, correction guidance). Error states visually distinct from success. Messages persist appropriately and can be dismissed. Error handling guides users toward completion.

**Actual Results:**
Error messages are clear and actionable with specific guidance. Validation errors appear near relevant fields. Network and permission errors provide helpful recovery options. Messages use plain language and consistent styling. Error handling guides users effectively.

**Status:** Passed

**Severity:**

**Priority:**

---

## Summary

All usability test cases (TC-USAB-001 through TC-USAB-015) were successfully executed and passed during the testing cycles, demonstrating that the GuestGo system provides excellent usability, clear visual feedback, intuitive interactions, and consistent user experience across all roles and interface components. The system successfully implements modern UI/UX best practices including smooth animations, responsive design, clear error handling, and accessible interfaces that enhance user productivity and satisfaction.

