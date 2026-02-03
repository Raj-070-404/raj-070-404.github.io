let map = L.map('map').setView([17.3850, 78.4867], 12);
let routeLayer;
let markers = [];

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19
}).addTo(map);

// Clear old markers
function clearMarkers() {
  markers.forEach(m => map.removeLayer(m));
  markers = [];
}

// Get coordinates (with proper headers so API doesn't block you)
async function getCoords(place) {
  let response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}`,
    {
      headers: {
        "User-Agent": "TripBuilderStudentProject/1.0"
      }
    }
  );

  let data = await response.json();

  if (!data || data.length === 0) {
    throw new Error("Location not found: " + place);
  }

  return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
}

async function planTrip() {
  try {
    if (routeLayer) {
      map.removeLayer(routeLayer);
    }

    clearMarkers();

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

    let locations = [];
    if (start) locations.push(start);
    if (breakfast) locations.push(breakfast);
    if (scenic) locations.push(scenic);
    if (lunch) locations.push(lunch);
    if (end) locations.push(end);

    let coordsList = [];

    for (let place of locations) {
      let coords = await getCoords(place);
      coordsList.push(`${coords[1]},${coords[0]}`);

      let marker = L.marker(coords).addTo(map).bindPopup(place);
      markers.push(marker);
    }

    let routeURL = `https://router.project-osrm.org/route/v1/${mode}/${coordsList.join(";")}?overview=full&geometries=geojson`;

    let routeData = await fetch(routeURL).then(res => res.json());

    if (!routeData.routes || routeData.routes.length === 0) {
      alert("Could not generate route.");
      return;
    }

    let route = routeData.routes[0].geometry;
    let distance = routeData.routes[0].distance;

    routeLayer = L.geoJSON(route, {
      style: {
        color: "blue",
        weight: 5
      }
    }).addTo(map);

    map.fitBounds(routeLayer.getBounds());

    document.getElementById("info").innerText =
      `Mode: ${mode.toUpperCase()} | Distance: ${(distance / 1000).toFixed(2)} km`;

  } catch (err) {
    alert(err.message);
    console.error(err);
  }
}
