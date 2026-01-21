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

  // Load Leaflet Routing Machine CSS if not already loaded
  if (!document.querySelector('link[href*="leaflet-routing-machine"]')) {
    const routingCss = document.createElement('link');
    routingCss.rel = 'stylesheet';
    routingCss.href = 'https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.css';
    document.head.appendChild(routingCss);
  }

  // Load Leaflet JS if not already loaded
  if (typeof (window as any).L === 'undefined') {
    if (!document.querySelector('script[src*="leaflet.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
      script.crossOrigin = 'anonymous';
      script.onload = () => {
        loadRoutingMachine();
      };
      document.head.appendChild(script);
    } else {
      // Script is loading, wait for it
      const checkInterval = setInterval(() => {
        if (typeof (window as any).L !== 'undefined') {
          clearInterval(checkInterval);
          loadRoutingMachine();
        }
      }, 100);
      setTimeout(() => clearInterval(checkInterval), 10000);
    }
  } else {
    // Leaflet already loaded
    loadRoutingMachine();
  }
}

function loadRoutingMachine(): void {
  // Load Leaflet Routing Machine JS if not already loaded
  if (typeof (window as any).L !== 'undefined' && typeof (window as any).L.Routing === 'undefined') {
    if (!document.querySelector('script[src*="leaflet-routing-machine"]')) {
      const routingScript = document.createElement('script');
      routingScript.src = 'https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.min.js';
      routingScript.onload = () => {
        setTimeout(initAllMaps, 100);
      };
      document.head.appendChild(routingScript);
    } else {
      // Script is loading, wait for it
      const checkInterval = setInterval(() => {
        if (typeof (window as any).L !== 'undefined' && typeof (window as any).L.Routing !== 'undefined') {
          clearInterval(checkInterval);
          setTimeout(initAllMaps, 100);
        }
      }, 100);
      setTimeout(() => clearInterval(checkInterval), 10000);
    }
  } else if (typeof (window as any).L !== 'undefined' && typeof (window as any).L.Routing !== 'undefined') {
    // Routing Machine already loaded
    setTimeout(initAllMaps, 100);
  }
}

// Convert meters to miles
function metersToMiles(meters: number): number {
  return meters * 0.000621371;
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

// Calculate distance between two coordinates using Haversine formula (fallback)
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

    // Target location: Technological University of the Philippines Manila
    // San Marcelino St, Ayala Blvd, Ermita, Manila, 1000
    const targetLocation: [number, number] = [14.58727, 120.98458];
    
    // Store map reference for fullscreen functionality
    let map: any = null;
    
    try {
      // Create map centered on target location
      map = L.map(mapId).setView(targetLocation, 15);
      
      // Invalidate size to ensure proper rendering
      setTimeout(() => {
        if (map) {
          map.invalidateSize();
        }
      }, 100);

      // Map type layers
      const mapTypes = {
        standard: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19
        }),
        satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: '&copy; <a href="https://www.esri.com/">Esri</a>',
          maxZoom: 19
        }),
        terrain: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
          maxZoom: 17
        })
      };
      
      // Current map type
      let currentMapType: 'standard' | 'satellite' | 'terrain' = 'standard';
      let currentLayer = mapTypes.standard.addTo(map);

      // Create custom icon for target location (without shadow to avoid CORS/tracking issues)
      const redIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34]
      });

      // Create marker for target location
      const marker = L.marker(targetLocation, { icon: redIcon }).addTo(map);
      
      // Add popup to marker
      marker.bindPopup('<div style="padding: 5px;"><strong>GuestGo Office</strong><br>Technological University of the Philippines Manila<br>San Marcelino St, Ayala Blvd<br>Ermita, Manila, 1000</div>').openPopup();

      // Create custom icon for user location (without shadow to avoid CORS/tracking issues)
      const blueIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34]
      });

      // Create distance display container
      const distanceContainer = document.createElement('div');
      distanceContainer.id = `distance-display-${mapId}`;
      distanceContainer.className = 'absolute top-2 right-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 z-[1000] border-2 border-blue-500';
      distanceContainer.style.display = 'none';
      distanceContainer.innerHTML = '<div class="text-sm font-semibold text-gray-900 dark:text-white"><span class="text-blue-600 dark:text-blue-400">Distance: </span><span id="distance-value-' + mapId + '">Calculating...</span></div>';
      
      // Create toggle route button (hide route/roads). Hidden by default until location is available.
      const toggleRouteButton = document.createElement('button');
      toggleRouteButton.id = `toggle-route-${mapId}`;
      toggleRouteButton.className = 'absolute bottom-2 left-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg shadow-lg p-2 z-[1000] border-2 border-gray-300 dark:border-gray-600 transition-colors';
      toggleRouteButton.innerHTML = `
        <svg id="route-icon-${mapId}" class="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
        </svg>
      `;
      toggleRouteButton.title = 'Hide Route';
      toggleRouteButton.setAttribute('aria-label', 'Toggle route visibility');
      // Only show this button once location sharing is enabled (geolocation success)
      toggleRouteButton.style.display = 'none';
      
      // Create toggle streets guide button
      const toggleGuideButton = document.createElement('button');
      toggleGuideButton.id = `toggle-guide-${mapId}`;
      toggleGuideButton.className = 'absolute top-2 left-14 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg shadow-lg p-2 z-[1000] border-2 border-gray-300 dark:border-gray-600 transition-colors';
      toggleGuideButton.innerHTML = `
        <svg id="guide-icon-${mapId}" class="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
        </svg>
      `;
      toggleGuideButton.title = 'Hide Streets Guide';
      toggleGuideButton.setAttribute('aria-label', 'Toggle streets guide visibility');
      toggleGuideButton.style.display = 'none'; // Hide initially, show when route control is available
      
      // Create map type toggle button
      const mapTypeButton = document.createElement('button');
      mapTypeButton.id = `map-type-${mapId}`;
      mapTypeButton.className = 'absolute bottom-2 right-14 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg shadow-lg p-2 z-[1000] border-2 border-gray-300 dark:border-gray-600 transition-colors';
      mapTypeButton.innerHTML = `
        <svg id="map-type-icon-${mapId}" class="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
        </svg>
      `;
      mapTypeButton.title = 'Map Type: Standard';
      mapTypeButton.setAttribute('aria-label', 'Change map type');
      
      // Create fullscreen toggle button
      const fullscreenButton = document.createElement('button');
      fullscreenButton.id = `fullscreen-${mapId}`;
      fullscreenButton.className = 'absolute bottom-2 right-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg shadow-lg p-2 z-[1000] border-2 border-gray-300 dark:border-gray-600 transition-colors';
      fullscreenButton.innerHTML = `
        <svg id="fullscreen-icon-${mapId}" class="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path>
        </svg>
      `;
      fullscreenButton.title = 'Enter Fullscreen';
      fullscreenButton.setAttribute('aria-label', 'Toggle fullscreen');
      
      const mapContainer = element.parentElement;
      if (mapContainer) {
        mapContainer.style.position = 'relative';
        mapContainer.appendChild(distanceContainer);
        mapContainer.appendChild(toggleRouteButton);
        mapContainer.appendChild(toggleGuideButton);
        mapContainer.appendChild(mapTypeButton);
        mapContainer.appendChild(fullscreenButton);
      }
      
      // Map type toggle functionality
      const mapTypeBtn = document.getElementById(`map-type-${mapId}`);
      const mapTypeIcon = document.getElementById(`map-type-icon-${mapId}`);
      
      function changeMapType() {
        // Remove current layer
        map.removeLayer(currentLayer);
        
        // Cycle through map types
        if (currentMapType === 'standard') {
          currentMapType = 'satellite';
        } else if (currentMapType === 'satellite') {
          currentMapType = 'terrain';
        } else {
          currentMapType = 'standard';
        }
        
        // Add new layer
        currentLayer = mapTypes[currentMapType];
        map.addLayer(currentLayer);
        
        // Update button icon and title
        if (mapTypeIcon && mapTypeBtn) {
          if (currentMapType === 'satellite') {
            mapTypeIcon.innerHTML = `
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            `;
            mapTypeBtn.title = 'Map Type: Satellite';
          } else if (currentMapType === 'terrain') {
            mapTypeIcon.innerHTML = `
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
            `;
            mapTypeBtn.title = 'Map Type: Terrain';
          } else {
            mapTypeIcon.innerHTML = `
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
            `;
            mapTypeBtn.title = 'Map Type: Standard';
          }
        }
        
        // Invalidate map size to ensure proper rendering
        setTimeout(() => {
          if (map) {
            map.invalidateSize();
          }
        }, 100);
      }
      
      if (mapTypeBtn) {
        mapTypeBtn.addEventListener('click', changeMapType);
      }
      
      // Store route control and distance label for toggling
      let routeControl: any = null;
      let routeLine: any = null;
      let distanceLabelMarker: any = null;
      let fallbackPolyline: any = null;
      let routeVisible = true;
      let guideVisible = true;
      let isFullscreen = false;
      
      // Store original styles to restore later
      const originalContainerStyles = {
        width: '',
        height: '',
        position: '',
        top: '',
        left: '',
        zIndex: '',
        backgroundColor: ''
      };
      const originalElementStyles = {
        height: '400px',
        width: ''
      };
      
      // Fullscreen functionality
      const fullscreenBtn = document.getElementById(`fullscreen-${mapId}`);
      const fullscreenIcon = document.getElementById(`fullscreen-icon-${mapId}`);
      
      function toggleFullscreen() {
        const container = element.parentElement;
        if (!container) return;
        
        if (!isFullscreen) {
          // Store original styles
          originalContainerStyles.width = (container as HTMLElement).style.width || '';
          originalContainerStyles.height = (container as HTMLElement).style.height || '';
          originalContainerStyles.position = (container as HTMLElement).style.position || '';
          originalContainerStyles.top = (container as HTMLElement).style.top || '';
          originalContainerStyles.left = (container as HTMLElement).style.left || '';
          originalContainerStyles.zIndex = (container as HTMLElement).style.zIndex || '';
          originalContainerStyles.backgroundColor = (container as HTMLElement).style.backgroundColor || '';
          
          originalElementStyles.height = element.style.height || '400px';
          originalElementStyles.width = element.style.width || '';
          
          // Set container styles for fullscreen
          (container as HTMLElement).style.width = '100vw';
          (container as HTMLElement).style.height = '100vh';
          (container as HTMLElement).style.position = 'fixed';
          (container as HTMLElement).style.top = '0';
          (container as HTMLElement).style.left = '0';
          (container as HTMLElement).style.zIndex = '9999';
          (container as HTMLElement).style.backgroundColor = '#fff';
          
          // Set map element to full height
          element.style.height = '100vh';
          element.style.width = '100vw';
          
          // Enter fullscreen
          if (container.requestFullscreen) {
            container.requestFullscreen();
          } else if ((container as any).webkitRequestFullscreen) {
            (container as any).webkitRequestFullscreen();
          } else if ((container as any).mozRequestFullScreen) {
            (container as any).mozRequestFullScreen();
          } else if ((container as any).msRequestFullscreen) {
            (container as any).msRequestFullscreen();
          }
        } else {
          // Exit fullscreen
          if (document.exitFullscreen) {
            document.exitFullscreen();
          } else if ((document as any).webkitExitFullscreen) {
            (document as any).webkitExitFullscreen();
          } else if ((document as any).mozCancelFullScreen) {
            (document as any).mozCancelFullScreen();
          } else if ((document as any).msExitFullscreen) {
            (document as any).msExitFullscreen();
          }
        }
      }
      
      function resetFullscreenStyles() {
        const container = element.parentElement;
        if (!container) return;
        
        // Reset container styles to original values
        (container as HTMLElement).style.width = originalContainerStyles.width;
        (container as HTMLElement).style.height = originalContainerStyles.height;
        (container as HTMLElement).style.position = originalContainerStyles.position;
        (container as HTMLElement).style.top = originalContainerStyles.top;
        (container as HTMLElement).style.left = originalContainerStyles.left;
        (container as HTMLElement).style.zIndex = originalContainerStyles.zIndex;
        (container as HTMLElement).style.backgroundColor = originalContainerStyles.backgroundColor;
        
        // Reset map element to original values
        element.style.height = originalElementStyles.height;
        element.style.width = originalElementStyles.width;
      }
      
      function updateFullscreenIcon() {
        if (fullscreenIcon) {
          if (isFullscreen) {
            fullscreenIcon.innerHTML = `
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25"></path>
            `;
          } else {
            fullscreenIcon.innerHTML = `
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path>
            `;
          }
        }
        if (fullscreenBtn) {
          fullscreenBtn.title = isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen';
        }
      }
      
      // Listen for fullscreen changes
      const fullscreenChangeHandler = () => {
        const container = element.parentElement;
        const isCurrentlyFullscreen = !!(
          document.fullscreenElement ||
          (document as any).webkitFullscreenElement ||
          (document as any).mozFullScreenElement ||
          (document as any).msFullscreenElement
        );
        
        const wasFullscreen = isFullscreen;
        isFullscreen = isCurrentlyFullscreen;
        updateFullscreenIcon();
        
        if (isCurrentlyFullscreen && container) {
          // Ensure fullscreen container takes full viewport
          (container as HTMLElement).style.width = '100vw';
          (container as HTMLElement).style.height = '100vh';
          element.style.height = '100vh';
          element.style.width = '100vw';
        } else if (!isCurrentlyFullscreen && wasFullscreen && container) {
          // Reset to original size when exiting fullscreen
          resetFullscreenStyles();
        }
        
        // Invalidate map size when entering/exiting fullscreen
        setTimeout(() => {
          if (map) {
            map.invalidateSize();
          }
        }, 300);
      };
      
      document.addEventListener('fullscreenchange', fullscreenChangeHandler);
      document.addEventListener('webkitfullscreenchange', fullscreenChangeHandler);
      document.addEventListener('mozfullscreenchange', fullscreenChangeHandler);
      document.addEventListener('MSFullscreenChange', fullscreenChangeHandler);
      
      if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', toggleFullscreen);
      }

      // Get user's current location and draw route using roads
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLocation: [number, number] = [position.coords.latitude, position.coords.longitude];

            // Location sharing is enabled – show the hide-route button in the bottom-left
            toggleRouteButton.style.display = 'block';

            // Create marker for user location
            const userMarker = L.marker(userLocation, { icon: blueIcon }).addTo(map);
            userMarker.bindPopup('<div style="padding: 5px;"><strong>Your Location</strong></div>');

            // Check if Leaflet Routing Machine is available
            if (typeof (window as any).L !== 'undefined' && typeof (window as any).L.Routing !== 'undefined') {
              const L = (window as any).L;
              
              // Create route using OSRM (free routing service)
              routeControl = L.Routing.control({
                waypoints: [
                  L.latLng(userLocation[0], userLocation[1]),
                  L.latLng(targetLocation[0], targetLocation[1])
                ],
                router: L.Routing.osrmv1({
                  serviceUrl: 'https://router.project-osrm.org/route/v1',
                  profile: 'driving'
                }),
                lineOptions: {
                  styles: [
                    {
                      color: '#3B82F6',
                      opacity: 0.8,
                      weight: 5
                    }
                  ],
                  extendToWaypoints: true,
                  missingRouteTolerance: 0
                },
                addWaypoints: false,
                draggableWaypoints: false,
                fitSelectedRoutes: true,
                showAlternatives: false,
                createMarker: () => null, // Don't create default markers
                routeWhileDragging: false
              }).addTo(map);
              
              // Show the toggle guide button now that route control is available
              const guideButton = document.getElementById(`toggle-guide-${mapId}`);
              if (guideButton) {
                guideButton.style.display = 'block';
              }
              
              // Toggle streets guide visibility
              const toggleGuideBtn = document.getElementById(`toggle-guide-${mapId}`);
              if (toggleGuideBtn) {
                toggleGuideBtn.addEventListener('click', () => {
                  guideVisible = !guideVisible;
                  const guideIcon = document.getElementById(`guide-icon-${mapId}`);
                  
                  if (routeControl && routeControl._container) {
                    if (guideVisible) {
                      // Show guide
                      routeControl._container.style.display = '';
                      if (guideIcon) {
                        guideIcon.innerHTML = `
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
                        `;
                      }
                      toggleGuideBtn.title = 'Hide Streets Guide';
                    } else {
                      // Hide guide
                      routeControl._container.style.display = 'none';
                      if (guideIcon) {
                        guideIcon.innerHTML = `
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                        `;
                      }
                      toggleGuideBtn.title = 'Show Streets Guide';
                    }
                  }
                });
              }

              // Update distance when route is found
              routeControl.on('routesfound', (e: any) => {
                const routes = e.routes;
                if (routes && routes.length > 0) {
                  const route = routes[0];
                  const distanceInMeters = route.summary.totalDistance;
                  const distanceInMiles = metersToMiles(distanceInMeters);
                  const formattedDistance = formatDistance(distanceInMiles);

                  // Store reference to the route line
                  if (routeControl._line) {
                    routeLine = routeControl._line;
                  }

                  // Update distance display
                  const distanceValue = document.getElementById(`distance-value-${mapId}`);
                  if (distanceValue) {
                    distanceValue.textContent = formattedDistance;
                  }
                  if (distanceContainer) {
                    distanceContainer.style.display = 'block';
                  }

                  // Update user marker popup with route distance
                  userMarker.setPopupContent(
                    '<div style="padding: 5px;"><strong>Your Location</strong><br>' +
                    '<span style="color: #3B82F6; font-weight: bold;">Distance: ' + formattedDistance + '</span><br>' +
                    '<span style="font-size: 11px; color: #666;">(via roads)</span></div>'
                  ).openPopup();

                  // Add distance label on the route (at midpoint of route coordinates)
                  if (route.coordinates && route.coordinates.length > 0) {
                    const midIndex = Math.floor(route.coordinates.length / 2);
                    const midPoint = route.coordinates[midIndex];
                    distanceLabelMarker = L.marker([midPoint.lat, midPoint.lng], {
                      icon: L.divIcon({
                        className: 'distance-label',
                        html: '<div style="background: rgba(59, 130, 246, 0.9); color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 12px; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">' + formattedDistance + '</div>',
                        iconSize: [100, 20],
                        iconAnchor: [50, 10]
                      })
                    }).addTo(map);
                  }

                  // Fit map to show the route
                  const bounds = route.coordinates.reduce((bounds: any, coord: any) => {
                    return bounds.extend([coord.lat, coord.lng]);
                  }, L.latLngBounds([]));
                  map.fitBounds(bounds, { padding: [50, 50] });
                }
              });

              // Toggle route visibility
              toggleRouteButton.addEventListener('click', () => {
                routeVisible = !routeVisible;
                const routeIcon = document.getElementById(`route-icon-${mapId}`);
                
                // Try to get route line from control if not already stored
                if (routeControl && !routeLine && routeControl._line) {
                  routeLine = routeControl._line;
                }
                
                if (routeLine || fallbackPolyline) {
                  if (routeVisible) {
                    // Show route
                    if (routeLine) {
                      map.addLayer(routeLine);
                    } else if (fallbackPolyline) {
                      map.addLayer(fallbackPolyline);
                    }
                    if (distanceLabelMarker) {
                      map.addLayer(distanceLabelMarker);
                    }
                    if (routeIcon) {
                      routeIcon.innerHTML = `
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                      `;
                    }
                    toggleRouteButton.title = 'Hide Route';
                  } else {
                    // Hide route
                    if (routeLine) {
                      map.removeLayer(routeLine);
                    } else if (fallbackPolyline) {
                      map.removeLayer(fallbackPolyline);
                    }
                    if (distanceLabelMarker) {
                      map.removeLayer(distanceLabelMarker);
                    }
                    if (routeIcon) {
                      routeIcon.innerHTML = `
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      `;
                    }
                    toggleRouteButton.title = 'Show Route';
                  }
                }
              });

              // Handle routing errors
              routeControl.on('routingerror', (e: any) => {
                console.error('Routing error:', e);
                // Fallback to straight line if routing fails
                const distanceInMiles = calculateDistance(
                  userLocation[0],
                  userLocation[1],
                  targetLocation[0],
                  targetLocation[1]
                );
                const formattedDistance = formatDistance(distanceInMiles);
                
                // Draw straight line as fallback
                fallbackPolyline = L.polyline([userLocation, targetLocation], {
                  color: '#3B82F6',
                  weight: 3,
                  opacity: 0.8,
                  dashArray: '5, 10'
                }).addTo(map);

                const distanceValue = document.getElementById(`distance-value-${mapId}`);
                if (distanceValue) {
                  distanceValue.textContent = formattedDistance + ' (straight)';
                }
                if (distanceContainer) {
                  distanceContainer.style.display = 'block';
                }

                // Update toggle button for fallback
                const existingHandler = toggleRouteButton.onclick;
                toggleRouteButton.onclick = null;
                toggleRouteButton.addEventListener('click', () => {
                  routeVisible = !routeVisible;
                  const routeIcon = document.getElementById(`route-icon-${mapId}`);
                  
                  if (routeVisible) {
                    // Show line
                    if (fallbackPolyline) {
                      map.addLayer(fallbackPolyline);
                    }
                    if (routeIcon) {
                      routeIcon.innerHTML = `
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                      `;
                    }
                    toggleRouteButton.title = 'Hide Route';
                  } else {
                    // Hide line
                    if (fallbackPolyline) {
                      map.removeLayer(fallbackPolyline);
                    }
                    if (routeIcon) {
                      routeIcon.innerHTML = `
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      `;
                    }
                    toggleRouteButton.title = 'Show Route';
                  }
                });
              });
            } else {
              // Fallback: use straight line if routing is not available
              const distanceInMiles = calculateDistance(
                userLocation[0],
                userLocation[1],
                targetLocation[0],
                targetLocation[1]
              );
              const formattedDistance = formatDistance(distanceInMiles);

              const distanceValue = document.getElementById(`distance-value-${mapId}`);
              if (distanceValue) {
                distanceValue.textContent = formattedDistance;
              }
              if (distanceContainer) {
                distanceContainer.style.display = 'block';
              }

              userMarker.bindPopup(
                '<div style="padding: 5px;"><strong>Your Location</strong><br>' +
                '<span style="color: #3B82F6; font-weight: bold;">Distance: ' + formattedDistance + '</span></div>'
              );

              fallbackPolyline = L.polyline([userLocation, targetLocation], {
                color: '#3B82F6',
                weight: 3,
                opacity: 0.8,
                smoothFactor: 1
              }).addTo(map);

              // Add distance label for fallback
              const midLat = (userLocation[0] + targetLocation[0]) / 2;
              const midLon = (userLocation[1] + targetLocation[1]) / 2;
              distanceLabelMarker = L.marker([midLat, midLon], {
                icon: L.divIcon({
                  className: 'distance-label',
                  html: '<div style="background: rgba(59, 130, 246, 0.9); color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 12px; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">' + formattedDistance + '</div>',
                  iconSize: [100, 20],
                  iconAnchor: [50, 10]
                })
              }).addTo(map);

              // Update toggle button for fallback
              toggleRouteButton.addEventListener('click', () => {
                routeVisible = !routeVisible;
                const routeIcon = document.getElementById(`route-icon-${mapId}`);
                
                if (routeVisible) {
                  // Show line
                  if (fallbackPolyline) {
                    map.addLayer(fallbackPolyline);
                  }
                  if (distanceLabelMarker) {
                    map.addLayer(distanceLabelMarker);
                  }
                  if (routeIcon) {
                    routeIcon.innerHTML = `
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                    `;
                  }
                  toggleRouteButton.title = 'Hide Route';
                } else {
                  // Hide line
                  if (fallbackPolyline) {
                    map.removeLayer(fallbackPolyline);
                  }
                  if (distanceLabelMarker) {
                    map.removeLayer(distanceLabelMarker);
                  }
                  if (routeIcon) {
                    routeIcon.innerHTML = `
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    `;
                  }
                  toggleRouteButton.title = 'Show Route';
                }
              });

              const bounds = L.latLngBounds([userLocation, targetLocation]);
              map.fitBounds(bounds, { padding: [50, 50] });
            }
          },
          (error) => {
            // Handle geolocation errors gracefully
            // Only show message for actual user denial (code 1)
            // Code 1 = PERMISSION_DENIED
            // Code 2 = POSITION_UNAVAILABLE  
            // Code 3 = TIMEOUT
            if (error.code === 1) {
              // User denied geolocation - only show message for this specific case
              console.log('User denied location access (code: 1)');
              
              // Check if message already exists to avoid duplicates
              if (!document.getElementById(`location-message-${mapId}`)) {
                const messageDiv = document.createElement('div');
                messageDiv.id = `location-message-${mapId}`;
                messageDiv.className = 'absolute bottom-2 left-2 right-2 bg-yellow-100 dark:bg-yellow-900 border-2 border-yellow-400 dark:border-yellow-600 rounded-lg shadow-lg p-3 z-[1000]';
                messageDiv.innerHTML = `
                  <div class="flex items-start gap-2">
                    <svg class="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <div class="flex-1">
                      <p class="text-sm font-semibold text-yellow-800 dark:text-yellow-200">Location Access Denied</p>
                      <p class="text-xs text-yellow-700 dark:text-yellow-300 mt-1">Enable location access in your browser settings to see your distance from the office.</p>
                    </div>
                    <button onclick="this.parentElement.parentElement.remove()" class="text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>
                `;
                const mapContainer = element.parentElement;
                if (mapContainer) {
                  mapContainer.appendChild(messageDiv);
                  // Auto-hide after 10 seconds
                  setTimeout(() => {
                    if (messageDiv.parentElement) {
                      messageDiv.remove();
                    }
                  }, 10000);
                }
              }
            } else {
              // Other errors (timeout, unavailable, etc.) - just log, don't show message
              console.log('Geolocation error (not user denial):', {
                code: error.code,
                message: error.message,
                codeMeaning: error.code === 2 ? 'Position unavailable' : error.code === 3 ? 'Timeout' : 'Unknown'
              });
            }
            // If geolocation fails, just show the target location
            if (distanceContainer) {
              distanceContainer.style.display = 'none';
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 10000, // Increased timeout to 10 seconds
            maximumAge: 60000 // Allow cached position up to 1 minute old
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
