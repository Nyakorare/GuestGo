import { setupEventListeners, setupConfirmationModalListeners } from '../components/ModalFunctions';
import supabase from '../config/supabase';
import { loadPlaces } from './dashboard/index';

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
    
    console.log('Current user:', { id: user.id, email: user.email });

    try {
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      
      console.log('User role data:', roleData);
      
      // Only show weekly visit count for visitor roles
      if (roleData?.role !== 'visitor') {
        console.log('User is not a visitor, hiding weekly visit count');
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
    
    console.log('Week calculation debug:', {
      philippineToday: philippineToday.toISOString(),
      dayOfWeek,
      daysToSubtract,
      weekStart: weekStart.toISOString(),
      weekEnd: weekEnd.toISOString()
    });
    
    console.log('Date ranges:', {
      philippineToday: philippineToday.toISOString().split('T')[0],
      weekStart: weekStart.toISOString().split('T')[0],
      weekEnd: weekEnd.toISOString().split('T')[0],
      queryEndDate: philippineToday.toISOString().split('T')[0]
    });

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
    
    console.log('Database query boundaries:', {
      weekStartStr,
      weekEndStr,
      weekStartISO: weekStart.toISOString(),
      weekEndISO: weekEnd.toISOString()
    });
    
    // DEBUGGING APPROACH: Get all visits first, then filter in JavaScript
    // This helps us see exactly what dates are being returned and why the filtering might be failing
    // The issue might be timezone differences between database storage and query comparison
    const { data: allUserVisits, error: allUserError } = await supabase
      .from('scheduled_visits')
      .select('visit_date, status')
      .or(`visitor_user_id.eq.${user.id},visitor_email.eq.${user.email}`)
      .in('status', ['pending', 'completed', 'completed_flagged']);

    if (allUserError) {
      console.error('Error loading all user visits:', allUserError);
      return;
    }

    // Filter visits in JavaScript to ensure proper date comparison
    // This bypasses any potential database timezone issues and gives us full control over date logic
    const visits = allUserVisits?.filter(visit => {
      const visitDate = new Date(visit.visit_date);
      const isInCurrentWeek = visitDate >= weekStart && visitDate <= weekEnd;
      
      console.log('Visit date filtering:', {
        visitDate: visit.visit_date,
        visitDateParsed: visitDate.toISOString(),
        weekStart: weekStart.toISOString(),
        weekEnd: weekEnd.toISOString(),
        isInCurrentWeek,
        visitStatus: visit.status
      });
      
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
    
    console.log('All visits for user (ID or email):', allVisits);
    console.log('Current week visits (filtered):', visits);
    console.log('Week boundaries:', {
      weekStart: weekStart.toISOString().split('T')[0],
      weekEnd: weekEnd.toISOString().split('T')[0],
      philippineToday: philippineToday.toISOString().split('T')[0]
    });

    // Query the database for all pending, completed, and completed_flagged visits for the previous week
    const { data: _prevWeekVisits, error: prevWeekError } = await supabase
      .from('scheduled_visits')
      .select('visit_date, status')
      .or(`visitor_user_id.eq.${user.id},visitor_email.eq.${user.email}`)
      .in('status', ['pending', 'completed', 'completed_flagged'])
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
    const completedCount = visits?.filter(v => v.status === 'completed').length || 0;
    const completedFlaggedCount = visits?.filter(v => v.status === 'completed_flagged').length || 0;
    
    // Debug: Log individual visit details for current week
    if (visits && visits.length > 0) {
      console.log('Current week visit details:', visits.map(v => ({
        date: v.visit_date,
        status: v.status,
        isCurrentWeek: new Date(v.visit_date) >= weekStart && new Date(v.visit_date) <= weekEnd
      })));
    }

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
        if (visit.status === 'pending') {
          currentWeekData.pending++;
        } else if (visit.status === 'completed') {
          currentWeekData.completed++;
        } else if (visit.status === 'completed_flagged') {
          currentWeekData.completedFlagged++;
        }
        currentWeekData.total++;
      });
    }
    
    // Debug logging to understand the counts
    console.log('Weekly Visit Count Debug:', {
      currentWeek: {
        visitCount,
        pendingCount,
        completedCount,
        completedFlaggedCount
      },
      allPending: {
        totalPendingCount
      },
      future: {
        futureVisitCount
      },
      totals: {
        totalPendingSchedules,
        totalCompletedSchedules,
        totalWeekVisits
      },
      weeklyVisitCounts: Array.from(weeklyVisitCounts.entries()).map(([weekKey, data]) => ({
        week: weekKey,
        ...data
      })),
      weekBoundaries: {
        philippineToday: philippineToday.toISOString().split('T')[0],
        weekStart: weekStart.toISOString().split('T')[0],
        weekEnd: weekEnd.toISOString().split('T')[0]
      }
    });

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
    
    // Add debug info to help understand the counts
    const debugInfo = `[Debug: ${totalWeekVisits} total this week, ${pendingCount} pending this week, ${completedCount} completed this week, ${completedFlaggedCount} flagged this week, ${remainingVisits} remaining]`;
    console.log(debugInfo);
    
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
      statusHtml = `<span class="font-medium text-green-600 dark:text-green-400">2 visits remaining</span> (${pendingCount} pending this week, ${completedText})`;
      if (scheduleNowBtn) {
        scheduleNowBtn.removeAttribute('disabled');
        scheduleNowBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        scheduleNowBtn.title = '';
      }
    } else if (remainingVisits === 1) {
      const completedText = completedFlaggedCount > 0 ? `${totalCompletedSchedules} completed (${completedFlaggedCount} flagged)` : `${totalCompletedSchedules} completed`;
      statusHtml = `<span class="font-medium text-yellow-600 dark:text-yellow-400">1 visit remaining</span> (${pendingCount} pending this week, ${completedText})`;
      if (scheduleNowBtn) {
        scheduleNowBtn.removeAttribute('disabled');
        scheduleNowBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        scheduleNowBtn.title = '';
      }
    } else {
      const completedText = completedFlaggedCount > 0 ? `${totalCompletedSchedules} completed (${completedFlaggedCount} flagged)` : `${totalCompletedSchedules} completed`;
      statusHtml = `<span class="font-medium text-red-600 dark:text-red-400">No visits remaining</span> (${pendingCount} pending this week, ${completedText})`;
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
    
    console.log('updateScheduleButtonVisibility called. User:', !!user, 'Button found:', !!scheduleNowBtn);
    
    if (!scheduleNowBtn) return;
    
    if (user) {
      // Check if user has visitor role
      try {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();
        
        console.log('User role:', roleData?.role);
        // Only show schedule button for visitor roles
        if (roleData?.role === 'visitor') {
          console.log('Showing schedule button for visitor');
          scheduleNowBtn.classList.remove('hidden');
          // Load and display weekly visit count for visitor users
          await loadWeeklyVisitCount(user.email || '');
        } else {
          console.log('Hiding schedule button for non-visitor role:', roleData?.role);
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
    
    // Re-setup event listeners to ensure the schedule button click handler is properly attached
    if (typeof setupEventListeners === 'function') {
      setupEventListeners();
    }
  } catch (error) {
    console.error('Error updating schedule button visibility:', error);
  }
};

// Test function to debug weekly visit count
(window as any).testWeeklyVisitCount = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('No user found');
      return;
    }

    console.log('=== VISITS COUNT TEST ===');
    console.log('User ID:', user.id);
    console.log('User Email:', user.email);

    // Test 1: Get all visits for this user
    const { data: allVisits, error: _allError } = await supabase
      .from('scheduled_visits')
      .select('*')
      .eq('visitor_user_id', user.id);

    console.log('All visits for user:', allVisits);
    console.log('All visits count:', allVisits?.length || 0);

    // Test 2: Get pending and completed visits for this user
    const { data: activeVisits, error: _activeError } = await supabase
      .from('scheduled_visits')
      .select('*')
      .eq('visitor_user_id', user.id)
      .in('status', ['pending', 'completed', 'completed_flagged']);

    console.log('Active visits (pending + completed):', activeVisits);
    console.log('Active visits count:', activeVisits?.length || 0);

    // Test 3: Get pending visits for this user
    const { data: pendingVisits, error: _pendingError } = await supabase
      .from('scheduled_visits')
      .select('*')
      .eq('visitor_user_id', user.id)
      .eq('status', 'pending');

    console.log('Pending visits:', pendingVisits);
    console.log('Pending visits count:', pendingVisits?.length || 0);

    // Test 4: Get completed visits for this user
    const { data: completedVisits, error: _completedError } = await supabase
      .from('scheduled_visits')
      .select('*')
      .eq('visitor_user_id', user.id)
      .eq('status', 'completed');

    console.log('Completed visits:', completedVisits);
    console.log('Completed visits count:', completedVisits?.length || 0);

    // Test 5: Check if there are any visits at all in the database
    const { data: anyVisits, error: _anyError } = await supabase
      .from('scheduled_visits')
      .select('*')
      .limit(5);

    console.log('Any visits in database:', anyVisits);
    console.log('Any visits count:', anyVisits?.length || 0);

    // Test 6: Calculate remaining visits
    const activeCount = activeVisits?.length || 0;
    const pendingCount = pendingVisits?.length || 0;
    const completedCount = completedVisits?.length || 0;
    const remainingVisits = Math.max(0, 2 - activeCount);
    
    console.log('Active visits (pending + completed):', activeCount);
    console.log('Pending visits:', pendingCount);
    console.log('Completed visits:', completedCount);
    console.log('Remaining visits:', remainingVisits);
    console.log('Status:', activeCount === 0 ? '2 visits remaining' : 
                       activeCount === 1 ? '1 visit remaining' : 
                       'No visits remaining');

    console.log('=== END TEST ===');

  } catch (error) {
    console.error('Error in test:', error);
  }
};

// Test function to manually trigger schedule modal
(window as any).testScheduleModal = () => {
  console.log('=== SCHEDULE MODAL TEST ===');
  
  const scheduleNowBtn = document.getElementById('scheduleNowBtn');
  const scheduleModal = document.getElementById('scheduleModal');
  
  console.log('Schedule button found:', !!scheduleNowBtn);
  console.log('Schedule modal found:', !!scheduleModal);
  
  if (scheduleNowBtn) {
    console.log('Button classes:', scheduleNowBtn.className);
    console.log('Button hidden:', scheduleNowBtn.classList.contains('hidden'));
    console.log('Button visible:', scheduleNowBtn.offsetParent !== null);
  }
  
  if (scheduleModal) {
    console.log('Modal classes:', scheduleModal.className);
    console.log('Modal hidden:', scheduleModal.classList.contains('hidden'));
  }
  
  // Try to manually open the modal
  if (scheduleModal) {
    scheduleModal.classList.remove('hidden');
    console.log('Modal should now be visible');
  }
  
  console.log('=== END SCHEDULE MODAL TEST ===');
};

// Test function to debug week boundary calculation
(window as any).testWeekBoundaries = () => {
  console.log('=== WEEK BOUNDARY TEST ===');
  
  // Test with a known date (e.g., August 20, 2025 - a Wednesday)
  const testDate = new Date('2025-08-20');
  console.log('Test date:', testDate.toISOString());
  console.log('Day of week:', testDate.getDay()); // Should be 3 (Wednesday)
  
  // Calculate week boundaries
  const dayOfWeek = testDate.getDay();
  const daysToSubtract = dayOfWeek;
  const weekStart = new Date(testDate);
  weekStart.setDate(testDate.getDate() - daysToSubtract);
  weekStart.setHours(0, 0, 0, 0);
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  
  console.log('Calculated week boundaries:', {
    weekStart: weekStart.toISOString().split('T')[0], // Should be 2025-08-17 (Sunday)
    weekEnd: weekEnd.toISOString().split('T')[0],   // Should be 2025-08-23 (Saturday)
    weekStartFull: weekStart.toISOString(),
    weekEndFull: weekEnd.toISOString()
  });
  
  // Test if August 16 (previous week) falls outside current week
  const aug16 = new Date('2025-08-16');
  const isInCurrentWeek = aug16 >= weekStart && aug16 <= weekEnd;
  console.log('August 16 in current week?', isInCurrentWeek); // Should be false
  
  console.log('=== END WEEK BOUNDARY TEST ===');
};

// Test function to debug the specific issue with August 16 visit
(window as any).testAugust16Issue = () => {
  console.log('=== AUGUST 16 ISSUE TEST ===');
  
  // Simulate the exact scenario: today is August 20, 2025
  const today = new Date('2025-08-20');
  console.log('Today (simulated):', today.toISOString());
  
  // Calculate week boundaries for August 17-23
  const dayOfWeek = today.getDay(); // 3 (Wednesday)
  const daysToSubtract = dayOfWeek; // 3
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - daysToSubtract);
  weekStart.setHours(0, 0, 0, 0);
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  
  console.log('Current week boundaries:', {
    weekStart: weekStart.toISOString().split('T')[0], // Should be 2025-08-17
    weekEnd: weekEnd.toISOString().split('T')[0],   // Should be 2025-08-23
  });
  
  // Test the problematic date: August 16
  const aug16 = new Date('2025-08-16');
  const aug16Str = aug16.toISOString().split('T')[0];
  
  console.log('August 16 test:', {
    august16: aug16Str,
    august16ISO: aug16.toISOString(),
    weekStartStr: weekStart.toISOString().split('T')[0],
    weekEndStr: weekEnd.toISOString().split('T')[0],
    isAfterWeekStart: aug16 >= weekStart,
    isBeforeWeekEnd: aug16 <= weekEnd,
    isInCurrentWeek: aug16 >= weekStart && aug16 <= weekEnd
  });
  
  // Test database query format
  console.log('Database query would use:', {
    gte: weekStart.toISOString().split('T')[0],
    lte: weekEnd.toISOString().split('T')[0]
  });
  
  console.log('=== END AUGUST 16 ISSUE TEST ===');
};

// Global function to open schedule modal (called from inline onclick)
(window as any).openScheduleModal = async () => {
  const btn = document.getElementById('scheduleNowBtn');
  if (btn && btn.hasAttribute('disabled')) {
    // Optionally show a message here
    return;
  }
  console.log('openScheduleModal called');
  
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
  console.log('Opening modal. Modal found:', !!modal);
  if (modal) {
    modal.classList.remove('hidden');
    // Initialize date validation when modal opens
    if ((window as any).initializeDateValidation) {
      (window as any).initializeDateValidation();
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
      // Set minimum date to today (Philippine time)
      visitDateInput.min = philippineToday.toISOString().split('T')[0];
      // Set maximum date to one month from today
      visitDateInput.max = philippineMaxDate.toISOString().split('T')[0];
      
      // Set default value to today
      visitDateInput.value = philippineToday.toISOString().split('T')[0];
      
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
        
        // If we reach here, the date is valid (today or future within 1 month)
        console.log('Date validation passed:', {
          selected: philippineSelectedDate.toISOString(),
          current: currentPhilippineDate.toISOString(),
          isToday: philippineSelectedDate.getTime() === currentPhilippineDate.getTime()
        });
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
        const panel = document.querySelector(`[data-faq-panel="${id}"]`);
        if (!panel) return;
        panel.classList.toggle('hidden');
        const icon = (toggle as HTMLElement).querySelector('[data-faq-icon]');
        if (icon) {
          icon.classList.toggle('rotate-180');
        }
      });
    });

    // Personalize hero and CTA based on auth state
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const heroTitle = document.getElementById('heroTitle');
      const heroSubtitle = document.getElementById('heroSubtitle');
      const scheduleNowBtn = document.getElementById('scheduleNowBtn');
      if (user) {
        const firstName = (user.user_metadata && (user.user_metadata.first_name || user.user_metadata.firstName)) || '';
        if (heroTitle) heroTitle.textContent = firstName ? `Welcome back, ${firstName}` : 'Welcome back to GuestGo';
        if (heroSubtitle) heroSubtitle.textContent = 'Manage your visits, track status, and plan ahead.';
        if (scheduleNowBtn) scheduleNowBtn.textContent = 'Schedule Another Visit';
      } else {
        if (heroTitle) heroTitle.textContent = 'Welcome to GuestGo';
        if (heroSubtitle) heroSubtitle.textContent = 'Your one-stop solution for guest management and hospitality services.';
        if (scheduleNowBtn) scheduleNowBtn.textContent = 'Schedule Now';
      }
    } catch (e) {
      // ignore personalization errors
    }

  }, 100);

  return `    <div class="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
      <div class="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-4 sm:space-y-0 mb-8">
        <img src="/guestgo-logo.png" alt="GuestGo Logo" class="h-14 w-14 sm:h-16 sm:w-16 mx-auto sm:mx-0" />
        <div class="text-center sm:text-left">
          <h1 id="heroTitle" class="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white transition-colors duration-200">
            Welcome to GuestGo
          </h1>
          <p id="heroSubtitle" class="text-base sm:text-xl text-gray-600 dark:text-gray-300 transition-colors duration-200">
            Your one-stop solution for guest management and hospitality services.
          </p>
          <div class="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
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
        class="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors duration-200 mb-4"
        onclick="window.openScheduleModal()"
      >
        Schedule Now
      </button>

      <!-- How GuestGo Works -->
      <section class="mb-10">
        <h2 class="text-xl sm:text-2xl font-bold mb-3">How GuestGo Works</h2>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
          <button class="rounded-lg px-3 py-2 text-sm bg-blue-600 text-white" data-workflow-step="1">1. Request</button>
          <button class="rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-gray-700" data-workflow-step="2">2. Verify</button>
          <button class="rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-gray-700" data-workflow-step="3">3. Approve</button>
          <button class="rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-gray-700" data-workflow-step="4">4. Check-in</button>
        </div>
        <div class="space-y-2">
          <div class="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800" data-workflow-panel="1">
            <p class="font-semibold mb-1">Request a Visit</p>
            <p class="text-sm text-gray-600 dark:text-gray-400">Fill out the form with your details, pick a date (PH time), and choose the place to visit. We enforce a maximum of 2 visits per week.</p>
          </div>
          <div class="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 hidden" data-workflow-panel="2">
            <p class="font-semibold mb-1">Verify Your Email</p>
            <p class="text-sm text-gray-600 dark:text-gray-400">We send a one-time code to your Gmail. Enter the code to proceed and reduce fraud.</p>
          </div>
          <div class="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 hidden" data-workflow-panel="3">
            <p class="font-semibold mb-1">Approval & Scheduling</p>
            <p class="text-sm text-gray-600 dark:text-gray-400">Personnel review your request. You’ll see the status in your weekly visit tracker.</p>
          </div>
          <div class="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 hidden" data-workflow-panel="4">
            <p class="font-semibold mb-1">On-site Check-in</p>
            <p class="text-sm text-gray-600 dark:text-gray-400">Arrive with a valid ID. Staff can scan your QR to confirm and log your visit.</p>
          </div>
        </div>
      </section>

      <!-- FAQ -->
      <section class="mb-8">
        <h2 class="text-xl sm:text-2xl font-bold mb-3">Frequently Asked Questions</h2>
        <div class="divide-y divide-gray-200 dark:divide-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div class="p-4">
            <button class="w-full flex justify-between items-center text-left" data-faq-toggle="limit">
              <span class="font-medium">How many visits can I schedule?</span>
              <svg data-faq-icon class="w-5 h-5 text-gray-500 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
            </button>
            <div class="mt-2 text-sm text-gray-600 dark:text-gray-400 hidden" data-faq-panel="limit">Each user can have up to 2 visits per week. The counter resets weekly (Sunday to Saturday, PH time).</div>
          </div>
          <div class="p-4">
            <button class="w-full flex justify-between items-center text-left" data-faq-toggle="email">
              <span class="font-medium">Why do I need to verify my email?</span>
              <svg data-faq-icon class="w-5 h-5 text-gray-500 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
            </button>
            <div class="mt-2 text-sm text-gray-600 dark:text-gray-400 hidden" data-faq-panel="email">Email verification prevents duplicate or fraudulent bookings and helps us contact you with updates.</div>
          </div>
          <div class="p-4">
            <button class="w-full flex justify-between items-center text-left" data-faq-toggle="resched">
              <span class="font-medium">Can I reschedule?</span>
              <svg data-faq-icon class="w-5 h-5 text-gray-500 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
            </button>
            <div class="mt-2 text-sm text-gray-600 dark:text-gray-400 hidden" data-faq-panel="resched">Yes. Please notify us at least 24 hours before your visit so we can accommodate changes.</div>
          </div>
        </div>
      </section>

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
                <label for="visitDate" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Visit Date</label>
                <input 
                  type="date" 
                  id="visitDate" 
                  name="visitDate"
                  class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                  min=""
                  max=""
                >
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Scheduling is available up to 1 month in advance. Maximum 2 visits per week per user account.</p>
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
              <div>
                <label for="purpose" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Purpose of Visit</label>
                <select 
                  id="purpose" 
                  name="purpose"
                  class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">Select a purpose</option>
                  <option value="meeting">Meeting</option>
                  <option value="interview">Interview</option>
                  <option value="delivery">Delivery</option>
                  <option value="consultation">Consultation</option>
                  <option value="other">Others</option>
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
    </div>
  `;
}