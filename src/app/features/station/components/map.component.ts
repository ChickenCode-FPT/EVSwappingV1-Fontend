// src\app\features\station\components\map.component.ts
import { Component, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { GeolocationService } from '../services/geolocation.service';
import { StationApi } from '../services/station.api';
import { Station } from '../models/station.model';
import { decodePolyline, buildRouteGeoJson } from '../utils/map-utils';
import { MapService } from '../services/map.service';

import {
  MAPBOX_TOKEN,
  MAPBOX_STYLE,
  MAPBOX_DEFAULT_CENTER,
  MAPBOX_DEFAULT_ZOOM,
} from '../tokens/mapbox.token';
import { environment } from '../../../../environments/environment';

// Panel danh sách trạm (standalone)
import { StationListComponent } from './station-list/station-list.component';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, FormsModule, StationListComponent],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
  providers: [
    { provide: MAPBOX_TOKEN, useValue: environment.map.accessToken },
    { provide: MAPBOX_STYLE, useValue: environment.map.style },
    { provide: MAPBOX_DEFAULT_CENTER, useValue: environment.map.defaultCenter },
    { provide: MAPBOX_DEFAULT_ZOOM, useValue: environment.map.defaultZoom },
  ],
})
export class MapComponent implements AfterViewInit {
  map: any;
  mapboxgl: any;
  isBrowser = false;

  start: [number, number] | null = null;
  driverMarker: any;

  // tổng distance/duration của route hiện tại
  distanceKm = 0;
  durationMin = 0;

  geoError = false;
  geoStatusMsg = '';

  routeInfoControl: any;
  stations: Station[] = [];

  // trạng thái cho nút “Tìm trạm gần nhất”
  findingNearest = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private geoService: GeolocationService,
    private stationApi: StationApi,
    private mapSvc: MapService,
    @Inject(MAPBOX_TOKEN) private accessToken: string,
    @Inject(MAPBOX_STYLE) private style: any,
    @Inject(MAPBOX_DEFAULT_CENTER) private defaultCenter: [number, number],
    @Inject(MAPBOX_DEFAULT_ZOOM) private defaultZoom: number
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  // ===== util tính khoảng cách (km) theo Haversine (client-side) =====
  private distanceKmHaversine(a: [number, number], b: [number, number]): number {
    const toRad = (d: number) => (d * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(b[1] - a[1]);
    const dLon = toRad(b[0] - a[0]);
    const lat1 = toRad(a[1]);
    const lat2 = toRad(b[1]);
    const sinDlat = Math.sin(dLat / 2);
    const sinDlon = Math.sin(dLon / 2);
    const h = sinDlat * sinDlat + Math.cos(lat1) * Math.cos(lat2) * sinDlon * sinDlon;
    return 2 * R * Math.asin(Math.sqrt(h));
  }

  private recomputeDistancesFromUser() {
    if (!this.start || !this.stations?.length) return;
    const from = this.start;
    this.stations = this.stations.map((s) => {
      if (s.longitude && s.latitude) {
        const d = this.distanceKmHaversine(from, [s.longitude, s.latitude]);
        return { ...s, distanceKm: Number(d.toFixed(2)) };
      }
      return s;
    });
  }

  private touchStationsArrayForChangeDetection() {
    // tạo mảng mới để Angular detect thay đổi
    this.stations = [...this.stations];
  }

  async ngAfterViewInit() {
    if (!this.isBrowser) return;

    this.mapboxgl = await this.mapSvc.loadMapbox();
    this.mapboxgl.accessToken = this.accessToken;

    this.map = this.mapSvc.createMap(this.mapboxgl, {
      container: 'map',
      style: this.style,
      center: this.defaultCenter,
      zoom: this.defaultZoom,
    });

    this.map.on('load', async () => {
      await this.loadStations();
      this.addStationMarkers();
      this.initDriver();
      this.addRouteInfoControl();
    });
  }

  private async loadStations() {
    try {
      const data = await firstValueFrom(this.stationApi.getStations());
      if (!data) return;
      this.stations = data.map((s) => ({
        ...s,
        coords: [s.longitude, s.latitude] as [number, number],
      }));
      // nếu đã có vị trí user thì tính distance luôn
      if (this.start) {
        this.recomputeDistancesFromUser();
        this.touchStationsArrayForChangeDetection();
      }
    } catch (err) {
      console.error('❌ Không tải được danh sách trạm:', err);
    }
  }

  private async initDriver() {
    try {
      this.start = await this.geoService.getCurrentLocation(
        true, // enableHighAccuracy
        3, // max retry
        2000, // timeout per try
        (msg) => {
          this.geoStatusMsg = msg;
          this.updateRouteInfoControl();
        }
      );

      this.addOrUpdateDriverMarker();
      this.geoError = false;

      // cập nhật distance cho list khi đã có vị trí
      this.recomputeDistancesFromUser();
      this.touchStationsArrayForChangeDetection();

      // theo dõi vị trí tài xế (KHÔNG tự động tìm nearest)
      this.geoService.watchLocation(async (coords) => {
        this.start = coords;
        this.addOrUpdateDriverMarker();

        // cập nhật distance khi vị trí thay đổi
        this.recomputeDistancesFromUser();
        this.touchStationsArrayForChangeDetection();

        // nếu muốn clear route khi di chuyển:
        // this.mapSvc.clearRoute(this.map);
      });
    } catch (err) {
      console.error('❌ Không lấy được vị trí:', err);
      this.geoError = true;
      this.updateRouteInfoControl();
    }
  }

  private addOrUpdateDriverMarker() {
    if (!this.start) return;
    if (!this.driverMarker) {
      this.driverMarker = this.mapSvc
        .createMarker(this.mapboxgl, this.mapSvc.colors.driver, this.start, '<b>Driver 🚖</b>')
        .addTo(this.map);
    } else {
      this.driverMarker.setLngLat(this.start);
    }
  }

  private addStationMarkers() {
    this.stations.forEach((station, index) => {
      const popup = document.createElement('div');
      popup.className = 'text-sm';
      popup.innerHTML = `
        <b>${station.name}</b><br/>
        <button id="btn-${index}"
          class="mt-1 bg-blue-500 hover:bg-blue-600 text-white text-xs px-2 py-1 rounded">
          Đi đến trạm này
        </button>
      `;

      const m = this.mapSvc.createMarker(this.mapboxgl, this.mapSvc.colors.station, station.coords);
      m.setPopup(new this.mapboxgl.Popup().setDOMContent(popup)).addTo(this.map);
      this.stations[index].marker = m;

      setTimeout(() => {
        const btn = popup.querySelector<HTMLButtonElement>(`#btn-${index}`);
        if (btn)
          btn.addEventListener('click', async () => {
            if (this.start) {
              const [lng, lat] = this.start;
              await this.drawRouteToStation(station.stationId, lng, lat);
              // fly đến trạm
              if (station.longitude && station.latitude) {
                this.map.flyTo({
                  center: [station.longitude, station.latitude],
                  zoom: Math.max(this.map.getZoom(), 14),
                });
              }
            }
          });
      });
    });
  }

  /** Backend trả về MỘT Station gần nhất → gọi route đến station đó */
  private async findNearestStationAndRoute() {
    if (!this.start) {
      console.warn('⚠️ Chưa có vị trí người dùng.');
      return;
    }
    if (!this.stations.length) {
      await this.loadStations();
    }

    const [lng, lat] = this.start;

    try {
      this.setFinding(true, '🔎 Đang tìm trạm gần nhất…');
      const nearestStation = await firstValueFrom(this.stationApi.getNearestStation(lng, lat));
      if (!nearestStation) {
        this.setFinding(false, 'Không tìm thấy trạm gần.');
        return;
      }

      // vẽ route + cập nhật distance/duration
      await this.drawRouteToStation(nearestStation.stationId, lng, lat);

      // pan/zoom đến trạm
      if (nearestStation.longitude && nearestStation.latitude) {
        this.map.flyTo({
          center: [nearestStation.longitude, nearestStation.latitude],
          zoom: Math.max(this.map.getZoom(), 14),
        });
      }

      this.setFinding(false, '✅ Đã tìm thấy trạm gần nhất.');
    } catch (err) {
      console.error('❌ Lỗi khi tìm nearest station:', err);
      this.setFinding(false, '❌ Lỗi tìm trạm gần nhất.');
    }
  }

  private async drawRouteToStation(stationId: number, lng: number, lat: number) {
    try {
      const route = await firstValueFrom(this.stationApi.getRouteToStation(stationId, lng, lat));
      if (!route?.routes?.length) return;

      const r = route.routes[0];
      const coords = decodePolyline(r.geometry);
      this.distanceKm = parseFloat((r.distance / 1000).toFixed(2));
      this.durationMin = Math.round(r.duration / 60);
      const geojson = buildRouteGeoJson(coords);

      this.mapSvc.addOrUpdateRoute(this.map, geojson);
      this.updateRouteInfoControl();

      // cập nhật vào item đã chọn (để sort by duration hoạt động sau lần đầu)
      const idx = this.stations.findIndex((s) => s.stationId === stationId);
      if (idx >= 0) {
        this.stations[idx] = {
          ...this.stations[idx],
          distanceKm: this.distanceKm,
          durationMin: this.durationMin,
        };
        this.touchStationsArrayForChangeDetection();
      }
    } catch (err) {
      console.error('❌ Lỗi lấy route từ backend:', err);
    }
  }

  // === được gọi từ panel list (event selectStation) ===
  async onSelectStation(station: Station) {
    if (!this.start) {
      console.warn('⚠️ Chưa có vị trí người dùng.');
      return;
    }
    const [lng, lat] = this.start;
    await this.drawRouteToStation(station.stationId, lng, lat);

    // fly đến trạm
    if (station.longitude && station.latitude) {
      this.map.flyTo({
        center: [station.longitude, station.latitude],
        zoom: Math.max(this.map.getZoom(), 14),
      });
    }
  }

  async goToNearestStation() {
    await this.findNearestStationAndRoute();
  }

  // ==== UI Control ở góc map ====
  // ==== UI Control ở góc map ====
  private addRouteInfoControl() {
    const ctrlDiv = document.createElement('div');
    ctrlDiv.className = 'mapboxgl-ctrl custom-control route-info-box';

    ctrlDiv.innerHTML = `
    <h3 class="route-info-title">Nearest Station Route</h3>
    <div class="route-info-content">
      <div class="info-row">
        📏 Distance:
        <span id="ctrl-distance" class="info-value">${this.distanceKm} km</span>
      </div>
      <div class="info-row">
        ⏱ Duration:
        <span id="ctrl-duration" class="info-value">${this.durationMin} min</span>
      </div>
    </div>

    <button id="ctrl-btn" class="route-btn route-btn-primary">
      Tìm trạm gần nhất
    </button>

    <div id="ctrl-status" class="route-status">
      ${this.geoStatusMsg ?? ''}
    </div>

    <button id="ctrl-retry" style="display:none" class="route-btn route-btn-secondary">
      Thử lại định vị
    </button>
  `;

    const customControl = {
      onAdd: () => ctrlDiv,
      onRemove: () => ctrlDiv.parentNode?.removeChild(ctrlDiv),
    };

    this.map.addControl(customControl, 'top-left');
    this.routeInfoControl = { ctrlDiv };

    // Gắn sự kiện sau khi render
    setTimeout(() => {
      const btn = ctrlDiv.querySelector<HTMLButtonElement>('#ctrl-btn');
      const retryBtn = ctrlDiv.querySelector<HTMLButtonElement>('#ctrl-retry');

      if (btn) {
        btn.addEventListener('click', async () => {
          console.log('▶️ Nút "Tìm trạm gần nhất" được bấm');
          await this.goToNearestStation();
        });
      }

      if (retryBtn) {
        retryBtn.addEventListener('click', () => {
          console.log('🔁 Nút "Thử lại định vị" được bấm');
          this.retryGeolocation();
        });
      }
    }, 300);
  }

  private retryGeolocation() {
    this.geoError = false;
    this.geoStatusMsg = '';
    this.updateRouteInfoControl();
    this.initDriver();
  }

  private updateRouteInfoControl() {
    if (!this.routeInfoControl) return;
    const { ctrlDiv } = this.routeInfoControl;
    const distEl = ctrlDiv.querySelector('#ctrl-distance');
    const durEl = ctrlDiv.querySelector('#ctrl-duration');
    const statusEl = ctrlDiv.querySelector('#ctrl-status');
    const retryBtn = ctrlDiv.querySelector('#ctrl-retry') as HTMLElement;

    if (distEl) distEl.textContent = `${this.distanceKm} km`;
    if (durEl) durEl.textContent = `${this.durationMin} min`;
    if (statusEl) statusEl.textContent = this.geoStatusMsg ?? '';
    if (retryBtn) retryBtn.style.display = this.geoError ? 'block' : 'none';

    // cập nhật label/trạng thái nút
    const btn = (ctrlDiv as HTMLElement).querySelector('#ctrl-btn') as HTMLButtonElement | null;
    if (btn) {
      btn.disabled = this.findingNearest;
      btn.textContent = this.findingNearest ? 'Đang tìm…' : 'Tìm trạm gần nhất';
    }
  }

  private setFinding(isFinding: boolean, status?: string) {
    this.findingNearest = isFinding;
    if (status) this.geoStatusMsg = status;
    this.updateRouteInfoControl();
  }
}
