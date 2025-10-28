// src/environments/environment.ts
export const environment = {
  production: false,
  apiBase: 'https://localhost:7292/api',
  map: {
    accessToken: 'not-needed-for-osm',
    style: {
      version: 8,
      sources: {
        'osm-tiles': {
          type: 'raster',
          tiles: [
            'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
            'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
            'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
          ],
          tileSize: 256,
          attribution: '© OpenStreetMap contributors',
        },
      },
      layers: [{ id: 'osm-tiles', type: 'raster', source: 'osm-tiles' }],
    } as any,
    defaultCenter: [106.7, 10.77] as [number, number], // trung tâm HCM
    defaultZoom: 13,
  },
  osrm: {
    profiles: ['car', 'motorbike', 'truck'] as const,
    defaultProfile: 'car' as const,
  },
};
