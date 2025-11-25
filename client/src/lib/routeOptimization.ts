// Route Optimization Utilities

export interface Node {
  id: string;
  name: string;
  lat: number;
  lng: number;
  power: number;
}

export interface OptimizedRoute {
  nodeIds: string[];
  totalDistance: number;
  totalPowerLoss: number;
  efficiency: number;
  waypoints: Array<{ lat: number; lng: number; name: string }>;
}

// Calculate distance between two points (Haversine formula)
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Find nearest neighbor route (greedy algorithm)
export function findNearestNeighborRoute(
  startNode: Node,
  nodes: Node[]
): OptimizedRoute {
  const remaining = nodes.filter(n => n.id !== startNode.id);
  const route: Node[] = [startNode];
  let current = startNode;
  let totalDistance = 0;
  let totalPowerLoss = 0;

  while (remaining.length > 0) {
    const distances = remaining.map(node => ({
      node,
      distance: calculateDistance(current.lat, current.lng, node.lat, node.lng),
    }));

    const nearest = distances.reduce((prev, curr) =>
      curr.distance < prev.distance ? curr : prev
    );

    route.push(nearest.node);
    totalDistance += nearest.distance;
    totalPowerLoss += nearest.distance * 0.2; // ~0.2dB loss per km

    current = nearest.node;
    remaining.splice(remaining.indexOf(nearest.node), 1);
  }

  const efficiency = Math.max(0, 100 - (totalPowerLoss * 5)); // Normalize efficiency

  return {
    nodeIds: route.map(n => n.id),
    totalDistance: Math.round(totalDistance * 100) / 100,
    totalPowerLoss: Math.round(totalPowerLoss * 100) / 100,
    efficiency: Math.round(efficiency),
    waypoints: route.map(n => ({ lat: n.lat, lng: n.lng, name: n.name })),
  };
}

// Find optimal point-to-point route
export function findOptimalRoute(
  startNode: Node,
  endNode: Node,
  intermediateNodes: Node[]
): OptimizedRoute {
  if (intermediateNodes.length === 0) {
    const distance = calculateDistance(
      startNode.lat,
      startNode.lng,
      endNode.lat,
      endNode.lng
    );
    return {
      nodeIds: [startNode.id, endNode.id],
      totalDistance: Math.round(distance * 100) / 100,
      totalPowerLoss: Math.round(distance * 0.2 * 100) / 100,
      efficiency: Math.round(Math.max(0, 100 - distance * 0.2 * 5)),
      waypoints: [
        { lat: startNode.lat, lng: startNode.lng, name: startNode.name },
        { lat: endNode.lat, lng: endNode.lng, name: endNode.name },
      ],
    };
  }

  // For intermediate nodes, use nearest neighbor starting from start node
  const allNodes = [...intermediateNodes, endNode];
  const route = findNearestNeighborRoute(startNode, allNodes);

  return route;
}

// Find critical path (nodes with lowest power)
export function findCriticalPath(nodes: Node[]): Node[] {
  return nodes
    .filter(n => n.power < -10)
    .sort((a, b) => a.power - b.power)
    .slice(0, 5);
}

// Suggest route improvements
export function suggestRouteImprovements(
  route: OptimizedRoute,
  nodes: Node[]
): string[] {
  const suggestions: string[] = [];

  if (route.totalPowerLoss > 10) {
    suggestions.push('High power loss detected. Consider shorter route or stronger signal.');
  }

  if (route.efficiency < 50) {
    suggestions.push('Route efficiency is low. Consider alternative path or fewer intermediate nodes.');
  }

  const avgDistance = route.totalDistance / route.waypoints.length;
  if (avgDistance > 5) {
    suggestions.push('Long segments between nodes. Consider adding intermediate splitters.');
  }

  return suggestions;
}

// Get route statistics
export function getRouteStats(route: OptimizedRoute): {
  segments: number;
  avgDistance: number;
  avgPowerLoss: number;
  estimatedTime: number;
} {
  return {
    segments: route.waypoints.length - 1,
    avgDistance: Math.round((route.totalDistance / route.waypoints.length) * 100) / 100,
    avgPowerLoss: Math.round((route.totalPowerLoss / route.waypoints.length) * 100) / 100,
    estimatedTime: Math.round(route.totalDistance / 20), // 20 km/hour travel
  };
}
