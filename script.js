let map = L.map('map').setView([17.3850, 78.4867], 12);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

async function getCoords(place) {
  let response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${place}`
  );
  let data = await response.json();
  return [data[0].lat, data[0].lon];
}

async function planTrip() {
  let start = document.getElementById("start").value;
  let end = document.getElementById("end").value;

  let startCoords = await getCoords(start);
  let endCoords = await getCoords(end);

  let routeURL = `https://router.project-osrm.org/route/v1/driving/${startCoords[1]},${startCoords[0]};${endCoords[1]},${endCoords[0]}?overview=full&geometries=geojson`;

  let routeData = await fetch(routeURL).then(res => res.json());

  let route = routeData.routes[0].geometry;

  L.geoJSON(route).addTo(map);

  document.getElementById("info").innerText =
    "Distance: " + (routeData.routes[0].distance / 1000).toFixed(2) + " km";
}
