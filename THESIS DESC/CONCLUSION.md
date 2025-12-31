# Conclusion

The GuestGo is a web-based application that was developed using TypeScript, Vite, and modern web technologies. It was designed to produce an Automated Visitor Management and Gate Access Control System based on artificial intelligence to streamline and secure visitor registration, tracking, and verification processes within institutional environments. The system integrates AI-powered face detection and verification, real-time QR code processing, automated visit status management, comprehensive audit logging, and quality feedback mechanisms. GuestGo supports multiple user roles including Administrators, Department Staff, Security Personnel, and Visitors (with or without accounts), enabling each role to perform their specific functions such as scheduling visits, managing gate operations, tracking visit progress, and overseeing system administration.

The system operates through a three-tier architecture with presentation, logic, and data layers. The presentation layer provides a web application interface for scheduling visits, generating QR codes, tracking visit progress, and accessing role-specific dashboards. The logic layer governs internal operations including visitor scheduling with place-specific purpose management, QR code generation and scanning, AI-powered face detection and verification using YOLOv8 with MediaPipe and BlazeFace fallback mechanisms, gate processing for entrance and exit workflows, visit status management with automated state transitions, and comprehensive audit logging. The data layer securely stores and processes all visitor data, face images, visit records, and audit logs with encrypted biometric archives to ensure data consistency, integrity, and privacy compliance.

The system's compliance with the ISO 25010 requirements, including Functional Suitability, Performance Efficiency, Compatibility, Usability, Reliability, Security, Maintainability, and Portability are summarized below:

**Functional Suitability.** The developed GuestGo was evaluated as highly acceptable in terms of functional suitability, meeting user needs for automated visitor management and gate access control. It performed well in terms of functional completeness, correctness, and appropriateness, showing alignment with institutional visitor management objectives. The system achieved a criterion mean of 3.78, indicating that all functional requirements were met effectively.

**Performance Efficiency.** The built GuestGo was found to be highly acceptable in terms of performance efficiency. It handled visitor data and AI-powered face detection processes well, demonstrating good time behavior, resource utilization, and capacity. The system achieved a criterion mean of 3.65, showing adequate performance in processing visitor requests, QR code operations, and biometric verification workflows.

**Compatibility.** The built GuestGo was found to be highly acceptable in regards to compatibility. It performed adequately in different environments and demonstrated good co-existence with other systems and interoperability capabilities. The system achieved a criterion mean of 3.78, indicating successful integration with various platforms and tools.

**Usability.** The built GuestGo was found to be highly acceptable based on usability, providing a simple-to-use experience for all user roles. It had an intuitive and visually attractive interface, with users easily recognizing its capabilities and progressing through processes. The system excelled in appropriateness recognizability, accessibility, and operability, achieving a criterion mean of 3.80. Users found the system easy to learn and navigate, with effective user error protection mechanisms in place.

**Reliability.** The built GuestGo was found to be highly acceptable according to reliability. It performed well with minimal errors, maintaining system stability during use. The system demonstrated good maturity, fault tolerance, availability, and recoverability, achieving a criterion mean of 3.63. The multi-tier face detection architecture with fallback mechanisms ensured system resilience even during service outages.

**Security.** The built GuestGo was found to be highly acceptable in terms of security. It ensured information confidentiality and integrity, with adequate mechanisms for authentication, nonrepudiation, accountability, and authenticity. The system achieved a criterion mean of 3.80, demonstrating strong security measures including encrypted biometric archives, secure data storage, and comprehensive audit logging.

**Maintainability.** The built GuestGo was found to be highly acceptable in terms of maintainability. It was easy to analyze and update, supporting future modifications and enhancements with minimal difficulty. The system excelled in modularity, reusability, analyzability, modifiability, and testability, achieving a criterion mean of 3.87, the highest among all criteria. This indicates that the system architecture supports long-term sustainability and evolution.

**Portability.** The built GuestGo was found to be highly acceptable in terms of portability. The system demonstrated excellent adaptability and replaceability, achieving a criterion mean of 3.95, the highest rating across all criteria. This indicates that the system can be easily adapted to different environments and integrated with various platforms.

## Conclusions

Derived from the evaluation and findings, the following conclusions are drawn:

1. The developed "GuestGo" is successful in that:
   a. The system has a user-friendly interface, making it easier for users across all roles (Administrators, Department Staff, Security Personnel, and Visitors) to navigate through the web-based application.
   b. The system allows users to efficiently schedule visits, generate QR codes, and track visit progress with automated status management and real-time updates.
   c. The system integrates AI-powered face detection and verification, providing secure biometric verification for entrance and exit workflows with multi-tier fallback mechanisms ensuring system resilience.
   d. The system supports comprehensive gate operations with QR code scanning, face capture enforcement, visit validation, and automated state transitions, offering security and control to institutional environments.
   e. The system provides role-based dashboards and access control, ensuring that each user role has access to appropriate features and data while maintaining security boundaries.
   f. The overall experience of users, including Administrators, Department Staff, Security Personnel, and Visitors, was positive, with a grand mean of 3.77 (Highly Acceptable), indicating the system meets its intended objectives.

2. The developed GuestGo was successfully developed using (a) TypeScript as the primary programming language (b) Vite as the build tool and development server (c) HTML served as the frontend backbone (d) Tailwind CSS for the styling of HTML elements (e) JavaScript/TypeScript adds interactivity and type safety (f) Supabase for authentication, database, and RPC services (g) Python with Flask/FastAPI for the AI microservice (h) YOLOv8 and MediaPipe as the primary face detection models (i) TensorFlow.js BlazeFace as the client-side fallback for face detection (j) jsQR and qrcode libraries for QR code generation and scanning (k) Brevo (formerly Sendinblue) for transactional email services (l) EmailJS for contact form submissions and email verification (m) Reed-Solomon error correction codes for QR code reliability (n) XOR-based encryption with key rotation for biometric data security.

3. The GuestGo was tested according to Functional Suitability, Performance Efficiency, Compatibility, Usability, Reliability, Security, Maintainability, and Portability, with evaluation conducted in a controlled environment involving 1 Administrator, 2 Department Staff, 2 Security Personnel, and 15 Visitors (with or without accounts).

4. The developed GuestGo was evaluated as Highly Acceptable in compliance with ISO 25010 standards, covering all eight quality characteristics: Functional Suitability (3.78), Performance Efficiency (3.65), Compatibility (3.78), Usability (3.80), Reliability (3.63), Security (3.80), Maintainability (3.87), and Portability (3.95), with an overall Grand Mean of 3.77 (Highly Acceptable).

## Recommendations

Several essential improvements to GuestGo have been recommended to enhance its performance and capabilities. These recommendations include a variety of enhancements aimed at increasing the system's efficiency, usability, and overall user satisfaction.

• **Enhance Face Detection Accuracy** by improving the AI models' training data, optimizing detection thresholds, and implementing additional verification methods to reduce false positives and improve true positive rates.

• **Improve Performance with Large Visitor Volumes** by optimizing database queries, implementing caching mechanisms, and utilizing cloud-based solutions for better processing power during peak usage times.

• **Increase Scalability** by enabling batch processing for multiple visits, implementing queue systems for gate operations, and optimizing the AI microservice for concurrent requests.

• **Improve System Response Time** by optimizing the face detection pipeline, reducing image processing overhead, and implementing asynchronous processing for non-critical operations.

• **Enhance Mobile Experience** by optimizing the interface for mobile devices, improving camera access and QR scanning on mobile browsers, and ensuring responsive design across all screen sizes.

• **Expand Integration Capabilities** by providing APIs for third-party system integration, supporting additional authentication methods, and enabling data export functionality for reporting and analytics.

• **Strengthen Security Measures** by implementing additional encryption layers, enhancing audit logging capabilities, and providing more granular access control options for administrators.

• **Improve Offline Functionality** by implementing service workers for offline access, enabling local data caching, and providing fallback mechanisms when network connectivity is limited.

