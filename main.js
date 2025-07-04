const airportLat = 51.605; // Swansea Airport
const airportLng = -4.067;

const map = L.map("map").setView([airportLat, airportLng], 12);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

const airportMarker = L.marker([airportLat, airportLng])
  .addTo(map)
  .bindPopup("Swansea Airport");

let aircraftMarker = null;

function toRadians(deg) {
  return deg * Math.PI / 180;
}

function toDegrees(rad) {
  return rad * 180 / Math.PI;
}

function computeDistanceAndBearing(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const φ1 = toRadians(lat1);
  const φ2 = toRadians(lat2);
  const Δφ = toRadians(lat2 - lat1);
  const Δλ = toRadians(lon2 - lon1);

  const a = Math.sin(Δφ / 2) ** 2 +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) -
            Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const bearing = (toDegrees(Math.atan2(y, x)) + 360) % 360;

  return { distance, bearing };
}

function updatePosition(position) {
  const { latitude, longitude, altitude, speed, heading } = position.coords;

  if (!aircraftMarker) {
    aircraftMarker = L.marker([latitude, longitude], {
      icon: L.icon({
        iconUrl: "https://cdn-icons-png.flaticon.com/512/2972/2972532.png",
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      }),
      rotationAngle: heading || 0,
    }).addTo(map);
  } else {
    aircraftMarker.setLatLng([latitude, longitude]);
  }

  const { distance, bearing } = computeDistanceAndBearing(
    airportLat,
    airportLng,
    latitude,
    longitude
  );

  document.getElementById("info").innerHTML = `
    <strong>Aircraft Position</strong><br/>
    Lat: ${latitude.toFixed(5)}<br/>
    Lng: ${longitude.toFixed(5)}<br/>
    Altitude: ${altitude ? altitude.toFixed(0) + " m" : "N/A"}<br/>
    Speed: ${speed ? (speed * 3.6).toFixed(1) + " km/h" : "N/A"}<br/>
    Heading: ${heading ? heading.toFixed(0) + "°" : "N/A"}<br/>
    <strong>Relative to Swansea Airport</strong><br/>
    Distance: ${(distance / 1000).toFixed(2)} km<br/>
    Bearing: ${bearing.toFixed(1)}°
  `;

  map.setView([latitude, longitude]);
}

function error(err) {
  document.getElementById("info").innerText = `Error: ${err.message}`;
}

navigator.geolocation.watchPosition(updatePosition, error, {
  enableHighAccuracy: true,
  maximumAge: 1000,
  timeout: 5000
});
