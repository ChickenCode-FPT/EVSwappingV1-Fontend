import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BatteryModelService } from '../../services/battery-model.service';
import { BatteryModel } from '../../models/battery-model.model';

@Component({
  selector: 'app-battery-model-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './battery-model-edit.component.html',
  styleUrls: ['./battery-model-edit.component.css'],
})
export class BatteryModelEditComponent implements OnInit {
  private api = inject(BatteryModelService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  id!: number;

  form: any = {};
  loading = true;
  error = '';

  ngOnInit() {
    this.id = Number(this.route.snapshot.paramMap.get('id'));

    this.api.getById(this.id).subscribe({
      next: (data: BatteryModel) => {
        this.form = { ...data };
        this.loading = false;
      },
      error: () => {
        this.error = 'Không tải được dữ liệu.';
        this.loading = false;
      },
    });
  }

  submit() {
    this.api.update(this.id, this.form).subscribe({
      next: () => this.router.navigate(['/battery-model']),
      error: () => (this.error = 'Không thể cập nhật.'),
    });
  }
}
