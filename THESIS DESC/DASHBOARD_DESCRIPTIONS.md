# Dashboard Descriptions by Role

## 7.1 Admin Role Dashboard

Figure 7.1 presents the administrative dashboard interface of the GuestGo system, accessible exclusively to users with the admin role. The header navigation includes Home, About, Contact Us, Track Schedule, and Dashboard links, with the admin role displayed prominently below the dashboard title along with a Philippine time clock showing the current date and time in the Asia/Manila timezone.

The dashboard features a comprehensive tabbed interface with five main administrative sections: Places, Accounts, Gates, Feedback, and AI Status. The Places tab provides complete place management functionality, allowing administrators to create new places, edit existing place information, assign personnel to places, configure place purposes with advance notice requirements (0-6 days), set visit limits (weekly or monthly), toggle place availability, and delete places. The interface includes search functionality to filter places by name, location, or description, and an availability filter to view all places, available only, or unavailable only.

The Accounts tab enables administrators to manage all user accounts within the system, including viewing user details, changing user roles (admin, log, personnel, guard, visitor, guest), and searching accounts by name, email, or role. The Gates tab provides gate management capabilities, allowing administrators to create new gates, update gate information, change gate status (active/inactive), and view gate scanning activity. The Feedback tab displays comprehensive feedback analytics, showing ISO 25010 quality assessment scores across eight dimensions (Functional Suitability, Performance Efficiency, Compatibility, Usability, Reliability, Security, Maintainability, Portability) plus overall satisfaction metrics, with filtering options by date range and visit status.

The AI Status tab monitors the health and performance of the Python AI microservice responsible for face detection and verification, displaying service availability, response times, detection accuracy metrics, and fallback status. A "Refresh All" button is available to manually update all administrative data across all tabs. The dashboard also includes a visitor content section that is hidden for admin users, as they have full system access through the administrative tabs.

**Exclusive Navigation Pages for Admin Role:**
- **Dashboard** (with full admin tabs: Places, Accounts, Gates, Feedback, AI Status)
- All standard navigation pages (Home, About, Contact Us, Track Schedule) are accessible

---

## 7.2 Log Role Dashboard

Figure 7.2 presents the system logs dashboard interface, accessible exclusively to users with the log role. The header navigation includes Home, About, Contact Us, and Dashboard links, with the log role displayed below the dashboard title. The Track Schedule link is hidden for log users, as their primary function is to monitor system activity rather than manage visits.

The dashboard features a single visible tab labeled "Logs" that provides comprehensive system audit trail functionality. The logs interface includes category tabs for filtering log entries: All, Gate, Place, Personnel, Account, Schedules, and Feedback. Each category displays relevant system actions such as gate scans, place management operations, personnel assignments, account changes, visit scheduling and completion events, and feedback submissions.

The logs interface includes advanced filtering capabilities with a search input to find logs by user, action, or details, date range filters to view logs within specific time periods, and action type filters that dynamically change based on the selected category tab. Log entries are displayed in a paginated format with configurable page size, showing detailed information including timestamp, user who performed the action, action type, and contextual details. The interface includes a refresh button to manually reload logs and an auto-advance feature that automatically cycles through log pages for continuous monitoring.

**Exclusive Navigation Pages for Log Role:**
- **Dashboard** (with Logs tab only - all other admin tabs are hidden)
- All standard navigation pages (Home, About, Contact Us) are accessible
- Track Schedule page is hidden for log users

---

## 7.3 Personnel Role Dashboard

Figure 7.3 presents the personnel dashboard interface, accessible exclusively to users with the personnel role. The header navigation includes Home, About, Contact Us, QR Scanner, and Dashboard links, with the personnel role displayed below the dashboard title. The Track Schedule link is hidden for personnel users, as they primarily manage visits assigned to their places rather than track their own visits.

The dashboard features a tabbed interface with four main sections: Assignment, Visits, Requests, and Finished. The Assignment tab displays all places where the personnel member is assigned, showing place names, locations, descriptions, assigned personnel count, and place purposes with their advance notice requirements. Personnel can view their assigned places and edit place purposes for their assigned locations.

The Visits tab displays all in-progress visits (visits that have been scanned at gate entrance) for places where the personnel member is assigned. This includes visit details such as visitor name, visit date, places to visit, visit status, and allows personnel to mark visits as complete when all assigned places have been visited. The Requests tab shows pending reschedule requests from visitors for visits to the personnel member's assigned places, allowing personnel to accept or decline reschedule requests with new date selection, subject to weekly visit limits and place constraints.

The Finished tab displays completed visits for the personnel member's assigned places, with filtering options by date range and visit type (completed, completed_flagged, unsuccessful). Personnel can view visit history, access visit details, and review feedback submitted by visitors. The dashboard includes auto-refresh functionality for the Visits tab to keep visit status updated in real-time.

**Exclusive Navigation Pages for Personnel Role:**
- **Dashboard** (with Personnel tabs: Assignment, Visits, Requests, Finished)
- **QR Scanner** page (exclusive to personnel role) - allows scanning of visit QR codes to view visit details and manage visit processing
- All standard navigation pages (Home, About, Contact Us) are accessible
- Track Schedule page is hidden for personnel users

---

## 7.4 Guard Role Dashboard

Figure 7.4 presents the guard dashboard interface, accessible exclusively to users with the guard role. The header navigation includes Home, About, Contact Us, Guard Dashboard, and Dashboard links, with the guard role displayed below the dashboard title. The Track Schedule link is hidden for guard users, as their primary function is gate operations rather than visit tracking.

The Guard Dashboard page (accessed via the exclusive "Guard Dashboard" navigation link) provides a dedicated interface for gate operations with three main sections. The Scanner Section features a live camera feed with QR code scanning capabilities, adaptive scan scheduling that dynamically adjusts detection intervals based on scan success rates, real-time scan telemetry displaying frames per second (FPS) and scan interval metrics, and visual feedback indicators showing scanning status. Guards can start or stop the scanner, switch between front and back cameras, and manually enter visit IDs when QR scanning is unavailable.

The Manual Visit ID Entry section allows guards to input visit IDs directly when QR codes cannot be scanned, with validation and error handling. The QR Data Preview Section displays scanned visit information including visitor details, visit date, places to visit, visit status, and gate selection options (Entrance, Exit, Temporary Exit). Before processing any gate action, the system enforces face capture through an AI-powered face detection modal that uses YOLOv8 (primary), MediaPipe (secondary), or BlazeFace (client fallback) to detect and capture visitor faces. The captured face is compressed, encrypted, and stored in the database before the gate action is processed.

The main Dashboard page (accessed via the "Dashboard" navigation link) for guard users shows two tabs: Guard Dashboard and AI Status. The Guard Dashboard tab provides an overview of gate operations and pending visits, while the AI Status tab monitors the face detection service health and performance metrics.

**Exclusive Navigation Pages for Guard Role:**
- **Guard Dashboard** page (exclusive to guard role) - dedicated gate operations interface with QR scanning and face capture
- **Dashboard** (with Guard Dashboard and AI Status tabs only)
- All standard navigation pages (Home, About, Contact Us) are accessible
- Track Schedule page is hidden for guard users

---

## 7.5 Visitor Role Dashboard

Figure 7.5 presents the visitor dashboard interface, accessible to users with the visitor role. The header navigation includes Home, About, Contact Us, Track Schedule, and Dashboard links, with the visitor role displayed below the dashboard title. Visitors have access to the Track Schedule page to monitor their visit progress using visit IDs.

The dashboard features a visitor-specific interface with two main tabs: Current and Past. The Current tab is further divided into Today and Future sub-tabs. The Today sub-tab displays all visits scheduled for the current date, showing visit details including visit ID, places to visit, visit purposes, visit status (pending, in_progress, temporary_exit), and action buttons to request reschedules or view visit details. The Future sub-tab displays all upcoming visits scheduled for future dates, with similar visit information and reschedule request capabilities.

The Past tab displays all completed, completed_flagged, and unsuccessful visits from previous dates, with calendar-based date filtering to view visits within specific date ranges. Visitors can filter visits by status (all, completed, completed_flagged, unsuccessful) and search visits by place name or purpose. Each visit card displays comprehensive information including visit date, places visited, visit status, gate scanning history (entrance and exit scan times), and feedback submission status.

The dashboard includes notification modals that alert visitors when they have pending feedback surveys for completed visits, encouraging them to submit ISO 25010 quality assessments. Visitors can also request reschedules for pending visits (one reschedule per visit) with reason explanations, and view reschedule request status. A refresh button allows visitors to manually update their visit information, and the interface includes weekly visit count displays showing remaining visit slots (maximum 2 visits per week).

**Exclusive Navigation Pages for Visitor Role:**
- **Dashboard** (with Visitor tabs: Current [Today/Future] and Past)
- **Track Schedule** page - allows visitors to enter visit IDs to view detailed visit progress, places to visit, gate scanning status, and QR codes
- All standard navigation pages (Home, About, Contact Us) are accessible

---

## 7.6 Guest Role Dashboard

Figure 7.6 presents the guest dashboard interface, accessible to users with the guest role or non-authenticated users who schedule visits without creating accounts. The header navigation includes Home, About, Contact Us, and Track Schedule links, with no Dashboard link visible as guests do not have persistent accounts. The Track Schedule page is accessible to guests to monitor their visit progress using visit IDs received via email confirmation.

Since guests do not have authenticated accounts, they primarily interact with the system through the Home page scheduling modal and the Track Schedule page. The scheduling modal allows guests to enter their information, verify their email address with a one-time code (Gmail supported), select places to visit, specify visit purposes, choose visit dates, and receive confirmation emails with embedded QR codes and visit IDs.

The Track Schedule page provides the same functionality for guests as for visitors, allowing them to enter visit IDs to view visit details, places to visit, visit progress, gate scanning status, and QR codes. However, guests do not have access to a persistent dashboard showing their visit history, as their visits are tracked by email address rather than user account.

**Exclusive Navigation Pages for Guest Role:**
- **Track Schedule** page - allows guests to enter visit IDs to view detailed visit progress (same functionality as visitors)
- All standard navigation pages (Home, About, Contact Us) are accessible
- Dashboard page is not accessible to guests (no persistent account)

---

## Navigation Summary by Role

Table 6 presents a consolidated summary of each user role, highlighting which dashboard views they can access, which navigation links are exclusive to them, and which pages are hidden from their interface.

| Role | Dashboard Access | Exclusive Pages | Hidden Pages |
|------|-----------------|-----------------|--------------|
| **Admin** | Full admin dashboard (Places, Accounts, Gates, Feedback, AI Status) | None (full access) | None |
| **Log** | Logs-only dashboard | None | Track Schedule |
| **Personnel** | Personnel dashboard (Assignment, Visits, Requests, Finished) | QR Scanner | Track Schedule |
| **Guard** | Guard dashboard (Guard Dashboard tab, AI Status tab) | Guard Dashboard | Track Schedule |
| **Visitor** | Visitor dashboard (Current [Today/Future], Past) | Track Schedule | None |
| **Guest** | No dashboard access | Track Schedule (via visit ID) | Dashboard |

