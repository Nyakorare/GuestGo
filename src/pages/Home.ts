import { setupEventListeners, setupConfirmationModalListeners } from '../components/ModalFunctions';
import supabase from '../config/supabase';
import { loadPlaces } from './dashboard/index';
import { FAQ } from '../components/mini-features/home/FAQ';
import { Footer } from '../components/mini-features/Footer';
import { initWorkflowTabAnimation } from '../components/mini-features/home/WorkflowTabAnimation';
import { VisitorWorkflow, GuestWorkflow } from '../components/mini-features/home/VisitorWorkflow';
import { PersonnelWorkflow } from '../components/mini-features/home/PersonnelWorkflow';
import { AdminWorkflow } from '../components/mini-features/home/AdminWorkflow';
import { LogsWorkflow } from '../components/mini-features/home/LogsWorkflow';
import { GuardWorkflow } from '../components/mini-features/home/GuardWorkflow';

// Helper function to get current Philippine time
function getPhilippineTime(): Date {
  const now = new Date();
  // Get the timezone offset between UTC and Asia/Manila (UTC+8)
  const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
  const philippineTime = new Date(utcTime + (8 * 60 * 60 * 1000)); // Add 8 hours for UTC+8
  return philippineTime;
}

// Helper function to get Philippine date (date only)
function getPhilippineDate(): Date {
  const philippineTime = getPhilippineTime();
  philippineTime.setHours(0, 0, 0, 0);
  return philippineTime;
}

// Helper function to convert any date to Philippine time
function toPhilippineTime(date: Date): Date {
  // Get the timezone offset between UTC and Asia/Manila (UTC+8)
  const utcTime = date.getTime() + (date.getTimezoneOffset() * 60000);
  const philippineTime = new Date(utcTime + (8 * 60 * 60 * 1000)); // Add 8 hours for UTC+8
  return philippineTime;
}

// Function to load and display weekly visit count for logged-in users
// FIXED: Previous week completed visits no longer affect current week scheduling limits
// Each week is now treated independently with its own 2-visit limit
async function loadWeeklyVisitCount(_userEmail: string) {
  try {
    const weeklyVisitCountDiv = document.getElementById('weeklyVisitCount');
    const weeklyVisitText = document.getElementById('weeklyVisitText');
    
    if (!weeklyVisitCountDiv || !weeklyVisitText) return;

    // Prevent rapid successive calls
    const now = Date.now();
    if (weeklyVisitCountDiv.dataset.lastRefresh) {
      const lastRefresh = parseInt(weeklyVisitCountDiv.dataset.lastRefresh);
      if (now - lastRefresh < 500) { // Prevent refreshes more than once every 500ms
        return;
      }
    }
    weeklyVisitCountDiv.dataset.lastRefresh = now.toString();

    // Check if user has visitor role
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      
      // Only show weekly visit count for visitor roles
      if (roleData?.role !== 'visitor') {
        weeklyVisitCountDiv.classList.add('hidden');
        return;
      }
    } catch (error) {
      console.error('Error checking user role for weekly visit count:', error);
      weeklyVisitCountDiv.classList.add('hidden');
      return;
    }

    // Show the weekly visit count section
    weeklyVisitCountDiv.classList.remove('hidden');
    weeklyVisitText.textContent = 'Loading...';

    // Get current Philippine date from database
    let philippineToday: Date;
    try {
      const { data: philippineDateData, error } = await supabase.rpc('get_philippine_date');
      if (error) {
        console.error('Error getting Philippine date from DB:', error);
        philippineToday = getPhilippineDate();
      } else {
        philippineToday = new Date(philippineDateData);
      }
    } catch (error) {
      console.error('Exception getting Philippine date from DB:', error);
      philippineToday = getPhilippineDate();
    }
    
    // Calculate the week boundaries (Sunday to Saturday)
    // Use a more robust method to ensure correct week calculation
    const weekStart = new Date(philippineToday);
    const dayOfWeek = weekStart.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const daysToSubtract = dayOfWeek; // Days to go back to Sunday
    weekStart.setDate(philippineToday.getDate() - daysToSubtract);
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // Calculate previous week boundaries
    const prevWeekStart = new Date(weekStart);
    prevWeekStart.setDate(weekStart.getDate() - 7);
    prevWeekStart.setHours(0, 0, 0, 0);
    const prevWeekEnd = new Date(prevWeekStart);
    prevWeekEnd.setDate(prevWeekStart.getDate() + 6);
    prevWeekEnd.setHours(23, 59, 59, 999);

    // Calculate next week boundaries
    const nextWeekStart = new Date(weekStart);
    nextWeekStart.setDate(weekStart.getDate() + 7);
    nextWeekStart.setHours(0, 0, 0, 0);
    const nextWeekEnd = new Date(nextWeekStart);
    nextWeekEnd.setDate(nextWeekStart.getDate() + 6);
    nextWeekEnd.setHours(23, 59, 59, 999);

    // Calculate end of current month
    const endOfMonth = new Date(philippineToday.getFullYear(), philippineToday.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    // Query the database for all pending, completed, and completed_flagged visits for the current week
    // Only include visits that are within the current week boundaries (Sunday to Saturday)
    // This ensures that completed visits from previous weeks are not counted in the current week
    // Check both by user ID and email to handle cases where user_id might be null
    
    // Convert week boundaries to date strings for database query (YYYY-MM-DD format)
    const weekStartStr = weekStart.toISOString().split('T')[0];
    const weekEndStr = weekEnd.toISOString().split('T')[0];
    
    // DEBUGGING APPROACH: Get all visits first, then filter in JavaScript
    // This helps us see exactly what dates are being returned and why the filtering might be failing
    // The issue might be timezone differences between database storage and query comparison
    const { data: allUserVisits, error: allUserError } = await supabase
      .from('scheduled_visits')
      .select('visit_date, status')
      .or(`visitor_user_id.eq.${user.id},visitor_email.eq.${user.email}`)
      .in('status', ['pending', 'in_progress', 'completed', 'completed_flagged', 'temporary_exit']);

    if (allUserError) {
      console.error('Error loading all user visits:', allUserError);
      return;
    }

    // Filter visits in JavaScript to ensure proper date comparison
    // This bypasses any potential database timezone issues and gives us full control over date logic
    const visits = allUserVisits?.filter(visit => {
      const visitDate = new Date(visit.visit_date);
      const isInCurrentWeek = visitDate >= weekStart && visitDate <= weekEnd;
      
      return isInCurrentWeek;
    }) || [];

    // Query for ALL pending visits (including future weeks) for this user
    const { data: allPendingVisits, error: allPendingError } = await supabase
      .from('scheduled_visits')
      .select('visit_date, status')
      .or(`visitor_user_id.eq.${user.id},visitor_email.eq.${user.email}`)
      .eq('status', 'pending');

    // Debug: Also get all visits for this user to see what's in the database
    const { data: allVisits } = await supabase
      .from('scheduled_visits')
      .select('visit_date, status, visitor_first_name, visitor_last_name, visitor_email, visitor_user_id')
      .or(`visitor_user_id.eq.${user.id},visitor_email.eq.${user.email}`)
      .order('visit_date', { ascending: true });

    // Query the database for all pending, completed, and completed_flagged visits for the previous week
    const { data: _prevWeekVisits, error: prevWeekError } = await supabase
      .from('scheduled_visits')
      .select('visit_date, status')
      .or(`visitor_user_id.eq.${user.id},visitor_email.eq.${user.email}`)
      .in('status', ['pending', 'in_progress', 'completed', 'completed_flagged', 'temporary_exit'])
      .gte('visit_date', prevWeekStart.toISOString())
      .lte('visit_date', prevWeekEnd.toISOString());

    // Query for future schedules (next week and beyond within the month)
    // Future visits should only be pending, not completed
    const { data: futureVisits, error: futureError } = await supabase
      .from('scheduled_visits')
      .select('visit_date, status')
      .or(`visitor_user_id.eq.${user.id},visitor_email.eq.${user.email}`)
      .eq('status', 'pending')
      .gte('visit_date', nextWeekStart.toISOString())
      .lte('visit_date', endOfMonth.toISOString());

    if (allUserError) {
      console.error('Error loading weekly visit count:', allUserError);
      weeklyVisitText.textContent = 'Error loading visit count';
      return;
    }
    if (allPendingError) {
      console.error('Error loading all pending visits:', allPendingError);
    }
    if (prevWeekError) {
      console.error('Error loading previous week visits:', prevWeekError);
    }
    if (futureError) {
      console.error('Error loading future visits:', futureError);
    }

    // Count the pending, completed, and completed_flagged visits for the current week
    const visitCount = visits?.length || 0;
    const pendingCount = visits?.filter(v => v.status === 'pending').length || 0;
    const inProgressCount = visits?.filter(v => v.status === 'in_progress').length || 0;
    const temporaryExitCount = visits?.filter(v => v.status === 'temporary_exit').length || 0;
    const completedCount = visits?.filter(v => v.status === 'completed').length || 0;
    const completedFlaggedCount = visits?.filter(v => v.status === 'completed_flagged').length || 0;
    const activeCountThisWeek = pendingCount + inProgressCount + temporaryExitCount;

    // Count ALL pending visits (including future weeks)
    const totalPendingCount = allPendingVisits?.length || 0;

    // Count the pending, completed, and completed_flagged visits for the previous week
    // Previous-week metrics available if needed for future UI
    // const prevPendingCount = prevWeekVisits?.filter(v => v.status === 'pending').length || 0;
    // const prevCompletedCount = prevWeekVisits?.filter(v => v.status === 'completed').length || 0;
    // const prevCompletedFlaggedCount = prevWeekVisits?.filter(v => v.status === 'completed_flagged').length || 0;
    // const prevTotalCount = prevWeekVisits?.length || 0;

    // Count future visits (all future visits are pending since they haven't happened yet)
    const futureVisitCount = futureVisits?.length || 0;
    
    // Calculate total pending schedules (ALL pending visits, including future weeks)
    const totalPendingSchedules = totalPendingCount;
    
    // Calculate total completed visits for current week only
    const totalCompletedSchedules = completedCount + completedFlaggedCount;
    
    // Calculate total visits for current week only (within week boundaries)
    // This ensures that completed visits from previous weeks are not counted
    // as part of the current week's visit limit
    const totalWeekVisits = visitCount;
    
    // NEW: Calculate weekly visit counts for all weeks that have pending schedules
    // This will help users understand their scheduling status across all weeks
    const weeklyVisitCounts = new Map();
    
    // Process all pending visits to group them by week
    if (allPendingVisits) {
      allPendingVisits.forEach(visit => {
        const visitDate = new Date(visit.visit_date);
        const weekStart = new Date(visitDate);
        const dayOfWeek = weekStart.getDay();
        const daysToSubtract = dayOfWeek;
        weekStart.setDate(visitDate.getDate() - daysToSubtract);
        weekStart.setHours(0, 0, 0, 0);
        
        const weekKey = weekStart.toISOString().split('T')[0];
        
        if (!weeklyVisitCounts.has(weekKey)) {
          weeklyVisitCounts.set(weekKey, {
            weekStart: weekStart,
            pending: 0,
            completed: 0,
            completedFlagged: 0,
            total: 0
          });
        }
        
        const weekData = weeklyVisitCounts.get(weekKey);
        if (visit.status === 'pending') {
          weekData.pending++;
        } else if (visit.status === 'completed') {
          weekData.completed++;
        } else if (visit.status === 'completed_flagged') {
          weekData.completedFlagged++;
        }
        weekData.total++;
      });
    }
    
    // Also add current week completed visits to the map
    if (visits) {
      const currentWeekKey = weekStart.toISOString().split('T')[0];
      if (!weeklyVisitCounts.has(currentWeekKey)) {
        weeklyVisitCounts.set(currentWeekKey, {
          weekStart: weekStart,
          pending: 0,
          completed: 0,
          completedFlagged: 0,
          total: 0
        });
      }
      
      const currentWeekData = weeklyVisitCounts.get(currentWeekKey);
      visits.forEach(visit => {
        if (visit.status === 'pending' || visit.status === 'in_progress') {
          currentWeekData.pending++;
        } else if (visit.status === 'completed') {
          currentWeekData.completed++;
        } else if (visit.status === 'completed_flagged') {
          currentWeekData.completedFlagged++;
        }
        currentWeekData.total++;
      });
    }

    // NEW LOGIC: Current week visits determine the limit, previous week visits don't affect current week
    // Calculate remaining visits for this week (based on current week visits only)
    // This ensures that completed visits from previous weeks don't limit current week scheduling
    const remainingVisits = Math.max(0, 2 - totalWeekVisits);
    
    // Previous week visits are tracked for reference but don't affect current week scheduling
    // The key change: previous week completed visits no longer reduce current week available slots
    // 
    // Example: If you have a completed visit on August 16 (previous week) and today is August 20,
    // the current week (Aug 17-23) should show 2 visits remaining, not 1

    // Format the week range for display (e.g., July 6-12, 2025)
    const weekStartMonth = weekStart.toLocaleString('en-US', { month: 'short' });
    const weekStartDay = weekStart.getDate();
    const weekEndMonth = weekEnd.toLocaleString('en-US', { month: 'short' });
    const weekEndDay = weekEnd.getDate();
    const weekYear = weekEnd.getFullYear();
    let weekRangeStr = '';
    if (weekStartMonth === weekEndMonth) {
      weekRangeStr = `${weekStartMonth} ${weekStartDay}-${weekEndDay}, ${weekYear}`;
    } else {
      weekRangeStr = `${weekStartMonth} ${weekStartDay} - ${weekEndMonth} ${weekEndDay}, ${weekYear}`;
    }

    // Update the display based on the count and week range
    let statusHtml = '';
    let additionalInfo = '';
    const scheduleNowBtn = document.getElementById('scheduleNowBtn');
    
    // Create comprehensive weekly status display
    // removed unused weeklyStatusHtml
    
    // Sort weeks by date (current week first, then future weeks)
    const sortedWeeks = Array.from(weeklyVisitCounts.entries()).sort(([a], [b]) => {
      const dateA = new Date(a);
      const dateB = new Date(b);
      return dateA.getTime() - dateB.getTime();
    });
    
    // Display current week status
    const currentWeekKey = weekStart.toISOString().split('T')[0];
    // const currentWeekData = weeklyVisitCounts.get(currentWeekKey);
    
    if (remainingVisits === 2) {
      const completedText = completedFlaggedCount > 0 ? `${totalCompletedSchedules} completed (${completedFlaggedCount} flagged)` : `${totalCompletedSchedules} completed`;
      statusHtml = `<span class="font-medium text-green-600 dark:text-green-400">2 visits remaining</span> (${activeCountThisWeek} active this week, ${completedText})`;
      if (scheduleNowBtn) {
        scheduleNowBtn.removeAttribute('disabled');
        scheduleNowBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        scheduleNowBtn.title = '';
      }
    } else if (remainingVisits === 1) {
      const completedText = completedFlaggedCount > 0 ? `${totalCompletedSchedules} completed (${completedFlaggedCount} flagged)` : `${totalCompletedSchedules} completed`;
      statusHtml = `<span class="font-medium text-yellow-600 dark:text-yellow-400">1 visit remaining</span> (${activeCountThisWeek} active this week, ${completedText})`;
      if (scheduleNowBtn) {
        scheduleNowBtn.removeAttribute('disabled');
        scheduleNowBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        scheduleNowBtn.title = '';
      }
    } else {
      const completedText = completedFlaggedCount > 0 ? `${totalCompletedSchedules} completed (${completedFlaggedCount} flagged)` : `${totalCompletedSchedules} completed`;
      statusHtml = `<span class="font-medium text-red-600 dark:text-red-400">No visits remaining</span> (${activeCountThisWeek} active this week, ${completedText})`;
      if (scheduleNowBtn) {
        scheduleNowBtn.setAttribute('disabled', 'true');
        scheduleNowBtn.classList.add('opacity-50', 'cursor-not-allowed');
        scheduleNowBtn.title = 'You have reached your weekly visit limit.';
      }
    }

    // Add information about future weeks with pending schedules
    const futureWeeksWithSchedules = sortedWeeks.filter(([weekKey]) => weekKey !== currentWeekKey);
    if (futureWeeksWithSchedules.length > 0) {
      additionalInfo = '<div class="mt-2 text-xs text-gray-600 dark:text-gray-400">';
      additionalInfo += '<strong>Future weeks with schedules:</strong><br>';
      
      futureWeeksWithSchedules.forEach(([weekKey, weekData]) => {
        const weekStartDate = new Date(weekKey);
        const weekEndDate = new Date(weekStartDate);
        weekEndDate.setDate(weekStartDate.getDate() + 6);
        
        const weekStartMonth = weekStartDate.toLocaleString('en-US', { month: 'short' });
        const weekStartDay = weekStartDate.getDate();
        const weekEndMonth = weekEndDate.toLocaleString('en-US', { month: 'short' });
        const weekEndDay = weekEndDate.getDate();
        const weekYear = weekEndDate.getFullYear();
        
        let weekRangeStr = '';
        if (weekStartMonth === weekEndMonth) {
          weekRangeStr = `${weekStartMonth} ${weekStartDay}-${weekEndDay}, ${weekYear}`;
        } else {
          weekRangeStr = `${weekStartMonth} ${weekStartDay} - ${weekEndMonth} ${weekEndDay}, ${weekYear}`;
        }
        
        const remainingInWeek = Math.max(0, 2 - weekData.total);
        const statusColor = remainingInWeek === 2 ? 'text-green-600' : remainingInWeek === 1 ? 'text-yellow-600' : 'text-red-600';
        
        additionalInfo += `• Week of ${weekRangeStr}: <span class="${statusColor}">${remainingInWeek} visits remaining</span> (${weekData.pending} pending)<br>`;
      });
      
      additionalInfo += '</div>';
    }

    weeklyVisitText.innerHTML = `<span class="block font-semibold">Week of ${weekRangeStr}</span>${statusHtml}${additionalInfo}`;

    // Add a small note about the limit - be more specific to avoid duplicates
    const existingNote = weeklyVisitCountDiv.querySelector('.visit-limit-note');
    if (existingNote) {
      existingNote.remove();
    }
    
    const noteElement = document.createElement('div');
    noteElement.className = 'mt-1 text-xs text-blue-600 dark:text-blue-400 visit-limit-note';
    noteElement.textContent = 'Maximum 2 visits per week per user account';
    
    weeklyVisitCountDiv.querySelector('.ml-3')?.appendChild(noteElement);

  } catch (error) {
    console.error('Error in loadWeeklyVisitCount:', error);
    const weeklyVisitText = document.getElementById('weeklyVisitText');
    if (weeklyVisitText) {
      weeklyVisitText.textContent = 'Error loading visit count';
    }
  }
}

// Global function to refresh weekly visit count (can be called from other components)
(window as any).refreshWeeklyVisitCount = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !user.email) return;

    // Check if user has visitor role
    try {
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      
      // Only refresh weekly visit count for visitor roles
      if (roleData?.role !== 'visitor') {
        return;
      }
    } catch (error) {
      console.error('Error checking user role for refresh:', error);
      return;
    }

    await loadWeeklyVisitCount(user.email);
  } catch (error) {
    console.error('Error refreshing weekly visit count:', error);
  }
};

// Global function to update schedule button visibility (can be called when auth state changes)
(window as any).updateScheduleButtonVisibility = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const scheduleNowBtn = document.getElementById('scheduleNowBtn');
    const scheduleEmail = document.getElementById('scheduleEmail') as HTMLInputElement;
    const emailVerificationSection = document.getElementById('emailVerificationSection');
    const weeklyVisitCountDiv = document.getElementById('weeklyVisitCount');
    
    if (!scheduleNowBtn) return;
    
    if (user) {
      // Check if user has visitor role
      try {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();
        
        // Only show schedule button for visitor roles
        if (roleData?.role === 'visitor') {
          scheduleNowBtn.classList.remove('hidden');
          // Load and display weekly visit count for visitor users
          await loadWeeklyVisitCount(user.email || '');
        } else {
          // Hide schedule button for non-visitor roles (admin, personnel, etc.)
          scheduleNowBtn.classList.add('hidden');
          // Hide weekly visit count for non-visitor roles
          if (weeklyVisitCountDiv) {
            weeklyVisitCountDiv.classList.add('hidden');
          }
        }
      } catch (error) {
        console.error('Error checking user role:', error);
        // Hide schedule button if role check fails
        scheduleNowBtn.classList.add('hidden');
      }
      
      // Update email field for logged-in users
      if (scheduleEmail && emailVerificationSection) {
        scheduleEmail.value = user.email || '';
        scheduleEmail.readOnly = true;
        emailVerificationSection.classList.add('hidden');
      }
    } else {
      // User is not logged in, show the button for guest scheduling
      scheduleNowBtn.classList.remove('hidden');
      
      // Reset email field for guest users
      if (scheduleEmail && emailVerificationSection) {
        scheduleEmail.value = '';
        scheduleEmail.readOnly = false;
        emailVerificationSection.classList.remove('hidden');
      }
      
      // Hide weekly visit count for guest users
      if (weeklyVisitCountDiv) {
        weeklyVisitCountDiv.classList.add('hidden');
      }
    }
    
    // Avoid re-attaching modal listeners here; initial setup happens on page init
  } catch (error) {
    console.error('Error updating schedule button visibility:', error);
  }
};

// Test function to debug weekly visit count
(window as any).testWeeklyVisitCount = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return;
    }

    // Test 1: Get all visits for this user
    const { data: allVisits, error: _allError } = await supabase
      .from('scheduled_visits')
      .select('*')
      .eq('visitor_user_id', user.id);

    // Test 2: Get pending and completed visits for this user
    const { data: activeVisits, error: _activeError } = await supabase
      .from('scheduled_visits')
      .select('*')
      .eq('visitor_user_id', user.id)
      .in('status', ['pending', 'completed', 'completed_flagged']);

    // Test 3: Get pending visits for this user
    const { data: pendingVisits, error: _pendingError } = await supabase
      .from('scheduled_visits')
      .select('*')
      .eq('visitor_user_id', user.id)
      .eq('status', 'pending');

    // Test 4: Get completed visits for this user
    const { data: completedVisits, error: _completedError } = await supabase
      .from('scheduled_visits')
      .select('*')
      .eq('visitor_user_id', user.id)
      .eq('status', 'completed');

    // Test 5: Check if there are any visits at all in the database
    const { data: anyVisits, error: _anyError } = await supabase
      .from('scheduled_visits')
      .select('*')
      .limit(5);

    // Test 6: Calculate remaining visits
    const activeCount = activeVisits?.length || 0;
    const pendingCount = pendingVisits?.length || 0;
    const completedCount = completedVisits?.length || 0;
    const remainingVisits = Math.max(0, 2 - activeCount);

  } catch (error) {
    console.error('Error in test:', error);
  }
};

// Test function to manually trigger schedule modal
(window as any).testScheduleModal = () => {
  const scheduleNowBtn = document.getElementById('scheduleNowBtn');
  const scheduleModal = document.getElementById('scheduleModal');
  
  // Try to manually open the modal
  if (scheduleModal) {
    scheduleModal.classList.remove('hidden');
  }
};

// Test function to debug week boundary calculation
(window as any).testWeekBoundaries = () => {
  // Test with a known date (e.g., August 20, 2025 - a Wednesday)
  const testDate = new Date('2025-08-20');
  
  // Calculate week boundaries
  const dayOfWeek = testDate.getDay();
  const daysToSubtract = dayOfWeek;
  const weekStart = new Date(testDate);
  weekStart.setDate(testDate.getDate() - daysToSubtract);
  weekStart.setHours(0, 0, 0, 0);
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  
  // Test if August 16 (previous week) falls outside current week
  const aug16 = new Date('2025-08-16');
  const isInCurrentWeek = aug16 >= weekStart && aug16 <= weekEnd;
};

// Test function to debug the specific issue with August 16 visit
(window as any).testAugust16Issue = () => {
  // Simulate the exact scenario: today is August 20, 2025
  const today = new Date('2025-08-20');
  
  // Calculate week boundaries for August 17-23
  const dayOfWeek = today.getDay(); // 3 (Wednesday)
  const daysToSubtract = dayOfWeek; // 3
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - daysToSubtract);
  weekStart.setHours(0, 0, 0, 0);
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  
  // Test the problematic date: August 16
  const aug16 = new Date('2025-08-16');
  const aug16Str = aug16.toISOString().split('T')[0];
};

// Global function to open schedule modal (called from inline onclick)
(window as any).openScheduleModal = async () => {
  const btn = document.getElementById('scheduleNowBtn');
  if (btn && btn.hasAttribute('disabled')) {
    // Optionally show a message here
    return;
  }
  
  
  // Check if user is logged in and has visitor role
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    // Check if user has visitor role
    try {
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      
      if (roleData?.role !== 'visitor') {
        alert('Only visitors can schedule visits. Please contact an administrator if you need access.');
        return;
      }
    } catch (error) {
      console.error('Error checking user role:', error);
      alert('Error checking user permissions. Please try again.');
      return;
    }
  }
  
  const modal = document.getElementById('scheduleModal');
  if (modal) {
    modal.classList.remove('hidden');
    // Initialize date validation when modal opens
    if ((window as any).initializeDateValidation) {
      (window as any).initializeDateValidation();
    }
    // Ensure purpose field and visit date are disabled when modal opens
    if ((window as any).updatePurposeFieldState) {
      (window as any).updatePurposeFieldState();
    }
    if ((window as any).updateVisitDateFieldState) {
      await (window as any).updateVisitDateFieldState();
    }
  }
};

export function HomePage() {
  // Initialize the page
  setTimeout(async () => {
    // Set minimum date to today and maximum date to one month from today (Philippine time from database)
    let philippineToday: Date;
    let philippineMaxDate: Date;
    
    try {
      const { data: philippineDateData, error } = await supabase.rpc('get_philippine_date');
      if (error) {
        console.error('Error getting Philippine date from DB:', error);
        // Fallback to local calculation
        philippineToday = getPhilippineDate();
      } else {
        philippineToday = new Date(philippineDateData);
      }
    } catch (error) {
      console.error('Exception getting Philippine date from DB:', error);
      // Fallback to local calculation
      philippineToday = getPhilippineDate();
    }
    
    philippineMaxDate = new Date(philippineToday);
    philippineMaxDate.setMonth(philippineMaxDate.getMonth() + 1);
    
    const visitDateInput = document.getElementById('visitDate') as HTMLInputElement;
    if (visitDateInput) {
      // Initialize as disabled until place is selected
      visitDateInput.disabled = true;
      visitDateInput.classList.add('disabled:bg-gray-100', 'dark:disabled:bg-gray-800', 'disabled:cursor-not-allowed', 'disabled:opacity-50');
      // Set minimum date to today (Philippine time) - will be updated when purpose is selected
      visitDateInput.min = philippineToday.toISOString().split('T')[0];
      // Set maximum date to one month from today
      visitDateInput.max = philippineMaxDate.toISOString().split('T')[0];
      
      // Don't set default value - wait for place selection
      
      // Single consolidated event listener for date validation
      visitDateInput.addEventListener('change', async () => {
        const selectedDate = new Date(visitDateInput.value);
        selectedDate.setHours(0, 0, 0, 0);
        const philippineSelectedDate = toPhilippineTime(selectedDate);
        philippineSelectedDate.setHours(0, 0, 0, 0);
        
        // Get current Philippine date from database for real-time validation
        let currentPhilippineDate: Date;
        try {
          const { data: currentDateData, error } = await supabase.rpc('get_philippine_date');
          if (error) {
            console.error('Error getting current Philippine date from DB:', error);
            currentPhilippineDate = getPhilippineDate();
          } else {
            currentPhilippineDate = new Date(currentDateData);
          }
        } catch (error) {
          console.error('Exception getting current Philippine date from DB:', error);
          currentPhilippineDate = getPhilippineDate();
        }
        
        // Normalize current date to start of day for comparison
        currentPhilippineDate.setHours(0, 0, 0, 0);
        
        // Check if date is in the past (excluding today)
        if (philippineSelectedDate.getTime() < currentPhilippineDate.getTime()) {
          alert('Cannot schedule visits for past dates. Please select today or a future date.');
          visitDateInput.value = currentPhilippineDate.toISOString().split('T')[0];
          return;
        }
        
        // Check if date is more than 1 month in the future
        const currentMaxDate = new Date(currentPhilippineDate);
        currentMaxDate.setMonth(currentMaxDate.getMonth() + 1);
        
        if (philippineSelectedDate.getTime() > currentMaxDate.getTime()) {
          alert('Cannot schedule visits more than 1 month in advance. Please select a date within the next month.');
          visitDateInput.value = currentMaxDate.toISOString().split('T')[0];
          return;
        }

        // Update place availability based on the selected date
        try {
          const { updatePlaceAvailabilityForDate } = await import('../components/ModalFunctions');
          await updatePlaceAvailabilityForDate(visitDateInput.value);
        } catch (error) {
          console.error('Error updating place availability for date:', error);
        }
      });
    }

    // Update schedule button visibility based on auth state and user role
    await (window as any).updateScheduleButtonVisibility();

    // Load available places
    await loadPlaces();
    
    // Setup event listeners after button visibility is updated
    setupEventListeners();
    
    // Setup confirmation modal event listeners
    setupConfirmationModalListeners();

    // Interactive: Feature cards hover animations for keyboard users
    document.querySelectorAll('.feature-card').forEach(el => {
      el.addEventListener('focus', () => el.classList.add('ring-2', 'ring-blue-500'));
      el.addEventListener('blur', () => el.classList.remove('ring-2', 'ring-blue-500'));
    });

    // Interactive: Workflow stepper toggles
    document.querySelectorAll('[data-workflow-step]').forEach(stepBtn => {
      stepBtn.addEventListener('click', () => {
        const step = (stepBtn as HTMLElement).dataset.workflowStep;
        if (!step) return;
        // Collapse others
        document.querySelectorAll('[data-workflow-panel]').forEach(panel => {
          const isTarget = (panel as HTMLElement).dataset.workflowPanel === step;
          (panel as HTMLElement).classList.toggle('hidden', !isTarget);
        });
        document.querySelectorAll('[data-workflow-step]').forEach(btn => {
          const isActive = (btn as HTMLElement).dataset.workflowStep === step;
          btn.classList.toggle('bg-blue-600', isActive);
          btn.classList.toggle('text-white', isActive);
          btn.classList.toggle('bg-white', !isActive);
          btn.classList.toggle('dark:bg-gray-800', !isActive);
          btn.classList.toggle('text-blue-600', !isActive);
          btn.classList.toggle('dark:text-blue-400', !isActive);
          btn.classList.toggle('border', !isActive);
          btn.classList.toggle('border-blue-200', !isActive);
          btn.classList.toggle('dark:border-gray-700', !isActive);
        });
      });
    });

    // Interactive: FAQ accordion
    document.querySelectorAll('[data-faq-toggle]').forEach(toggle => {
      toggle.addEventListener('click', () => {
        const id = (toggle as HTMLElement).dataset.faqToggle;
        if (!id) return;
        const panel = document.querySelector(`[data-faq-panel="${id}"]`) as HTMLElement;
        const faqItem = (toggle as HTMLElement).closest('.faq-item');
        if (!panel || !faqItem) return;
        
        // Toggle panel visibility with smooth animation
        const isHidden = panel.classList.contains('hidden');
        const icon = (toggle as HTMLElement).querySelector('[data-faq-icon]');
        
        if (isHidden) {
          // Open
          panel.classList.remove('hidden');
          // Set max-height to scrollHeight for smooth expansion
          panel.style.maxHeight = panel.scrollHeight + 'px';
          faqItem.classList.add('active');
          if (icon) {
            icon.classList.add('rotate-180');
          }
        } else {
          // Close
          panel.style.maxHeight = '0';
          faqItem.classList.remove('active');
          if (icon) {
            icon.classList.remove('rotate-180');
          }
          // Add hidden class after animation completes
          setTimeout(() => {
            if (panel.style.maxHeight === '0px') {
              panel.classList.add('hidden');
            }
          }, 300);
        }
      });
    });

    // Personalize hero and CTA based on auth state and role
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const heroTitle = document.getElementById('heroTitle');
      const heroSubtitle = document.getElementById('heroSubtitle');
      const scheduleNowBtn = document.getElementById('scheduleNowBtn');
      
      let userRole = null;
      if (user) {
        try {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .single();
          userRole = roleData?.role || null;
        } catch (e) {
          // ignore role fetch errors
        }
      }
      
      if (user && userRole) {
        const firstName = (user.user_metadata && (user.user_metadata.first_name || user.user_metadata.firstName)) || '';
        
        if (userRole === 'visitor') {
          if (heroTitle) heroTitle.textContent = firstName ? `Welcome back, ${firstName}` : 'Welcome back to GuestGo';
          if (heroSubtitle) heroSubtitle.textContent = 'Manage your visits, track status, and plan ahead.';
          if (scheduleNowBtn) {
            scheduleNowBtn.textContent = 'Schedule Another Visit';
            scheduleNowBtn.onclick = () => (window as any).openScheduleModal();
          }
        } else if (userRole === 'personnel') {
          if (heroTitle) heroTitle.textContent = firstName ? `Welcome, ${firstName}` : 'Welcome to GuestGo';
          if (heroSubtitle) heroSubtitle.textContent = 'Scan QR codes, manage visits, and track guest arrivals.';
          if (scheduleNowBtn) {
            scheduleNowBtn.textContent = 'Open QR Scanner';
            scheduleNowBtn.onclick = () => (window as any).navigateToPage('qr-scanner');
          }
        } else if (userRole === 'admin') {
          if (heroTitle) heroTitle.textContent = firstName ? `Welcome, ${firstName}` : 'Welcome to GuestGo';
          if (heroSubtitle) heroSubtitle.textContent = 'Manage the system, oversee visits, and configure settings.';
          if (scheduleNowBtn) {
            scheduleNowBtn.textContent = 'Open Dashboard';
            scheduleNowBtn.onclick = () => (window as any).navigateToPage('dashboard');
          }
        } else if (userRole === 'logs') {
          if (heroTitle) heroTitle.textContent = firstName ? `Welcome, ${firstName}` : 'Welcome to GuestGo';
          if (heroSubtitle) heroSubtitle.textContent = 'View system logs, monitor activities, and track system events.';
          if (scheduleNowBtn) {
            scheduleNowBtn.textContent = 'View Logs';
            scheduleNowBtn.onclick = () => (window as any).navigateToPage('logs');
          }
        }
      } else {
        if (heroTitle) heroTitle.textContent = 'Welcome to GuestGo';
        if (heroSubtitle) heroSubtitle.textContent = 'Schedule visits, verify guests, and track arrivals in real time.';
        if (scheduleNowBtn) scheduleNowBtn.textContent = 'Schedule Now';
      }
      
      // Update feature cards based on role
      const featureCardsContainer = document.getElementById('featureCards');
      if (featureCardsContainer) {
        let cardsHtml = '';
        
        if (user && userRole === 'visitor') {
          cardsHtml = `
            <div class="feature-card group rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 transition-shadow hover:shadow-md focus:outline-none" tabindex="0">
              <div class="flex items-center space-x-3">
                <div class="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                </div>
                <div>
                  <p class="font-semibold">Smart Scheduling</p>
                  <p class="text-xs text-gray-600 dark:text-gray-400">Limit-aware, timezone-accurate, fast.</p>
                </div>
              </div>
            </div>
            <div class="feature-card group rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 transition-shadow hover:shadow-md focus:outline-none" tabindex="0">
              <div class="flex items-center space-x-3">
                <div class="p-2 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>
                <div>
                  <p class="font-semibold">Secure Verification</p>
                  <p class="text-xs text-gray-600 dark:text-gray-400">Email code checks and approvals.</p>
                </div>
              </div>
            </div>
            <div class="feature-card group rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 transition-shadow hover:shadow-md focus:outline-none" tabindex="0">
              <div class="flex items-center space-x-3">
                <div class="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405M19 13V7a2 2 0 00-2-2h-4l-2-2H7a2 2 0 00-2 2v6m0 8h12"/></svg>
                </div>
                <div>
                  <p class="font-semibold">Real-time Tracking</p>
                  <p class="text-xs text-gray-600 dark:text-gray-400">Status updates and QR scanning.</p>
                </div>
              </div>
            </div>
          `;
        } else if (user && userRole === 'personnel') {
          cardsHtml = `
            <div class="feature-card group rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 transition-shadow hover:shadow-md focus:outline-none" tabindex="0">
              <div class="flex items-center space-x-3">
                <div class="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>
                <div>
                  <p class="font-semibold">QR Scanner</p>
                  <p class="text-xs text-gray-600 dark:text-gray-400">Quick check-in and verification.</p>
                </div>
              </div>
            </div>
            <div class="feature-card group rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 transition-shadow hover:shadow-md focus:outline-none" tabindex="0">
              <div class="flex items-center space-x-3">
                <div class="p-2 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
                </div>
                <div>
                  <p class="font-semibold">Visit Management</p>
                  <p class="text-xs text-gray-600 dark:text-gray-400">Track and manage guest visits.</p>
                </div>
              </div>
            </div>
            <div class="feature-card group rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 transition-shadow hover:shadow-md focus:outline-none" tabindex="0">
              <div class="flex items-center space-x-3">
                <div class="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                </div>
                <div>
                  <p class="font-semibold">Real-time Updates</p>
                  <p class="text-xs text-gray-600 dark:text-gray-400">Live visit status and notifications.</p>
                </div>
              </div>
            </div>
          `;
        } else if (user && userRole === 'admin') {
          cardsHtml = `
            <div class="feature-card group rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 transition-shadow hover:shadow-md focus:outline-none" tabindex="0">
              <div class="flex items-center space-x-3">
                <div class="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                </div>
                <div>
                  <p class="font-semibold">System Overview</p>
                  <p class="text-xs text-gray-600 dark:text-gray-400">Monitor all visits and activities.</p>
                </div>
              </div>
            </div>
            <div class="feature-card group rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 transition-shadow hover:shadow-md focus:outline-none" tabindex="0">
              <div class="flex items-center space-x-3">
                <div class="p-2 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/></svg>
                </div>
                <div>
                  <p class="font-semibold">System Settings</p>
                  <p class="text-xs text-gray-600 dark:text-gray-400">Configure gates, places, and users.</p>
                </div>
              </div>
            </div>
            <div class="feature-card group rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 transition-shadow hover:shadow-md focus:outline-none" tabindex="0">
              <div class="flex items-center space-x-3">
                <div class="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>
                <div>
                  <p class="font-semibold">User Management</p>
                  <p class="text-xs text-gray-600 dark:text-gray-400">Manage roles and permissions.</p>
                </div>
              </div>
            </div>
          `;
        } else if (user && userRole === 'logs') {
          cardsHtml = `
            <div class="feature-card group rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 transition-shadow hover:shadow-md focus:outline-none" tabindex="0">
              <div class="flex items-center space-x-3">
                <div class="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                </div>
                <div>
                  <p class="font-semibold">System Logs</p>
                  <p class="text-xs text-gray-600 dark:text-gray-400">View detailed system activity logs.</p>
                </div>
              </div>
            </div>
            <div class="feature-card group rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 transition-shadow hover:shadow-md focus:outline-none" tabindex="0">
              <div class="flex items-center space-x-3">
                <div class="p-2 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                </div>
                <div>
                  <p class="font-semibold">Activity Monitoring</p>
                  <p class="text-xs text-gray-600 dark:text-gray-400">Track user actions and system events.</p>
                </div>
              </div>
            </div>
            <div class="feature-card group rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 transition-shadow hover:shadow-md focus:outline-none" tabindex="0">
              <div class="flex items-center space-x-3">
                <div class="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
                </div>
                <div>
                  <p class="font-semibold">Audit Trail</p>
                  <p class="text-xs text-gray-600 dark:text-gray-400">Complete record of system changes.</p>
                </div>
              </div>
            </div>
          `;
        } else {
          // Default cards for non-logged in users
          cardsHtml = `
            <div class="feature-card group rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 transition-shadow hover:shadow-md focus:outline-none" tabindex="0">
              <div class="flex items-center space-x-3">
                <div class="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                </div>
                <div>
                  <p class="font-semibold">Smart Scheduling</p>
                  <p class="text-xs text-gray-600 dark:text-gray-400">Limit-aware, timezone-accurate, fast.</p>
                </div>
              </div>
            </div>
            <div class="feature-card group rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 transition-shadow hover:shadow-md focus:outline-none" tabindex="0">
              <div class="flex items-center space-x-3">
                <div class="p-2 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>
                <div>
                  <p class="font-semibold">Secure Verification</p>
                  <p class="text-xs text-gray-600 dark:text-gray-400">Email code checks and approvals.</p>
                </div>
              </div>
            </div>
            <div class="feature-card group rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 transition-shadow hover:shadow-md focus:outline-none" tabindex="0">
              <div class="flex items-center space-x-3">
                <div class="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405M19 13V7a2 2 0 00-2-2h-4l-2-2H7a2 2 0 00-2 2v6m0 8h12"/></svg>
                </div>
                <div>
                  <p class="font-semibold">Real-time Tracking</p>
                  <p class="text-xs text-gray-600 dark:text-gray-400">Status updates and QR scanning.</p>
                </div>
              </div>
            </div>
          `;
        }
        
        featureCardsContainer.innerHTML = cardsHtml;
      }
      
      // Update workflow steps and panels based on role
      const workflowStepsContainer = document.getElementById('workflowSteps');
      const workflowPanelsContainer = document.getElementById('workflowPanels');
      
      if (workflowStepsContainer && workflowPanelsContainer) {
        let stepsHtml = '';
        let panelsHtml = '';
        
        if (user && userRole === 'visitor') {
          const visitorWorkflow = VisitorWorkflow();
          stepsHtml = visitorWorkflow.steps;
          panelsHtml = visitorWorkflow.panels;
        } else if (user && userRole === 'personnel') {
          const personnelWorkflow = PersonnelWorkflow();
          stepsHtml = personnelWorkflow.steps;
          panelsHtml = personnelWorkflow.panels;
        } else if (user && userRole === 'guard') {
          const guardWorkflow = GuardWorkflow();
          stepsHtml = guardWorkflow.steps;
          panelsHtml = guardWorkflow.panels;
        } else if (user && userRole === 'admin') {
          const adminWorkflow = AdminWorkflow();
          stepsHtml = adminWorkflow.steps;
          panelsHtml = adminWorkflow.panels;
        } else if (user && userRole === 'logs') {
          const logsWorkflow = LogsWorkflow();
          stepsHtml = logsWorkflow.steps;
          panelsHtml = logsWorkflow.panels;
        } else {
          // Default workflow for non-logged in users (guests)
          const guestWorkflow = GuestWorkflow();
          stepsHtml = guestWorkflow.steps;
          panelsHtml = guestWorkflow.panels;
        }
        
        workflowStepsContainer.innerHTML = stepsHtml;
        workflowPanelsContainer.innerHTML = panelsHtml;
        
        // Re-setup workflow step event listeners for dynamically generated content
        document.querySelectorAll('[data-workflow-step]').forEach(stepBtn => {
          stepBtn.addEventListener('click', () => {
            const step = (stepBtn as HTMLElement).dataset.workflowStep;
            if (!step) return;
            
            // Update button states
            document.querySelectorAll('[data-workflow-step]').forEach(btn => {
              btn.classList.remove('bg-blue-600', 'text-white');
              btn.classList.add('bg-white', 'dark:bg-gray-800', 'text-blue-600', 'dark:text-blue-400', 'border', 'border-blue-200', 'dark:border-gray-700');
            });
            stepBtn.classList.remove('bg-white', 'dark:bg-gray-800', 'text-blue-600', 'dark:text-blue-400', 'border', 'border-blue-200', 'dark:border-gray-700');
            stepBtn.classList.add('bg-blue-600', 'text-white');
            
            // Show corresponding panel
            document.querySelectorAll('[data-workflow-panel]').forEach(panel => {
              panel.classList.add('hidden');
            });
            const targetPanel = document.querySelector(`[data-workflow-panel="${step}"]`);
            if (targetPanel) {
              targetPanel.classList.remove('hidden');
            }
          });
        });

        // Initialize tab animation
        initWorkflowTabAnimation();
      }
    } catch (e) {
      // ignore personalization errors
    }

  }, 100);

  return `    <div class="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
      <div class="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-4 sm:space-y-0 mb-8">
        <div class="text-center sm:text-left hero-section">
          <h1 id="heroTitle" class="hero-title text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white transition-colors duration-200">
            Welcome to GuestGo
          </h1>
          <p id="heroSubtitle" class="hero-subtitle text-base sm:text-xl text-gray-600 dark:text-gray-300 transition-colors duration-200">
            Schedule visits, verify guests, and track arrivals in real time.
          </p>
          <div id="featureCards" class="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <!-- Feature cards will be populated dynamically based on role -->
          </div>
        </div>
      </div>

      <!-- Weekly Visit Count Display for Logged-in Users -->
      <div id="weeklyVisitCount" class="mb-6 hidden">
        <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-blue-800 dark:text-blue-200">
                Weekly Visit Status
              </h3>
              <div class="mt-1 text-sm text-blue-700 dark:text-blue-300">
                <span id="weeklyVisitText">Loading...</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button 
        id="scheduleNowBtn"
        class="schedule-now-btn relative w-full sm:w-auto bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white px-8 py-4 rounded-xl text-lg sm:text-xl font-bold shadow-2xl hover:shadow-blue-500/50 transform hover:scale-105 active:scale-95 transition-all duration-300 mb-4 overflow-hidden group animate-pulse-slow"
        onclick="window.openScheduleModal()"
      >
        <span class="relative z-10 flex items-center justify-center gap-2">
          <svg class="w-5 h-5 sm:w-6 sm:h-6 animate-bounce-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
          <span>Schedule Now</span>
          <svg class="w-5 h-5 sm:w-6 sm:h-6 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
          </svg>
        </span>
        <div class="absolute inset-0 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div class="absolute inset-0 -z-10 bg-white/20 blur-xl transform scale-150 group-hover:scale-200 transition-transform duration-500"></div>
      </button>

      <!-- How GuestGo Works -->
      <section class="mb-10">
        <h2 class="text-xl sm:text-2xl font-bold mb-3">How GuestGo Works</h2>
        <div id="workflowSteps" class="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-3">
          <!-- Workflow steps will be populated dynamically based on role -->
        </div>
        <div id="workflowPanels" class="space-y-2">
          <!-- Workflow panels will be populated dynamically based on role -->
        </div>
      </section>

      ${FAQ()}

      <!-- Schedule Modal -->
      <div id="scheduleModal" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-10 mx-auto p-3 sm:p-5 border w-full max-w-sm sm:max-w-md md:max-w-lg shadow-lg rounded-md bg-white dark:bg-gray-800">
          <div class="mt-3">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">Schedule a Visit</h3>
              <button 
                id="closeScheduleModalBtn"
                class="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form class="space-y-4" id="scheduleForm">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label for="scheduleFirstName" class="block text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
                  <input 
                    type="text" 
                    id="scheduleFirstName" 
                    name="firstName"
                    class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                </div>
                <div>
                  <label for="scheduleLastName" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
                  <input 
                    type="text" 
                    id="scheduleLastName" 
                    name="lastName"
                    class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                </div>
              </div>
              <div id="emailVerificationSection">
                <div id="liveVisitCountReminder" class="hidden"></div>
                <label for="scheduleEmail" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <input 
                    type="email" 
                    id="scheduleEmail" 
                    name="email"
                    class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                  <button 
                    type="button"
                    id="sendVerificationCode"
                    class="mt-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send Code
                  </button>
                </div>
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Only Gmail addresses are currently supported</p>
                <!-- Real-time validation status - always visible -->
                <div id="emailValidationStatus" class="mt-1 text-sm"></div>
                <div id="verificationCodeContainer" class="hidden mt-2">
                  <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <input 
                      type="text" 
                      id="verificationCode" 
                      placeholder="Enter verification code"
                      class="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                    <button 
                      type="button"
                      id="verifyCode"
                      class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      Verify
                    </button>
                  </div>
                  <p id="verificationStatus" class="mt-1 text-sm"></p>
                </div>
              </div>
              <div>
                <label for="phone" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <img src="/ph-flag.png" alt="Philippine Flag" class="h-5 w-7 object-cover rounded-sm" />
                    <span class="ml-2 text-gray-700 dark:text-gray-300">+63</span>
                  </div>
                  <input 
                    type="tel" 
                    id="phone" 
                    name="phone"
                    maxlength="10"
                    pattern="[0-9]{10}"
                    class="mt-1 block w-full pl-20 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                    placeholder="9XXXXXXXXX"
                  >
                </div>
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Enter 10-digit mobile number (e.g., 9123456789)</p>
              </div>
              <div>
                <label for="placeToVisit" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Place to Visit</label>
                <select 
                  id="placeToVisit" 
                  name="placeToVisit"
                  class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">Select a place</option>
                </select>
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Multiple Places option requires at least 2 available places</p>
              </div>
              <div id="multiplePlacesContainer" class="hidden space-y-2">
                <!-- Dynamic place checkboxes will be loaded here -->
              </div>
              <div id="singlePurposeContainer">
                <div>
                  <label for="purpose" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Purpose of Visit</label>
                  <select 
                    id="purpose" 
                    name="purpose"
                    class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                    disabled
                  >
                    <option value="">Select a place first</option>
                  </select>
                </div>
                <div id="otherPurposeContainer" class="hidden">
                  <label for="otherPurpose" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Please specify (max 10 words, 50 characters)</label>
                  <textarea 
                    id="otherPurpose" 
                    name="otherPurpose"
                    rows="2"
                    maxlength="50"
                    class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  ></textarea>
                  <div class="mt-1 flex flex-col sm:flex-row justify-between text-sm text-gray-500 dark:text-gray-400 space-y-1 sm:space-y-0">
                    <span>Word count: <span id="wordCount">0</span>/10</span>
                    <span>Character count: <span id="charCount">0</span>/50</span>
                  </div>
                </div>
              </div>
              <div id="multiplePurposesContainer" class="hidden">
                <!-- Dynamic purpose selectors for each place will be loaded here -->
              </div>
              <div>
                <label for="visitDate" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Visit Date</label>
                <input 
                  type="date" 
                  id="visitDate" 
                  name="visitDate"
                  class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                  disabled
                  min=""
                  max=""
                >
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Scheduling is available up to 1 month in advance. Maximum 2 visits per week per user account.</p>
                <p id="dateAdvanceNotice" class="mt-1 text-sm text-blue-600 dark:text-blue-400 hidden"></p>
              </div>
              <div class="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                <button 
                  type="submit"
                  id="scheduleSubmitBtn"
                  class="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled
                >
                  Schedule Visit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Visit Confirmation Modal -->
      <div id="visitConfirmationModal" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" style="z-index: 9999;">
        <div class="relative top-10 mx-auto p-3 sm:p-5 border w-full max-w-md md:max-w-lg shadow-lg rounded-md bg-white dark:bg-gray-800">
          <div class="mt-3">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">Confirm Visit Details</h3>
              <button 
                id="closeConfirmationModalBtn"
                class="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <!-- Visit Details Summary -->
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
              <h4 class="text-md font-semibold text-gray-900 dark:text-white mb-3">Visit Information</h4>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600 dark:text-gray-300">Name:</span>
                  <span class="text-gray-900 dark:text-white font-medium" id="confirmationName">-</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600 dark:text-gray-300">Email:</span>
                  <span class="text-gray-900 dark:text-white font-medium" id="confirmationEmail">-</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600 dark:text-gray-300">Phone:</span>
                  <span class="text-gray-900 dark:text-white font-medium" id="confirmationPhone">-</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600 dark:text-gray-300">Visit Date:</span>
                  <span class="text-gray-900 dark:text-white font-medium" id="confirmationDate">-</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600 dark:text-gray-300">Place(s):</span>
                  <span class="text-gray-900 dark:text-white font-medium" id="confirmationPlaces">-</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600 dark:text-gray-300">Purpose:</span>
                  <span class="text-gray-900 dark:text-white font-medium" id="confirmationPurpose">-</span>
                </div>
              </div>
            </div>

            <!-- Agreement Section -->
            <div class="mb-6">
              <h4 class="text-md font-semibold text-gray-900 dark:text-white mb-3">Terms and Agreement</h4>
              <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
                <div class="text-sm text-yellow-800 dark:text-yellow-200">
                  <p class="font-medium mb-2">Important Guidelines:</p>
                  <ul class="list-disc list-inside space-y-1 text-xs">
                    <li>Please arrive on time for your scheduled visit</li>
                    <li>Bring a valid ID for verification</li>
                    <li>Follow all security protocols and guidelines</li>
                    <li>Notify us at least 24 hours in advance if you need to reschedule</li>
                    <li>Maximum 2 visits per week per user account</li>
                    <li>Visits are subject to approval and may be cancelled due to security concerns</li>
                  </ul>
                </div>
              </div>
              
              <div class="flex items-start space-x-3">
                <input 
                  type="checkbox" 
                  id="visitAgreement" 
                  class="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  required
                >
                <label for="visitAgreement" class="text-sm text-gray-700 dark:text-gray-300">
                  I have read and agree to the terms and conditions above. I understand that my visit is subject to approval and I will follow all security protocols during my visit.
                </label>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
              <button 
                type="button"
                id="cancelConfirmationBtn"
                class="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button 
                type="button"
                id="confirmScheduleBtn"
                class="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled
              >
                Confirm & Schedule Visit
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Sign Up Modal -->
      <div id="signUpModal" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-10 mx-auto p-3 sm:p-5 border w-full max-w-sm sm:max-w-md md:max-w-lg shadow-lg rounded-md bg-white dark:bg-gray-800">
          <div class="mt-3">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">Sign Up</h3>
              <button 
                id="closeSignUpModalBtn"
                class="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label for="signupFirstName" class="block text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
                  <input 
                    type="text" 
                    id="signupFirstName" 
                    name="firstName"
                    class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                </div>
                <div>
                  <label for="signupLastName" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
                  <input 
                    type="text" 
                    id="signupLastName" 
                    name="lastName"
                    class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                </div>
              </div>
              <div>
                <label for="signupEmail" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <input 
                  type="email" 
                  id="signupEmail" 
                  name="email"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
              </div>
              <div>
                <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                <input 
                  type="password" 
                  id="password" 
                  name="password"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
              </div>
              <div class="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                <button 
                  type="submit"
                  class="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Sign Up
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      ${Footer()}
    </div>
  `;
}