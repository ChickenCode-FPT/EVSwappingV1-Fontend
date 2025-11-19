import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BatteryModelService } from '../../services/battery-model.service';
import { BatteryModel } from '../../models/battery-model.model';

@Component({
  selector: 'app-battery-model-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './battery-model-list.component.html',
  styleUrls: ['./battery-model-list.component.css'],
})
export class BatteryModelListComponent implements OnInit {
  private api = inject(BatteryModelService);
  private router = inject(Router);

  list: BatteryModel[] = [];
  loading = true;
  error = '';

  ngOnInit() {
    this.api.getAll().subscribe({
      next: (res) => {
        this.list = res;
        this.loading = false;
      },
      error: () => {
        this.error = 'Không tải được danh sách model pin.';
        this.loading = false;
      },
    });
  }

  add() {
    this.router.navigate(['/battery-model/add']);
  }

  edit(id: number) {
    this.router.navigate(['/battery-model/edit', id]);
  }

  delete(id: number) {
    if (!confirm('Xóa model pin này?')) return;

    this.api.delete(id).subscribe({
      next: () => this.ngOnInit(),
      error: () => alert('Không thể xóa.'),
    });
  }
}
