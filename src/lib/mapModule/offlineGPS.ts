// Offline GPS Mapping - Cached tile management and offline navigation
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GeoPoint, MapRegion } from './types';

const TILE_CACHE_KEY = 'offline_map_tiles';
const OFFLINE_ROUTES_KEY = 'offline_routes';
const GPS_HISTORY_KEY = 'gps_history';

interface MapTile {
  x: number;
  y: number;
  z: number;
  url: string;
  data?: string;
  cached: boolean;
  timestamp: number;
}

interface OfflineRoute {
  id: string;
  name: string;
  waypoints: GeoPoint[];
  distance: number;
  createdAt: number;
  cached: boolean;
}

interface GPSTrack {
  id: string;
  points: (GeoPoint & { timestamp: number; accuracy: number })[];
  startTime: number;
  endTime: number;
}

// Convert lat/lon to tile coordinates for caching
function getTileCoordinates(
  latitude: number,
  longitude: number,
  zoom: number
): { x: number; y: number } {
  const n = Math.pow(2, zoom);
  const x = Math.floor(((longitude + 180) / 360) * n);
  const y = Math.floor(
    ((1 - Math.log(Math.tan((latitude * Math.PI) / 180) + 1 / Math.cos((latitude * Math.PI) / 180)) / Math.PI) / 2) * n
  );
  return { x, y };
}

export async function cacheMapTilesForRegion(
  region: MapRegion,
  zoom: number = 15
): Promise<number> {
  try {
    const stored = await AsyncStorage.getItem(TILE_CACHE_KEY);
    const cachedTiles: MapTile[] = stored ? JSON.parse(stored) : [];

    const topLeft = getTileCoordinates(
      region.latitude + region.latitudeDelta / 2,
      region.longitude - region.longitudeDelta / 2,
      zoom
    );
    const bottomRight = getTileCoordinates(
      region.latitude - region.latitudeDelta / 2,
      region.longitude + region.longitudeDelta / 2,
      zoom
    );

    let tilesAdded = 0;

    for (let x = Math.min(topLeft.x, bottomRight.x); x <= Math.max(topLeft.x, bottomRight.x); x++) {
      for (let y = Math.min(topLeft.y, bottomRight.y); y <= Math.max(topLeft.y, bottomRight.y); y++) {
        // Using OpenStreetMap tile provider
        const tileUrl = `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`;

        const exists = cachedTiles.some((t) => t.x === x && t.y === y && t.z === zoom);
        if (!exists) {
          const tile: MapTile = {
            x,
            y,
            z: zoom,
            url: tileUrl,
            cached: true,
            timestamp: Date.now(),
          };
          cachedTiles.push(tile);
          tilesAdded++;
        }
      }
    }

    if (tilesAdded > 0) {
      await AsyncStorage.setItem(TILE_CACHE_KEY, JSON.stringify(cachedTiles));
    }

    return tilesAdded;
  } catch (error) {
    console.error('Error caching map tiles:', error);
    return 0;
  }
}

export async function getCachedTiles(): Promise<MapTile[]> {
  try {
    const stored = await AsyncStorage.getItem(TILE_CACHE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error retrieving cached tiles:', error);
    return [];
  }
}

export async function cacheOfflineRoute(
  name: string,
  waypoints: GeoPoint[]
): Promise<OfflineRoute> {
  try {
    const stored = await AsyncStorage.getItem(OFFLINE_ROUTES_KEY);
    const routes: OfflineRoute[] = stored ? JSON.parse(stored) : [];

    let distance = 0;
    for (let i = 0; i < waypoints.length - 1; i++) {
      distance += calculateDistance(waypoints[i], waypoints[i + 1]);
    }

    const route: OfflineRoute = {
      id: `route-${Date.now()}`,
      name,
      waypoints,
      distance,
      createdAt: Date.now(),
      cached: true,
    };

    routes.push(route);
    await AsyncStorage.setItem(OFFLINE_ROUTES_KEY, JSON.stringify(routes));

    return route;
  } catch (error) {
    console.error('Error caching offline route:', error);
    throw error;
  }
}

export async function getOfflineRoutes(): Promise<OfflineRoute[]> {
  try {
    const stored = await AsyncStorage.getItem(OFFLINE_ROUTES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error retrieving offline routes:', error);
    return [];
  }
}

export async function deleteOfflineRoute(routeId: string): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(OFFLINE_ROUTES_KEY);
    if (stored) {
      const routes: OfflineRoute[] = JSON.parse(stored);
      const filtered = routes.filter((r) => r.id !== routeId);
      await AsyncStorage.setItem(OFFLINE_ROUTES_KEY, JSON.stringify(filtered));
    }
  } catch (error) {
    console.error('Error deleting offline route:', error);
  }
}

export async function saveGPSTrack(track: GPSTrack): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(GPS_HISTORY_KEY);
    const tracks: GPSTrack[] = stored ? JSON.parse(stored) : [];
    tracks.push(track);
    await AsyncStorage.setItem(GPS_HISTORY_KEY, JSON.stringify(tracks));
  } catch (error) {
    console.error('Error saving GPS track:', error);
  }
}

export async function getGPSHistory(): Promise<GPSTrack[]> {
  try {
    const stored = await AsyncStorage.getItem(GPS_HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error retrieving GPS history:', error);
    return [];
  }
}

export async function getOfflineMapStatus(): Promise<{
  cachedTiles: number;
  cachedRoutes: number;
  gpsHistoryPoints: number;
  totalCacheSize: string;
}> {
  try {
    const tiles = await getCachedTiles();
    const routes = await getOfflineRoutes();
    const tracks = await getGPSHistory();

    let totalPoints = 0;
    tracks.forEach((t) => {
      totalPoints += t.points.length;
    });

    // Rough estimate: 5KB per tile, 1KB per point
    const cacheSize = tiles.length * 5 + totalPoints * 1;
    const cacheSizeStr = cacheSize > 1024 ? `${(cacheSize / 1024).toFixed(2)} MB` : `${cacheSize} KB`;

    return {
      cachedTiles: tiles.length,
      cachedRoutes: routes.length,
      gpsHistoryPoints: totalPoints,
      totalCacheSize: cacheSizeStr,
    };
  } catch (error) {
    console.error('Error getting offline map status:', error);
    return {
      cachedTiles: 0,
      cachedRoutes: 0,
      gpsHistoryPoints: 0,
      totalCacheSize: '0 KB',
    };
  }
}

export async function clearOfflineMapCache(): Promise<void> {
  try {
    await AsyncStorage.removeItem(TILE_CACHE_KEY);
    await AsyncStorage.removeItem(OFFLINE_ROUTES_KEY);
    await AsyncStorage.removeItem(GPS_HISTORY_KEY);
  } catch (error) {
    console.error('Error clearing offline map cache:', error);
  }
}

function calculateDistance(p1: GeoPoint, p2: GeoPoint): number {
  const R = 6371;
  const dLat = ((p2.latitude - p1.latitude) * Math.PI) / 180;
  const dLng = ((p2.longitude - p1.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((p1.latitude * Math.PI) / 180) *
      Math.cos((p2.latitude * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function findNearestCachedLocation(
  currentLocation: GeoPoint,
  maxDistance: number = 50
): Promise<OfflineRoute | null> {
  try {
    const routes = await getOfflineRoutes();

    for (const route of routes) {
      for (const waypoint of route.waypoints) {
        const dist = calculateDistance(currentLocation, waypoint);
        if (dist <= maxDistance / 1000) {
          return route;
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Error finding nearest cached location:', error);
    return null;
  }
}

export async function recordOfflineGPSPoint(
  trackId: string,
  point: GeoPoint & { accuracy: number }
): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(GPS_HISTORY_KEY);
    const tracks: GPSTrack[] = stored ? JSON.parse(stored) : [];

    const track = tracks.find((t) => t.id === trackId);
    if (track) {
      track.points.push({ ...point, timestamp: Date.now() });
      track.endTime = Date.now();
      await AsyncStorage.setItem(GPS_HISTORY_KEY, JSON.stringify(tracks));
    }
  } catch (error) {
    console.error('Error recording GPS point:', error);
  }
}
