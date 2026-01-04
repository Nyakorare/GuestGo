export function ThesisTimeline() {
  const timelineItems = [
    {
      id: 1,
      color: 'blue',
      date: 'June - July',
      year: '2025',
      label: '(Ch. 1-3)',
      title: 'Database & Backend Infrastructure Module',
      description: 'Established the foundation of GuestGo by designing and implementing the complete database schema using Supabase. Created tables for users, visitors, schedules, QR codes, and facial recognition data. Developed RESTful API endpoints, implemented database relationships, and set up authentication infrastructure. This module serves as the backbone for all other system components.',
      shortTitle: 'Database & Backend',
      icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4'
    },
    {
      id: 2,
      color: 'purple',
      date: 'July - August',
      year: '2025',
      title: 'Authentication & User Management Module',
      description: 'Implemented secure authentication system with role-based access control (RBAC). Developed user registration, login, password reset, and session management features. Created distinct user roles: Admin, Security Personnel, Receptionist, and Visitor. Built user profile management, permission systems, and secure token-based authentication using Supabase Auth.',
      shortTitle: 'Auth & User Management',
      icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
    },
    {
      id: 3,
      color: 'green',
      date: 'August - September',
      year: '2025',
      title: 'Visitor Scheduling & QR Code Module',
      description: 'Developed comprehensive visitor scheduling system allowing visitors to book appointments with hosts. Implemented calendar integration, time slot management, and automated email notifications. Created QR code generation system with unique, time-limited codes for each visit. Built QR code scanning functionality with validation and expiration checks.',
      shortTitle: 'Scheduling & QR Code',
      icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
    },
    {
      id: 4,
      color: 'yellow',
      date: 'September - October',
      year: '2025',
      title: 'Gate Scanning & Entry Management Module',
      description: 'Built secure gate scanning system for security personnel to verify and authorize visitor entry. Implemented real-time QR code validation, visitor status tracking, and entry/exit logging. Created visitor check-in/check-out workflows with automated notifications to hosts. Developed security dashboard for monitoring visitor flow and managing access permissions.',
      shortTitle: 'Gate Scanning & Entry',
      icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
    },
    {
      id: 5,
      color: 'orange',
      date: 'October 15',
      year: '2025',
      label: '(Ch. 1-3)',
      title: 'Chapter 1-3 Defense & Prototype',
      description: 'Successfully presented and defended Chapters 1-3 of our thesis before the panel. Showcased the initial system prototype demonstrating core modules: database infrastructure, authentication system, visitor scheduling, QR code generation, and gate scanning functionality. This milestone validated our research direction and system design approach.',
      shortTitle: 'Chapters 1-3 Defense',
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4'
    },
    {
      id: 6,
      color: 'pink',
      date: 'October - November',
      year: '2025',
      title: 'AI & Facial Recognition Module',
      description: 'Integrated advanced AI capabilities using YOLOv8 models for facial detection and verification. Developed Python microservice for real-time face recognition with fallback to TensorFlow.js BlazeFace. Implemented secure face data encryption, storage, and matching algorithms. Created visitor face registration system and automated verification during check-in process.',
      shortTitle: 'AI & Facial Recognition',
      icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z'
    },
    {
      id: 7,
      color: 'red',
      date: 'November',
      year: '2025',
      title: 'Analytics & Dashboard Module',
      description: 'Built comprehensive analytics dashboard with real-time visitor statistics, peak time analysis, and trend visualization. Implemented role-specific dashboards for different user types. Created reporting features including visitor logs, entry/exit reports, and system usage metrics. Developed data export functionality and interactive charts for better insights.',
      shortTitle: 'Analytics & Dashboard',
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
    },
    {
      id: 8,
      color: 'teal',
      date: 'November - December',
      year: '2025',
      title: 'Security, Notifications & Integration',
      description: 'Enhanced system security with data encryption, secure API endpoints, and vulnerability assessments. Implemented comprehensive notification system with email and SMS alerts for visit confirmations, reminders, and status updates. Integrated all modules seamlessly, ensuring smooth data flow between components. Added audit logging and security monitoring features.',
      shortTitle: 'Security & Integration',
      icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9'
    },
    {
      id: 9,
      color: 'cyan',
      date: 'Early December',
      year: '2025',
      title: 'System Deployment & Production',
      description: 'Deployed the complete GuestGo system to production environment. Configured cloud infrastructure, set up CI/CD pipelines, and optimized system performance. Conducted load testing, security hardening, and backup procedures. All modules were integrated and tested in production environment, ensuring system reliability and scalability.',
      shortTitle: 'Deployment & Production',
      icon: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
    },
    {
      id: 10,
      color: 'indigo',
      date: '2nd Week of December',
      year: '2025',
      label: '(Ch. 4)',
      title: 'Client Talks & Dry Run Testing',
      description: 'Conducted client meetings to discuss system evaluation requirements for Chapter 4. Performed dry run testing sessions with stakeholders, demonstrating all system modules including authentication, scheduling, QR codes, gate scanning, facial recognition, and analytics. Gathered initial feedback and identified areas for improvement before comprehensive evaluation.',
      shortTitle: 'Client Talks & Dry Run',
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
    },
    {
      id: 11,
      color: 'violet',
      date: 'December 28-30',
      year: '2025',
      label: '(Ch. 4)',
      title: 'System Testing & Evaluation',
      description: 'Comprehensive system testing and evaluation period. Tested all modules: database performance, authentication security, scheduling accuracy, QR code validation, gate scanning reliability, facial recognition accuracy, analytics functionality, and notification delivery. Collected quantitative and qualitative data on system effectiveness, usability, reliability, and performance metrics for Chapter 4 analysis.',
      shortTitle: 'Testing & Evaluation',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    {
      id: 12,
      color: 'indigo',
      date: 'January',
      year: '2026',
      title: 'Final Documentation & Preparation',
      description: 'Completed comprehensive documentation for all system modules including technical specifications, API documentation, user manuals, and deployment guides. Prepared final thesis chapters with evaluation results, system architecture diagrams, and module descriptions. Created presentation materials and demonstration scripts showcasing all GuestGo modules and their integration.',
      shortTitle: 'Final Documentation',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
    },
    {
      id: 13,
      color: 'indigo',
      date: '3rd Week of January',
      year: '2026',
      label: '(Final)',
      title: 'Final Defense',
      description: 'The culmination of our thesis journey. We will present the complete GuestGo system, demonstrating all modules: database infrastructure, authentication, scheduling, QR codes, gate scanning, facial recognition, analytics, security, and notifications. Showcase comprehensive documentation, system evaluation results, and the fully functional deployed system. This final defense represents the successful completion of our intelligent guest management system.',
      shortTitle: 'Final Defense',
      icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z'
    }
  ];

  const colorClasses = {
    blue: { bg: 'bg-blue-600', border: 'border-blue-600', text: 'text-blue-600', textDark: 'dark:text-blue-400', bgLight: 'bg-blue-50', bgDark: 'dark:bg-blue-900/30' },
    purple: { bg: 'bg-purple-600', border: 'border-purple-600', text: 'text-purple-600', textDark: 'dark:text-purple-400', bgLight: 'bg-purple-50', bgDark: 'dark:bg-purple-900/30' },
    green: { bg: 'bg-green-600', border: 'border-green-600', text: 'text-green-600', textDark: 'dark:text-green-400', bgLight: 'bg-green-50', bgDark: 'dark:bg-green-900/30' },
    yellow: { bg: 'bg-yellow-600', border: 'border-yellow-600', text: 'text-yellow-600', textDark: 'dark:text-yellow-400', bgLight: 'bg-yellow-50', bgDark: 'dark:bg-yellow-900/30' },
    orange: { bg: 'bg-orange-600', border: 'border-orange-600', text: 'text-orange-600', textDark: 'dark:text-orange-400', bgLight: 'bg-orange-50', bgDark: 'dark:bg-orange-900/30' },
    pink: { bg: 'bg-pink-600', border: 'border-pink-600', text: 'text-pink-600', textDark: 'dark:text-pink-400', bgLight: 'bg-pink-50', bgDark: 'dark:bg-pink-900/30' },
    red: { bg: 'bg-red-600', border: 'border-red-600', text: 'text-red-600', textDark: 'dark:text-red-400', bgLight: 'bg-red-50', bgDark: 'dark:bg-red-900/30' },
    teal: { bg: 'bg-teal-600', border: 'border-teal-600', text: 'text-teal-600', textDark: 'dark:text-teal-400', bgLight: 'bg-teal-50', bgDark: 'dark:bg-teal-900/30' },
    cyan: { bg: 'bg-cyan-600', border: 'border-cyan-600', text: 'text-cyan-600', textDark: 'dark:text-cyan-400', bgLight: 'bg-cyan-50', bgDark: 'dark:bg-cyan-900/30' },
    indigo: { bg: 'bg-indigo-600', border: 'border-indigo-600', text: 'text-indigo-600', textDark: 'dark:text-indigo-400', bgLight: 'bg-indigo-50', bgDark: 'dark:bg-indigo-900/30' },
    violet: { bg: 'bg-violet-600', border: 'border-violet-600', text: 'text-violet-600', textDark: 'dark:text-violet-400', bgLight: 'bg-violet-50', bgDark: 'dark:bg-violet-900/30' }
  };

  return `
    <div class="mb-8 sm:mb-12 md:mb-16">
      <!-- Title with Toggle Button -->
      <div class="flex items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6 md:mb-8 animate-fade-in-up px-2" style="animation-delay:2.4s;">
        <h2 class="text-xl sm:text-2xl font-bold">Our Journey</h2>
        <button id="timeline-toggle-btn" class="timeline-toggle-btn inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800" aria-label="Toggle timeline" aria-expanded="false">
          <svg id="timeline-toggle-icon" class="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
          </svg>
        </button>
      </div>
      
      <!-- Timeline Container (Hidden by default) -->
      <div id="timeline-container" class="timeline-container max-w-6xl mx-auto px-2 sm:px-4">
        <!-- Vertical Timeline Container -->
        <div class="relative py-8 sm:py-12">
          <!-- Vertical timeline line -->
          <div class="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 md:w-1 bg-gradient-to-b from-blue-500 via-purple-500 via-green-500 via-yellow-500 via-orange-500 via-pink-500 via-red-500 via-teal-500 via-cyan-500 via-indigo-500 to-violet-500 dark:from-blue-400 dark:via-purple-400 dark:via-green-400 dark:via-yellow-400 dark:via-orange-400 dark:via-pink-400 dark:via-red-400 dark:via-teal-400 dark:via-cyan-400 dark:via-indigo-400 dark:to-violet-400 transform md:-translate-x-1/2"></div>
          
          <!-- Timeline Items Container -->
          <div class="relative space-y-8 sm:space-y-12">
            ${timelineItems.map((item, index) => {
              const colors = colorClasses[item.color as keyof typeof colorClasses];
              const isEven = index % 2 === 1;
              
              return `
                <!-- Timeline Item ${item.id}: ${item.shortTitle} -->
                <div class="timeline-item group relative flex md:items-center gap-4 md:gap-8">
                  ${isEven ? `
                    <!-- Left side spacer (even items) -->
                    <div class="flex-1 hidden md:block"></div>
                    <!-- Timeline dot -->
                    <div class="relative z-10 flex-shrink-0">
                      <div class="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 ${colors.bg} rounded-full border-4 border-white dark:border-gray-900 flex items-center justify-center shadow-lg transform group-hover:scale-125 transition-all duration-300 cursor-pointer">
                        <svg class="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${item.icon}"/>
                        </svg>
                      </div>
                    </div>
                    <!-- Right side content (even items) -->
                    <div class="flex-1 md:text-left md:pl-8">
                      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-5 border-l-4 md:border-l-0 md:border-r-0 md:border-l-4 ${colors.border} hover:shadow-xl transition-shadow duration-300">
                        <div class="flex items-center gap-2 mb-2">
                          <span class="text-xs font-semibold ${colors.text} ${colors.textDark} ${colors.bgLight} ${colors.bgDark} px-2 py-1 rounded">${item.date}</span>
                          <span class="text-xs text-gray-500 dark:text-gray-400">${item.year}</span>
                          ${item.label ? `<span class="text-xs text-gray-400 dark:text-gray-500 italic">${item.label}</span>` : ''}
                        </div>
                        <h3 class="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2">${item.title}</h3>
                        <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-300">${item.description}</p>
                      </div>
                    </div>
                  ` : `
                    <!-- Left side content (odd items) -->
                    <div class="flex-1 md:text-right md:pr-8">
                      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-5 border-l-4 md:border-l-0 md:border-r-4 ${colors.border} hover:shadow-xl transition-shadow duration-300">
                        <div class="flex items-center gap-2 mb-2 md:justify-end">
                          <span class="text-xs font-semibold ${colors.text} ${colors.textDark} ${colors.bgLight} ${colors.bgDark} px-2 py-1 rounded">${item.date}</span>
                          <span class="text-xs text-gray-500 dark:text-gray-400">${item.year}</span>
                          ${item.label ? `<span class="text-xs text-gray-400 dark:text-gray-500 italic">${item.label}</span>` : ''}
                        </div>
                        <h3 class="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2">${item.title}</h3>
                        <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-300">${item.description}</p>
                      </div>
                    </div>
                    <!-- Timeline dot -->
                    <div class="relative z-10 flex-shrink-0">
                      <div class="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 ${colors.bg} rounded-full border-4 border-white dark:border-gray-900 flex items-center justify-center shadow-lg transform group-hover:scale-125 transition-all duration-300 cursor-pointer">
                        <svg class="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${item.icon}"/>
                        </svg>
                      </div>
                    </div>
                    <!-- Right side spacer (odd items) -->
                    <div class="flex-1 hidden md:block"></div>
                  `}
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    </div>
    <style>
      /* Timeline Toggle Button Animations */
      .timeline-toggle-btn {
        animation: pulse-glow 2s ease-in-out infinite;
      }
      
      .timeline-toggle-btn:hover {
        animation: none;
        box-shadow: 0 0 20px rgba(37, 99, 235, 0.6);
      }
      
      @keyframes pulse-glow {
        0%, 100% {
          box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.7);
        }
        50% {
          box-shadow: 0 0 0 8px rgba(37, 99, 235, 0);
        }
      }
      
      /* Timeline Container Animations */
      #timeline-container {
        max-height: 0;
        opacity: 0;
        overflow: hidden;
        transition: max-height 0.6s ease-in-out, opacity 0.5s ease-in-out, margin-bottom 0.3s ease-in-out, padding-top 0.3s ease-in-out, padding-bottom 0.3s ease-in-out;
        margin-bottom: 0;
        padding-top: 0;
        padding-bottom: 0;
        display: block;
      }
      
      #timeline-container.show {
        max-height: 20000px !important;
        opacity: 1 !important;
        margin-bottom: 2rem !important;
        padding-top: 2rem !important;
        padding-bottom: 2rem !important;
      }
      
      .timeline-container .timeline-item {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.5s ease-out, transform 0.5s ease-out;
      }
      
      .timeline-container.show .timeline-item {
        opacity: 1;
        transform: translateY(0);
      }
      
      /* Stagger animation for timeline items */
      .timeline-container.show .timeline-item:nth-child(1) { transition-delay: 0.1s; }
      .timeline-container.show .timeline-item:nth-child(2) { transition-delay: 0.15s; }
      .timeline-container.show .timeline-item:nth-child(3) { transition-delay: 0.2s; }
      .timeline-container.show .timeline-item:nth-child(4) { transition-delay: 0.25s; }
      .timeline-container.show .timeline-item:nth-child(5) { transition-delay: 0.3s; }
      .timeline-container.show .timeline-item:nth-child(6) { transition-delay: 0.35s; }
      .timeline-container.show .timeline-item:nth-child(7) { transition-delay: 0.4s; }
      .timeline-container.show .timeline-item:nth-child(8) { transition-delay: 0.45s; }
      .timeline-container.show .timeline-item:nth-child(9) { transition-delay: 0.5s; }
      .timeline-container.show .timeline-item:nth-child(10) { transition-delay: 0.55s; }
      .timeline-container.show .timeline-item:nth-child(11) { transition-delay: 0.6s; }
      .timeline-container.show .timeline-item:nth-child(12) { transition-delay: 0.65s; }
      .timeline-container.show .timeline-item:nth-child(13) { transition-delay: 0.7s; }
      
      /* Icon rotation animation */
      .timeline-toggle-btn[aria-expanded="true"] #timeline-toggle-icon {
        transform: rotate(180deg);
      }
    </style>
  `;
}
