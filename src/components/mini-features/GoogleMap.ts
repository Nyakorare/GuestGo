let mapIdCounter = 0;

export function GoogleMap() {
  mapIdCounter++;
  const mapId = `leaflet-map-${mapIdCounter}`;
  
  return `
    <div id="leaflet-map-container-${mapId}" class="w-full rounded-xl overflow-hidden border-2 border-gray-300 dark:border-gray-600" style="height: 400px;">
      <div id="map-${mapId}" class="w-full h-full" style="height: 400px;"></div>
    </div>
  `;
}

export function initializeGoogleMap(): void {
  // Load Leaflet CSS if not already loaded
  if (!document.querySelector('link[href*="leaflet.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  }

  // Load Leaflet JS if not already loaded
  if (typeof (window as any).L === 'undefined') {
    if (!document.querySelector('script[src*="leaflet.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
      script.crossOrigin = 'anonymous';
      script.onload = () => {
        setTimeout(initAllMaps, 100);
      };
      document.head.appendChild(script);
    } else {
      // Script is loading, wait for it
      const checkInterval = setInterval(() => {
        if (typeof (window as any).L !== 'undefined') {
          clearInterval(checkInterval);
          setTimeout(initAllMaps, 100);
        }
      }, 100);
      setTimeout(() => clearInterval(checkInterval), 10000);
    }
  } else {
    // Leaflet already loaded
    setTimeout(initAllMaps, 100);
  }
}

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Format distance for display
function formatDistance(miles: number): string {
  if (miles < 0.1) {
    return (miles * 5280).toFixed(0) + ' ft'; // Convert to feet if less than 0.1 miles
  } else if (miles < 1) {
    return (miles * 5280).toFixed(0) + ' ft';
  } else {
    return miles.toFixed(2) + ' miles';
  }
}

function initAllMaps(): void {
  const L = (window as any).L;
  if (!L) {
    console.error('Leaflet library not loaded');
    return;
  }

  // Find all map containers
  const mapContainers = document.querySelectorAll('[id^="map-leaflet-map-"]');
  
  mapContainers.forEach((mapElement) => {
    const mapId = mapElement.id;
    
    // Skip if already initialized
    if ((mapElement as any)._leaflet_id) {
      return;
    }

    // Ensure the map element has a defined height
    const element = mapElement as HTMLElement;
    if (!element.style.height && !element.offsetHeight) {
      element.style.height = '400px';
    }

    // Target location: San Marcelino St, Ayala Blvd, Ermita, Manila, 1000
    const targetLocation: [number, number] = [14.5832, 120.9822];
    
    try {
      // Create map centered on target location
      const map = L.map(mapId).setView(targetLocation, 15);
      
      // Invalidate size to ensure proper rendering
      setTimeout(() => {
        map.invalidateSize();
      }, 100);

      // Add OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      // Create custom icon for target location
      const redIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      // Create marker for target location
      const marker = L.marker(targetLocation, { icon: redIcon }).addTo(map);
      
      // Add popup to marker
      marker.bindPopup('<div style="padding: 5px;"><strong>GuestGo Office</strong><br>San Marcelino St, Ayala Blvd<br>Ermita, Manila, 1000</div>').openPopup();

      // Create custom icon for user location
      const blueIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      // Create distance display container
      const distanceContainer = document.createElement('div');
      distanceContainer.id = `distance-display-${mapId}`;
      distanceContainer.className = 'absolute top-2 right-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 z-[1000] border-2 border-blue-500';
      distanceContainer.style.display = 'none';
      distanceContainer.innerHTML = '<div class="text-sm font-semibold text-gray-900 dark:text-white"><span class="text-blue-600 dark:text-blue-400">Distance: </span><span id="distance-value-' + mapId + '">Calculating...</span></div>';
      const mapContainer = element.parentElement;
      if (mapContainer) {
        mapContainer.style.position = 'relative';
        mapContainer.appendChild(distanceContainer);
      }

      // Get user's current location and draw direction line
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLocation: [number, number] = [position.coords.latitude, position.coords.longitude];

            // Calculate distance
            const distanceInMiles = calculateDistance(
              userLocation[0],
              userLocation[1],
              targetLocation[0],
              targetLocation[1]
            );
            const formattedDistance = formatDistance(distanceInMiles);

            // Update distance display
            const distanceValue = document.getElementById(`distance-value-${mapId}`);
            if (distanceValue) {
              distanceValue.textContent = formattedDistance;
            }
            if (distanceContainer) {
              distanceContainer.style.display = 'block';
            }

            // Create marker for user location with distance in popup
            const userMarker = L.marker(userLocation, { icon: blueIcon }).addTo(map);
            userMarker.bindPopup(
              '<div style="padding: 5px;"><strong>Your Location</strong><br>' +
              '<span style="color: #3B82F6; font-weight: bold;">Distance: ' + formattedDistance + '</span></div>'
            );

            // Draw a line from user location to target location
            L.polyline([userLocation, targetLocation], {
              color: '#3B82F6',
              weight: 3,
              opacity: 0.8,
              smoothFactor: 1
            }).addTo(map);

            // Add distance label in the middle of the line
            const midLat = (userLocation[0] + targetLocation[0]) / 2;
            const midLon = (userLocation[1] + targetLocation[1]) / 2;
            L.marker([midLat, midLon], {
              icon: L.divIcon({
                className: 'distance-label',
                html: '<div style="background: rgba(59, 130, 246, 0.9); color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 12px; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">' + formattedDistance + '</div>',
                iconSize: [100, 20],
                iconAnchor: [50, 10]
              })
            }).addTo(map);

            // Fit map to show both locations
            const bounds = L.latLngBounds([userLocation, targetLocation]);
            map.fitBounds(bounds, { padding: [50, 50] });
          },
          (error) => {
            console.error('Error getting user location:', error);
            // If geolocation fails, just show the target location
            if (distanceContainer) {
              distanceContainer.style.display = 'none';
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          }
        );
      } else {
        // Browser doesn't support geolocation
        console.error('Geolocation is not supported by this browser.');
        if (distanceContainer) {
          distanceContainer.style.display = 'none';
        }
      }
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  });
}
