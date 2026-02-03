let map = L.map('map').setView([17.3850, 78.4867], 12);
let routeLayer;

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

async function getCoords(place) {
  let response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${place}`
  );
  let data = await response.json();
  return [data[0].lat, data[0].lon];
}

async function planTrip() {
  if (routeLayer) {
    map.removeLayer(routeLayer);
  }

  let start = document.getElementById("start").value;
  let breakfast = document.getElementById("breakfast").value;
  let scenic = document.getElementById("scenic").value;
  let lunch = document.getElementById("lunch").value;
  let end = document.getElementById("end").value;
  let mode = document.getElementById("mode").value;

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
  }

  let routeURL = `https://router.project-osrm.org/route/v1/${mode}/${coordsList.join(";")}?overview=full&geometries=geojson`;

  let routeData = await fetch(routeURL).then(res => res.json());

  let route = routeData.routes[0].geometry;
  let distance = routeData.routes[0].distance;

  routeLayer = L.geoJSON(route).addTo(map);

  map.fitBounds(routeLayer.getBounds());

  document.getElementById("info").innerText =
    `Mode: ${mode.toUpperCase()} | Distance: ${(distance / 1000).toFixed(2)} km`;
}
