// battery-model.ts

import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { BatteryModel } from '../../models/batteryModel.model';
import { BatteryModelService } from '../services/battery-model-service';

@Component({
  selector: 'app-battery-models',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    // Angular Material Modules
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatIconModule,
    MatChipsModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './battery-model.html',
  styleUrls: ['./battery-model.css']
})
export class BatteryModels implements OnInit {
  private svc = inject(BatteryModelService);

  models = signal<BatteryModel[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  // filters (signals)
  search = signal<string>('');
  manufacturer = signal<string>(''); // '' means all
  chemistry = signal<string>(''); // '' means all
  capacityMin = signal<number | null>(null);
  capacityMax = signal<number | null>(null);
  sortBy = signal<'capacityAsc' | 'capacityDesc' | 'newest' | ''>('');

  // derived lists for filter selects
  manufacturers = computed(() => Array.from(new Set(this.models().map(m => m.manufacturer))).sort());
  chemistries = computed(() => Array.from(new Set(this.models().map(m => m.chemistry))).sort());

  // filtered & sorted result
  filteredModels = computed(() => {
    const q = this.search().trim().toLowerCase();
    const man = this.manufacturer();
    const chem = this.chemistry();
    const min = this.capacityMin();
    const max = this.capacityMax();

    let list = this.models().filter(m => {
      if (man && m.manufacturer !== man) return false;
      if (chem && m.chemistry !== chem) return false;
      if (min != null && m.capacityKwh < min) return false;
      if (max != null && m.capacityKwh > max) return false;
      if (q) {
        return (
          m.modelCode.toLowerCase().includes(q) ||
          m.manufacturer.toLowerCase().includes(q) ||
          m.chemistry.toLowerCase().includes(q)
        );
      }
      return true;
    });

    switch (this.sortBy()) {
      case 'capacityAsc':
        list = list.sort((a, b) => a.capacityKwh - b.capacityKwh);
        break;
      case 'capacityDesc':
        list = list.sort((a, b) => b.capacityKwh - a.capacityKwh);
        break;
      case 'newest':
        list = list.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
        break;
      default:
        break;
    }

    return list;
  });

  // UI helpers
  gridCols = computed(() => 3); // responsive-ish, CSS handles more accurately

  displayedCount = computed(() => this.filteredModels().length);

  async ngOnInit() {
    await this.loadModels();
  }

  // name getBatteryModels without Async suffix
  async loadModels() {
    this.loading.set(true);
    this.error.set(null);
    try {
      const data = await this.svc.getBatteryModels();
      this.models.set(data);
    } catch (e: any) {
      console.error(e);
      this.error.set('Không thể tải dữ liệu mô hình pin.');
      this.models.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  clearFilters() {
    this.search.set('');
    this.manufacturer.set('');
    this.chemistry.set('');
    this.capacityMin.set(null);
    this.capacityMax.set(null);
    this.sortBy.set('');
  }

  // helper to convert compatibleVehicleTypes string into array
  vehicleTypes(model: BatteryModel) {
    return (model.compatibleVehicleTypes || '').split(';').map(s => s.trim()).filter(Boolean);
  }

  // Helper method to parse float
  parseToFloat(value: string): number | null {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
  }
}