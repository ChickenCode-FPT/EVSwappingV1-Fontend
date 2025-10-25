import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { BatteryModel } from '../../models/batteryModel.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BatteryModelService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  async getBatteryModels(): Promise<BatteryModel[]> {
    try {
      const url = `${this.api}/batteryModel`;
      const response = await firstValueFrom(this.http.get<BatteryModel[]>(url));
      return response;
    } catch (err) {
      console.warn('getBatteryModels fallback - returning empty', err);
      return [];
    }
  }
}
