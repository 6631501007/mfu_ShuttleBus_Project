const graph = require('./campusGraph.json');

const WALKING_SPEED_METERS_PER_MINUTE =
  graph.metadata?.defaultWalkingSpeedMetersPerMinute || 80;

const nodesById = new Map(graph.nodes.map(node => [node.id, node]));

const toRadians = degrees => degrees * Math.PI / 180;

// Haversine distance is accurate enough for campus-scale routing.
const distanceMeters = (a, b) => {
  const earthRadiusMeters = 6371000;
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * earthRadiusMeters * Math.asin(Math.sqrt(h));
};

const createEdge = edge => {
  const fromNode = nodesById.get(edge.from);
  const toNode = nodesById.get(edge.to);

  if (!fromNode || !toNode) {
    throw new Error(`Invalid graph edge: ${edge.from} -> ${edge.to}`);
  }

  const distance = Number(edge.distance) || distanceMeters(fromNode, toNode);

  return {
    ...edge,
    distance,
    penalty: Number(edge.penalty) || 0,
    cost: distance + (Number(edge.penalty) || 0)
  };
};

// Build an adjacency list once when the server starts.
// Edges are treated as two-way paths unless oneWay is true.
const adjacency = new Map(graph.nodes.map(node => [node.id, []]));
graph.edges
  .filter(edge => edge.permission !== 'closed')
  .forEach(edge => {
    const forward = createEdge(edge);
    adjacency.get(forward.from).push(forward);

    if (!edge.oneWay) {
      adjacency.get(forward.to).push({
        ...forward,
        from: forward.to,
        to: forward.from
      });
    }
  });

const validateCoordinate = (lat, lng, label) => {
  const parsedLat = Number(lat);
  const parsedLng = Number(lng);

  if (!Number.isFinite(parsedLat) || !Number.isFinite(parsedLng)) {
    throw new Error(`${label} latitude and longitude must be numbers`);
  }

  if (parsedLat < -90 || parsedLat > 90 || parsedLng < -180 || parsedLng > 180) {
    throw new Error(`${label} coordinate is outside valid latitude/longitude bounds`);
  }

  return { lat: parsedLat, lng: parsedLng };
};

const findNearestNode = point => {
  let nearest = null;
  let nearestDistance = Infinity;

  for (const node of graph.nodes) {
    const distance = distanceMeters(point, node);
    if (distance < nearestDistance) {
      nearest = node;
      nearestDistance = distance;
    }
  }

  return {
    node: nearest,
    distanceMeters: nearestDistance
  };
};

const reconstructPath = (cameFrom, currentId) => {
  const path = [currentId];

  while (cameFrom.has(currentId)) {
    currentId = cameFrom.get(currentId);
    path.unshift(currentId);
  }

  return path;
};

const findLowestScoreNode = (openSet, scoreMap) => {
  let bestNodeId = null;
  let bestScore = Infinity;

  for (const nodeId of openSet) {
    const score = scoreMap.get(nodeId) ?? Infinity;
    if (score < bestScore) {
      bestScore = score;
      bestNodeId = nodeId;
    }
  }

  return bestNodeId;
};

const aStar = (startNodeId, endNodeId) => {
  const openSet = new Set([startNodeId]);
  const cameFrom = new Map();
  const gScore = new Map([[startNodeId, 0]]);
  const fScore = new Map([[
    startNodeId,
    distanceMeters(nodesById.get(startNodeId), nodesById.get(endNodeId))
  ]]);

  while (openSet.size > 0) {
    const currentId = findLowestScoreNode(openSet, fScore);

    if (currentId === endNodeId) {
      return reconstructPath(cameFrom, currentId);
    }

    openSet.delete(currentId);

    for (const edge of adjacency.get(currentId) || []) {
      const tentativeScore = (gScore.get(currentId) ?? Infinity) + edge.cost;

      if (tentativeScore < (gScore.get(edge.to) ?? Infinity)) {
        cameFrom.set(edge.to, currentId);
        gScore.set(edge.to, tentativeScore);
        fScore.set(
          edge.to,
          tentativeScore + distanceMeters(nodesById.get(edge.to), nodesById.get(endNodeId))
        );
        openSet.add(edge.to);
      }
    }
  }

  return null;
};

const getEdgeBetween = (from, to) => {
  return (adjacency.get(from) || []).find(edge => edge.to === to) || null;
};

const buildSteps = pathNodeIds => {
  const steps = [];

  for (let i = 0; i < pathNodeIds.length - 1; i += 1) {
    const from = nodesById.get(pathNodeIds[i]);
    const to = nodesById.get(pathNodeIds[i + 1]);
    const edge = getEdgeBetween(from.id, to.id);

    steps.push({
      from: from.name,
      to: to.name,
      pathType: edge?.pathType || 'walkway',
      distanceMeters: Math.round(edge?.distance || distanceMeters(from, to)),
      penalty: edge?.penalty || 0,
      instruction: `Walk from ${from.name} to ${to.name}`
    });
  }

  return steps;
};

const calculateRoute = ({ startLat, startLng, endLat, endLng }) => {
  const start = validateCoordinate(startLat, startLng, 'Start');
  const end = validateCoordinate(endLat, endLng, 'End');
  const snappedStart = findNearestNode(start);
  const snappedEnd = findNearestNode(end);
  const pathNodeIds = aStar(snappedStart.node.id, snappedEnd.node.id);

  if (!pathNodeIds) {
    const error = new Error('No walkable route found between the selected points');
    error.statusCode = 404;
    throw error;
  }

  const routeNodes = pathNodeIds.map(id => nodesById.get(id));
  const routeCoordinates = routeNodes.map(node => [node.lat, node.lng]);
  const steps = buildSteps(pathNodeIds);
  const totalDistance = steps.reduce((sum, step) => sum + step.distanceMeters, 0);

  return {
    route: {
      coordinates: routeCoordinates,
      nodes: routeNodes.map(node => ({
        id: node.id,
        name: node.name,
        type: node.type,
        lat: node.lat,
        lng: node.lng
      })),
      steps
    },
    distanceMeters: Math.round(totalDistance),
    estimatedWalkingTimeMinutes: Math.max(
      1,
      Math.ceil(totalDistance / WALKING_SPEED_METERS_PER_MINUTE)
    ),
    snapped: {
      start: {
        nodeId: snappedStart.node.id,
        name: snappedStart.node.name,
        distanceMeters: Math.round(snappedStart.distanceMeters)
      },
      end: {
        nodeId: snappedEnd.node.id,
        name: snappedEnd.node.name,
        distanceMeters: Math.round(snappedEnd.distanceMeters)
      }
    }
  };
};

module.exports = {
  calculateRoute,
  distanceMeters,
  graph
};
