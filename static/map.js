// Initialize map with a default center.
var map = L.map('map').setView([27.7123, -97.3246], 11);

// Object to store drone markers.
var droneMarkers = {};

// Create a custom plane icon.
var planeIcon = L.icon({
    iconUrl: 'static/images/plane-icon.png', // Update this path if needed.
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
});

// Use an OpenMapTiles style.
L.tileLayer('https://api.maptiler.com/maps/outdoor/{z}/{x}/{y}.png?key=3TdwoUdL48yWggYAxvAE', {
    attribution: '&copy; <a href="https://www.openmaptiles.org/">OpenMapTiles</a> contributors'
}).addTo(map);

// Determine the correct data endpoint based on the URL.
function fetchDroneData() {
    let url = window.location.pathname;
    let endpoint = "/drone-data";  // Default endpoint.
    if (url === "/droneA") {
        endpoint = "/droneA-data";
    } else if (url === "/droneB") {
        endpoint = "/droneB-data";
    } else if (url === "/droneJ") {
        endpoint = "/data";
    }
    
    fetch(endpoint)
        .then(response => response.json())
        .then(data => {
            // Support both array and single JSON object responses.
            if (Array.isArray(data)) {
                data.forEach(updateOrCreateMarker);
            } else {
                updateOrCreateMarker(data);
            }
        })
        .catch(error => console.error("Error fetching drone data:", error));
}

// Updated function to use the new JSON structure.
function updateOrCreateMarker(drone) {
    // Extract position information from nested "position" property.
    const lat = drone.position.latitude;
    const lng = drone.position.longitude;
    const alt = drone.position.altitude;

    if (!droneMarkers[drone.call_sign]) {
        // Create new marker.
        droneMarkers[drone.call_sign] = L.marker([lat, lng], { icon: planeIcon }).addTo(map)
            .bindPopup(`Drone ${drone.call_sign}`);
    } else {
        // Update existing marker.
        let newLatLng = new L.LatLng(lat, lng);
        droneMarkers[drone.call_sign].setLatLng(newLatLng);
        droneMarkers[drone.call_sign].bindPopup(`Drone ${drone.call_sign}: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    }

    // Optionally center the map on the drone's new position.
    map.setView([lat, lng], 15);

    // Update telemetry data on the page.
    document.getElementById('drone-latitude').textContent = lat.toFixed(4);
    document.getElementById('drone-longitude').textContent = lng.toFixed(4);
    document.getElementById('drone-altitude').textContent = alt;
    document.getElementById('drone-status').textContent = drone.airframe || 'Unknown';
}

// Refresh drone data periodically.
setInterval(fetchDroneData, 4000);
fetchDroneData();
