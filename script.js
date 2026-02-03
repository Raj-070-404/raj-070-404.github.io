let map = L.map("map").setView([17.3850, 78.4867], 12);
let routeLayer = null;
let markers = [];

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "© OpenStreetMap"
}).addTo(map);

function clearMap() {
  if (routeLayer) {
    map.removeLayer(routeLayer);
  }
  markers.forEach(m => map.removeLayer(m));
  markers = [];
}

async function getCoords(place) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(place)}`;

  const response = await fetch(url, {
    headers: {
      "Accept": "application/json"
    }
  });

  const data = await response.json();

  if (!data || data.length === 0) {
    throw new Error("Location not found: " + place);
  }

  return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
}

async function planTrip() {
  try {
    clearMap();

    let start = document.getElementById("start").value.trim();
    let breakfast = document.getElementById("breakfast").value.trim();
    let scenic = document.getElementById("scenic").value.trim();
    let lunch = document.getElementById("lunch").value.trim();
    let end = document.getElementById("end").value.trim();
    let mode = document.getElementById("mode").value;

    if (!start || !end) {
      alert("Start and Destination are required!");
      return;
    }

    let stops = [];
    if (start) stops.push(start);
    if (breakfast) stops.push(breakfast);
    if (scenic) stops.push(scenic);
    if (lunch) stops.push(lunch);
    if (end) stops.push(end);

    let coords = [];

    for (let stop of stops) {
      let c = await getCoords(stop);
      coords.push(c);

      let marker = L.marker(c).addTo(map).bindPopup(stop);
      markers.push(marker);
    }

    let coordString = coords
      .map(c => `${c[1]},${c[0]}`)
      .join(";");

    let routeURL = `https://router.project-osrm.org/route/v1/${mode}/${coordString}?overview=full&geometries=geojson`;

    const routeResponse = await fetch(routeURL);
    const routeData = await routeResponse.json();

    if (!routeData.routes || routeData.routes.length === 0) {
      alert("Route not found.");
      return;
    }

    let geo = routeData.routes[0].geometry;

    routeLayer = L.geoJSON(geo, {
      style: {
        color: "#2563eb",
        weight: 6,
        opacity: 0.9
      }
    }).addTo(map);

    map.fitBounds(routeLayer.getBounds());

    let distance = routeData.routes[0].distance;

    document.getElementById("info").innerText =
      `Mode: ${mode.toUpperCase()} | Distance: ${(distance / 1000).toFixed(2)} km`;

  } catch (err) {
    alert(err.message);
    console.error(err);
  }
}
