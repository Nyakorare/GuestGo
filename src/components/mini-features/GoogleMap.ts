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
              const control = L.Routing.control({
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

              // Update distance when route is found
              control.on('routesfound', (e: any) => {
                const routes = e.routes;
                if (routes && routes.length > 0) {
                  const route = routes[0];
                  const distanceInMeters = route.summary.totalDistance;
                  const distanceInMiles = metersToMiles(distanceInMeters);
                  const formattedDistance = formatDistance(distanceInMiles);

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
                    L.marker([midPoint.lat, midPoint.lng], {
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

              // Handle routing errors
              control.on('routingerror', (e: any) => {
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
                L.polyline([userLocation, targetLocation], {
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

              L.polyline([userLocation, targetLocation], {
                color: '#3B82F6',
                weight: 3,
                opacity: 0.8,
                smoothFactor: 1
              }).addTo(map);

              const bounds = L.latLngBounds([userLocation, targetLocation]);
              map.fitBounds(bounds, { padding: [50, 50] });
            }
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
