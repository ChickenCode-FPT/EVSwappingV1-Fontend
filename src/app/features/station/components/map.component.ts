import { Component, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { GeolocationService } from '../services/geolocation.service';
import { StationApi } from '../services/station.api';
import { Station } from '../models/station.model';
import { VehicleProfile } from '../../station/models/osrm.types';

import { decodePolyline, buildRouteGeoJson } from '../utils/map-utils';
import { MapService } from '../services/map.service';
import {
  MAPBOX_TOKEN,
  MAPBOX_STYLE,
  MAPBOX_DEFAULT_CENTER,
  MAPBOX_DEFAULT_ZOOM,
} from '../tokens/mapbox.token';
import { environment } from '../../../../environments/environment';
import { StationListComponent } from './station-list/station-list.component';

import { ReservationFormComponent } from '../../../features/reservations/components/reservation-form/reservation-form.component';
import { ReservationDto } from '../../../features/reservations/models/reservation.types';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, FormsModule, StationListComponent, ReservationFormComponent],
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

  distanceKm = 0;
  durationMin = 0;

  geoError = false;
  geoStatusMsg = '';

  routeInfoControl: any;
  stations: Station[] = [];

  findingNearest = false;

  profiles: VehicleProfile[] = [...environment.osrm.profiles];
  profile: VehicleProfile = environment.osrm.defaultProfile;

  private markersById: Record<number, any> = {};

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

  private distanceKmHaversine(a: [number, number], b: [number, number]): number {
    const toRad = (d: number) => (d * Math.PI) / 180;
    const R = 6371;
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
      this.initDriver();
      this.addRouteInfoControl();
    });
  }

  private async loadStations() {
    try {
      let data: Station[] | null = null;

      if (this.start) {
        const [lng, lat] = this.start;
        data = await firstValueFrom(this.stationApi.getStationsWithDistance(lng, lat));
      } else {
        data = await firstValueFrom(this.stationApi.getStations());
      }

      if (!data) return;

      this.stations = data.map((s) => ({
        ...s,
        coords: [s.longitude, s.latitude] as [number, number],
      }));

      if (this.start && !this.stations[0]?.distanceKm) {
        this.recomputeDistancesFromUser();
      }

      this.touchStationsArrayForChangeDetection();
      this.syncStationMarkers();
    } catch (err) {
      console.error('❌ Không tải được danh sách trạm:', err);
    }
  }

  private async initDriver() {
    try {
      this.start = await this.geoService.getCurrentLocation(
        true,
        3,
        2000,
        (msg) => this.updateGeoStatus(msg)
      );

      this.addOrUpdateDriverMarker();
      this.geoError = false;

      await this.loadStations();

      this.geoService.watchLocation(async (coords) => {
        this.start = coords;
        this.addOrUpdateDriverMarker();
        this.recomputeDistancesFromUser();
        this.touchStationsArrayForChangeDetection();
      });
    } catch (err) {
      console.error('❌ Không lấy được vị trí:', err);
      this.geoError = true;
      this.updateGeoStatus('❌ Không thể lấy vị trí hiện tại. Vui lòng kiểm tra quyền truy cập vị trí.');
    }
  }

  private updateGeoStatus(raw: string) {
    let friendly = raw;

    if (raw.includes('Thử lấy vị trí…')) {
      friendly = '📡 Đang thử lấy vị trí…';
    } else if (raw.includes('✅ Lấy vị trí thành công')) {
      friendly = '✅ Đã lấy vị trí!';
    } else if (raw.includes('HighAccuracy fail')) {
      friendly = '⚠️ Độ chính xác cao thất bại, đang thử chế độ tiêu chuẩn…';
    } else if (raw.includes('Không thể lấy vị trí')) {
      friendly = '❌ Không thể lấy vị trí. Hãy bật GPS/quyền truy cập vị trí và thử lại.';
    } else if (raw.includes('không hỗ trợ')) {
      friendly = '⚠️ Trình duyệt không hỗ trợ định vị. Hãy nhập vị trí thủ công.';
    }

    this.geoStatusMsg = friendly;
    this.updateRouteInfoControl();
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

  private syncStationMarkers() {
    if (!this.map || !this.mapboxgl) return;

    const currentIds = new Set(this.stations.map((s) => s.stationId));

    for (const id of Object.keys(this.markersById).map(Number)) {
      if (!currentIds.has(id)) {
        try {
          this.markersById[id]?.remove();
        } catch {}
        delete this.markersById[id];
      }
    }

    this.stations.forEach((station) => {
      const coords: [number, number] = [station.longitude, station.latitude];

      if (!this.markersById[station.stationId]) {
        const popupEl = this.buildStationPopup(station);
        const marker = this.mapSvc
          .createMarker(this.mapboxgl, this.mapSvc.colors.station, coords)
          .setPopup(new this.mapboxgl.Popup().setDOMContent(popupEl))
          .addTo(this.map);

        this.markersById[station.stationId] = marker;
      } else {
        this.markersById[station.stationId].setLngLat(coords);
      }
    });
  }

  private buildStationPopup(station: Station): HTMLDivElement {
    const wrap = document.createElement('div');
    wrap.className = 'popup-card';
    wrap.innerHTML = `
      <div class="popup-title">${station.name}</div>
      <div class="popup-meta">${station.address ?? ''}</div>

      <div class="popup-actions">
        <button class="popup-btn" id="go-${station.stationId}">Đi đến trạm này</button>
      </div>
    `;

    const goBtn = wrap.querySelector<HTMLButtonElement>(`#go-${station.stationId}`);
    goBtn?.addEventListener('click', async () => {
      if (!this.start) return;
      const [lng, lat] = this.start;
      await this.drawRouteToStation(station.stationId, lng, lat);
      if (station.longitude && station.latitude) {
        this.map.flyTo({
          center: [station.longitude, station.latitude],
          zoom: Math.max(this.map.getZoom(), 14),
        });
      }
    });

    return wrap;
  }

  /** ========================= ĐẶT LỊCH (modal) ========================= */
  showReservation = false;
  selectedStationId?: number;

  // Mở modal đặt lịch: chỉ cần stationId (model pin & user được BE quyết định)
  openReservation(e: { station: Station; batteryModelId?: number | null }) {
    this.selectedStationId = e.station.stationId;
    this.showReservation = true;

    queueMicrotask(() => {
      const el = document.querySelector('.modal') as HTMLElement | null;
      el?.focus();
    });
  }

  closeReservation() {
    this.showReservation = false;
  }

  onReservationCreated(res: ReservationDto) {
    this.closeReservation();
    // Optional: cập nhật availableBatteries nếu có
    const idx = this.stations.findIndex((s) => s.stationId === this.selectedStationId);
    if (idx >= 0 && (this.stations[idx].availableBatteries ?? 0) > 0) {
      this.stations[idx] = {
        ...this.stations[idx],
        availableBatteries: (this.stations[idx].availableBatteries ?? 0) - 1,
      };
      this.touchStationsArrayForChangeDetection();
    }
  }
  /** ==================================================================== */

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
      const nearestStation = await firstValueFrom(
        this.stationApi.getNearestStation(lng, lat, this.profile)
      );
      if (!nearestStation) {
        this.setFinding(false, 'Không tìm thấy trạm gần.');
        return;
      }

      await this.drawRouteToStation(nearestStation.stationId, lng, lat);

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
      const route = await firstValueFrom(
        this.stationApi.getRouteToStation(stationId, lng, lat, this.profile)
      );
      if (!route?.routes?.length) return;

      const r = route.routes[0];
      const coords = decodePolyline(r.geometry);
      this.distanceKm = parseFloat((r.distance / 1000).toFixed(2));
      this.durationMin = Math.round(r.duration / 60);
      const geojson = buildRouteGeoJson(coords);

      this.mapSvc.addOrUpdateRoute(this.map, geojson);
      this.updateRouteInfoControl();

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

  async onSelectStation(station: Station) {
    if (!this.start) {
      console.warn('⚠️ Chưa có vị trí người dùng.');
      return;
    }
    const [lng, lat] = this.start;
    await this.drawRouteToStation(station.stationId, lng, lat);

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

  private addRouteInfoControl() {
    const ctrlDiv = document.createElement('div');
    ctrlDiv.className = 'mapboxgl-ctrl custom-control route-info-box';

    ctrlDiv.innerHTML = `
      <h2 class="route-info-title">Nearest Station Route</h2>
      <div class="profile-group" id="profile-group">
        <button class="profile-btn" data-p="car">Car</button>
        <button class="profile-btn" data-p="motorbike">Motorbike</button>
        <button class="profile-btn" data-p="truck">Truck</button>
      </div>
      <div class="route-info-content">
        <div class="info-row">📏 Distance: <span id="ctrl-distance" class="info-value">${this.distanceKm} km</span></div>
        <div class="info-row">⏱ Duration: <span id="ctrl-duration" class="info-value">${this.durationMin} min</span></div>
      </div>
      <button id="ctrl-btn" class="route-btn route-btn-primary">Tìm trạm gần nhất</button>
      <div id="ctrl-status" class="route-status">${this.geoStatusMsg ?? ''}</div>
      <button id="ctrl-retry" style="display:none" class="route-btn route-btn-secondary">Thử lại định vị</button>
    `;

    const customControl = {
      onAdd: () => ctrlDiv,
      onRemove: () => ctrlDiv.parentNode?.removeChild(ctrlDiv),
    };
    this.map.addControl(customControl, 'top-left');
    this.routeInfoControl = { ctrlDiv };

    setTimeout(() => {
      const btn = ctrlDiv.querySelector<HTMLButtonElement>('#ctrl-btn');
      const retryBtn = ctrlDiv.querySelector<HTMLButtonElement>('#ctrl-retry');
      const group = ctrlDiv.querySelector<HTMLDivElement>('#profile-group');

      this.updateProfileButtonsActive(ctrlDiv);

      btn?.addEventListener('click', async () => {
        await this.goToNearestStation();
      });
      retryBtn?.addEventListener('click', () => this.retryGeolocation());

      group?.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const btnEl = target.closest('.profile-btn') as HTMLButtonElement | null;
        if (!btnEl) return;

        const p = btnEl.getAttribute('data-p') as VehicleProfile;
        this.setProfile(p);
        this.updateProfileButtonsActive(ctrlDiv);
      });
    }, 0);
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

    this.updateProfileButtonsActive(ctrlDiv);

    const btn = ctrlDiv.querySelector('#ctrl-btn') as HTMLButtonElement | null;
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

  private setProfile(p: VehicleProfile) {
    if (this.profile === p) return;
    this.profile = p;
    this.mapSvc.clearRoute(this.map);
    this.distanceKm = 0;
    this.durationMin = 0;
    this.updateRouteInfoControl();
  }

  private updateProfileButtonsActive(root: HTMLElement | Document = document) {
    const btns = Array.from(root.querySelectorAll<HTMLButtonElement>('.profile-btn'));
    btns.forEach((b) => {
      const p = b.getAttribute('data-p');
      if (p === this.profile) b.classList.add('active');
      else b.classList.remove('active');
    });
  }
}
