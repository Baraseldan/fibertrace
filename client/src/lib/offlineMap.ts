// Offline Map Utilities

// Register service worker
export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered successfully:', registration);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
}

// Generate tile URLs for a bounding box
export function generateTileUrls(
  bounds: { north: number; south: number; east: number; west: number },
  zoomLevels: number[] = [13, 14, 15]
): string[] {
  const tiles = new Set<string>();

  zoomLevels.forEach((zoom) => {
    // Convert lat/lng to tile coordinates
    const maxTile = Math.pow(2, zoom);

    const latToTile = (lat: number): number => {
      const sin = Math.sin((lat * Math.PI) / 180);
      const y2 = Math.log((1 + sin) / (1 - sin)) / 2;
      return Math.floor(((1 - y2 / Math.PI) / 2) * maxTile);
    };

    const lngToTile = (lng: number): number => {
      return Math.floor(((lng + 180) / 360) * maxTile);
    };

    const minX = lngToTile(bounds.west);
    const maxX = lngToTile(bounds.east);
    const minY = latToTile(bounds.north);
    const maxY = latToTile(bounds.south);

    // Generate tile URLs for CartoDB dark map
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        const url = `https://a.basemaps.cartocdn.com/dark_all/${zoom}/${x}/${y}.png`;
        tiles.add(url);
      }
    }
  });

  return Array.from(tiles);
}

// Download and cache tiles
export async function downloadTilesForRegion(
  bounds: { north: number; south: number; east: number; west: number },
  zoomLevels: number[] = [13, 14, 15],
  onProgress?: (current: number, total: number) => void
): Promise<boolean> {
  return new Promise((resolve) => {
    if (!('serviceWorker' in navigator)) {
      console.error('Service Worker not supported');
      resolve(false);
      return;
    }

    const tiles = generateTileUrls(bounds, zoomLevels);
    const total = tiles.length;

    navigator.serviceWorker.controller?.postMessage(
      {
        type: 'CACHE_TILES',
        tiles,
      },
      [
        new MessageChannel().port2,
      ]
    );

    // Listen for response with a timeout
    const channel = new MessageChannel();
    navigator.serviceWorker.controller?.postMessage(
      {
        type: 'CACHE_TILES',
        tiles,
      },
      [channel.port2]
    );

    channel.port1.onmessage = (event) => {
      if (event.data.success) {
        console.log(`Downloaded ${event.data.count} tiles`);
        resolve(true);
      } else {
        console.error('Failed to cache tiles:', event.data.error);
        resolve(false);
      }
    };

    // Timeout after 5 minutes
    setTimeout(() => resolve(false), 300000);
  });
}

// Get offline status
export function getOnlineStatus(): boolean {
  return navigator.onLine;
}

// Listen for online/offline changes
export function onOnlineStatusChange(callback: (online: boolean) => void): () => void {
  window.addEventListener('online', () => callback(true));
  window.addEventListener('offline', () => callback(false));

  return () => {
    window.removeEventListener('online', () => callback(true));
    window.removeEventListener('offline', () => callback(false));
  };
}

// Clear offline cache
export async function clearOfflineCache(): Promise<boolean> {
  return new Promise((resolve) => {
    if (!('serviceWorker' in navigator)) {
      resolve(false);
      return;
    }

    const channel = new MessageChannel();
    navigator.serviceWorker.controller?.postMessage(
      {
        type: 'CLEAR_TILE_CACHE',
      },
      [channel.port2]
    );

    channel.port1.onmessage = (event) => {
      resolve(event.data.success);
    };

    setTimeout(() => resolve(false), 5000);
  });
}

// Get storage info
export async function getStorageInfo(): Promise<{
  usage: number;
  quota: number;
  percentage: number;
} | null> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    try {
      const estimate = await navigator.storage.estimate();
      return {
        usage: estimate.usage || 0,
        quota: estimate.quota || 0,
        percentage: estimate.quota ? ((estimate.usage || 0) / estimate.quota) * 100 : 0,
      };
    } catch (error) {
      console.error('Failed to get storage info:', error);
    }
  }
  return null;
}

// Format bytes for display
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
