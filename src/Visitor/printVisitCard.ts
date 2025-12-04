import supabase from '../config/supabase';
import { generateSimpleVisitQRCode, openPrintableVisitCard, type VisitQRData } from '../utils/qrCode';

// Track in-progress print operations to prevent multiple simultaneous calls
const printInProgress = new Set<string>();

// Helper function to show notifications
function showNotification(message: string, type: 'success' | 'error'): void {
  // Use the existing notification system from the dashboard if available
  if (typeof (window as any).showNotification === 'function') {
    (window as any).showNotification(message, type);
  } else {
    // Fallback notification
    const notification = document.createElement('div');
    notification.className = `notification fixed top-4 right-4 z-50 px-6 py-3 rounded-md shadow-lg transition-all duration-300 ${
      type === 'success' 
        ? 'bg-green-500 text-white' 
        : 'bg-red-500 text-white'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);

    // Remove notification after 3 seconds
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
}

// Global function to print visit card (accessible from onclick)
export function setupPrintVisitCard(): void {
  (window as any).printVisitCard = async function(visitId: string, buttonElement?: HTMLElement) {
    // Prevent multiple simultaneous calls for the same visit
    if (printInProgress.has(visitId)) {
      return;
    }

    // Get the button element - prefer passed element, fallback to querySelector
    let button: HTMLElement | null = buttonElement || null;
    if (!button) {
      // Try to find the button using data attribute
      button = document.querySelector(`button[data-visit-id="${visitId}"]`) as HTMLElement;
    }
    
    if (!button) {
      // Last resort: try to find any button with the onclick handler containing this visitId
      const buttons = document.querySelectorAll('button[onclick*="printVisitCard"]');
      for (const btn of buttons) {
        if (btn.getAttribute('onclick')?.includes(visitId)) {
          button = btn as HTMLElement;
          break;
        }
      }
    }

    if (!button) {
      console.error('Print button not found for visit:', visitId);
      return;
    }

    // Check if button is already disabled (prevent stacking)
    if (button.hasAttribute('disabled')) {
      return;
    }

    // Store original content
    const originalContent = button.innerHTML;
    
    try {
      // Mark as in progress
      printInProgress.add(visitId);

      // Show loading state
      button.innerHTML = `
        <svg class="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
        </svg>
        <span>Generating...</span>
      `;
      button.setAttribute('disabled', 'true');

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Fetch visit data from the database
      const { data: visitsData, error } = await supabase
        .rpc('get_visitor_scheduled_visits', { p_visitor_user_id: user.id });

      if (error) {
        throw new Error('Failed to fetch visit data');
      }

      // Find the specific visit
      const visit = visitsData.find((v: any) => v.id === visitId);
      if (!visit) {
        throw new Error('Visit not found');
      }

      // Debug: Log the visit data to see the structure
      console.log('Visit data for QR code:', visit);
      console.log('Places data:', visit.places);

      // Prepare visit data for QR code
      // Ensure places data is properly formatted
      let places = [];
      try {
        if (visit.places && Array.isArray(visit.places)) {
          places = visit.places;
        } else if (visit.places && typeof visit.places === 'object') {
          // If places is a JSONB object, convert it to array
          places = Array.isArray(visit.places) ? visit.places : [visit.places];
        } else if (visit.places && typeof visit.places === 'string') {
          // If places is a JSON string, parse it
          try {
            const parsedPlaces = JSON.parse(visit.places);
            places = Array.isArray(parsedPlaces) ? parsedPlaces : [parsedPlaces];
          } catch (parseError) {
            console.error('Error parsing places JSON:', parseError);
            places = [];
          }
        }
      } catch (error) {
        console.error('Error processing places data:', error);
        places = [];
      }
      
      console.log('Processed places array:', places);
      
      // Ensure each place has the required properties
      places = places.map((place: any) => {
        const processedPlace = {
          placeId: place.place_id || place.placeId || '',
          placeName: place.place_name || place.placeName || 'Unknown Place',
          placeLocation: place.place_location || place.placeLocation || '',
          status: place.status || 'pending'
        };
        console.log('Processed place:', processedPlace);
        return processedPlace;
      });

      const qrVisitData: VisitQRData = {
        visitId: visit.id,
        visitorName: `${visit.visitor_first_name} ${visit.visitor_last_name}`,
        visitorEmail: visit.visitor_email,
        visitDate: visit.visit_date,
        purpose: visit.purpose,
        places: places,
        status: visit.status,
        scheduledAt: visit.scheduled_at
      };

      console.log('Final QR visit data:', qrVisitData);

      // Generate QR code - use simple QR code for better scanning reliability
      const qrCodeDataUrl = await generateSimpleVisitQRCode(visit.id);

      // Open printable card
      openPrintableVisitCard(qrVisitData, qrCodeDataUrl);

      // Show success notification
      showNotification('Visit card generated successfully!', 'success');

    } catch (error) {
      console.error('Error printing visit card:', error);
      showNotification('Failed to generate visit card. Please try again.', 'error');
    } finally {
      // Remove from in-progress set
      printInProgress.delete(visitId);
      
      // Restore button state - use the same button reference we stored
      if (button) {
        button.removeAttribute('disabled');
        button.innerHTML = originalContent;
      }
    }
  };
}

