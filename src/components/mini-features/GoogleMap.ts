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
      marker.bindPopup('<div style="padding: 5px;"><strong>GuestGo Office</strong><br>San Marcelino St, Ayala Blvd<br>Ermita, Manila, 1000</div>').openPopup();

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
      
      // Create toggle route button
      const toggleRouteButton = document.createElement('button');
      toggleRouteButton.id = `toggle-route-${mapId}`;
      toggleRouteButton.className = 'absolute top-2 left-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg shadow-lg p-2 z-[1000] border-2 border-gray-300 dark:border-gray-600 transition-colors';
      toggleRouteButton.innerHTML = `
        <svg id="route-icon-${mapId}" class="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
        </svg>
      `;
      toggleRouteButton.title = 'Hide Route';
      toggleRouteButton.setAttribute('aria-label', 'Toggle route visibility');
      
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
      
      const mapContainer = element.parentElement;
      if (mapContainer) {
        mapContainer.style.position = 'relative';
        mapContainer.appendChild(distanceContainer);
        mapContainer.appendChild(toggleRouteButton);
        mapContainer.appendChild(toggleGuideButton);
      }
      
      // Store route control and distance label for toggling
      let routeControl: any = null;
      let routeLine: any = null;
      let distanceLabelMarker: any = null;
      let fallbackPolyline: any = null;
      let routeVisible = true;
      let guideVisible = true;

      // Get user's current location and draw route using roads
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLocation: [number, number] = [position.coords.latitude, position.coords.longitude];

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
