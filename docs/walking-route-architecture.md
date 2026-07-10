# Campus Walking Route System

This project implements a small Google Maps-style walking route system without calling the Google Directions API. It uses a local pedestrian graph and A* search so the routing logic is easy to study and extend.

## Recommended Folder Structure

```text
backend-node/
  app.js                         # Express API, including GET /api/route
  routing/
    campusGraph.json             # Pedestrian map data: nodes and edges
    routingEngine.js             # Coordinate validation, snapping, A* routing

frontend-vue/
  src/
    views/
      Home.vue                   # Leaflet map, point selection, route polyline
    service/
      api.js                     # Backend API helper

docs/
  walking-route-architecture.md  # Explanation and setup notes
```

## Architecture

1. Vue frontend
   - Shows a Leaflet interactive map.
   - Lets the user set a start point and destination by clicking the map.
   - Can use browser GPS as the start point.
   - Calls `GET /api/route`.
   - Draws the returned route coordinates as a Leaflet polyline.
   - Shows total distance and estimated walking time.

2. Backend API
   - Endpoint: `GET /api/route?startLat=...&startLng=...&endLat=...&endLng=...`
   - Validates latitude and longitude.
   - Passes coordinates to the routing engine.
   - Returns route geometry, distance, walking time, snapped nodes, and steps.

3. Routing engine
   - Loads `routing/campusGraph.json`.
   - Treats nodes as intersections, entrances, buildings, and path points.
   - Treats edges as sidewalks, crossings, stairs, pedestrian bridges, and shortcuts.
   - Snaps selected coordinates to the nearest graph nodes.
   - Runs A* search.
   - Uses cost = distance + optional penalty.

4. Pedestrian map data
   - Stored in JSON for beginner-friendly editing.
   - Add more nodes and edges as your real campus data improves.
   - Closed paths can be represented with `"permission": "closed"`.
   - Difficult paths can use `"penalty": 50` or higher.

## Example API Response

```json
{
  "route": {
    "coordinates": [
      [20.047935, 99.892017],
      [20.047054, 99.89217],
      [20.045901, 99.891629]
    ],
    "nodes": [
      { "id": "f_courtyard", "name": "F Courtyard", "type": "plaza", "lat": 20.047935, "lng": 99.892017 }
    ],
    "steps": [
      {
        "from": "F Courtyard",
        "to": "D1 Building",
        "pathType": "plaza",
        "distanceMeters": 99,
        "penalty": 0,
        "instruction": "Walk from F Courtyard to D1 Building"
      }
    ]
  },
  "distanceMeters": 228,
  "estimatedWalkingTimeMinutes": 3,
  "snapped": {
    "start": { "nodeId": "f_courtyard", "name": "F Courtyard", "distanceMeters": 18 },
    "end": { "nodeId": "swimming_pool", "name": "Swimming Pool", "distanceMeters": 12 }
  },
  "message": "Route calculated with campus pedestrian graph and A* search"
}
```

## Setup

Install and run the backend:

```bash
cd backend-node
npm install
npm start
```

Install and run the frontend:

```bash
cd frontend-vue
npm install
npm run dev
```

If your backend is not on `http://localhost:3000`, set this in `frontend-vue/.env`:

```text
VITE_API_BASE_URL=http://localhost:3000
```

## How To Test

1. Open the Vue app.
2. Click `Set start`, then click a point on the map.
3. Click `Set destination`, then click another point.
4. Click `Calculate`.
5. The frontend calls `/api/route` and draws the returned walking route.

## Expanding The Map

To add real campus data:

1. Survey important walking points with GPS or from a campus map.
2. Add each point to `backend-node/routing/campusGraph.json` as a node.
3. Add walkable connections as edges.
4. Add penalties for stairs, unsafe crossings, restricted paths, or difficult routes.
5. Restart the backend so the graph is reloaded.
