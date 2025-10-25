import { Component, OnInit } from '@angular/core';
import { Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { BatteriesDto } from '../../models/battery.model';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-battery-detail-dialog',
  templateUrl: './battery-detail-dialog.html',
  imports: [MatDialogModule, MatFormFieldModule, CommonModule, DatePipe],
  styleUrls: ['./battery-detail-dialog.css']
})
export class BatteryDetailDialog implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: BatteriesDto,
    private dialogRef: MatDialogRef<BatteryDetailDialog>
  ) { }

  ngOnInit() {
    // Using inject() to get MAT_DIALOG_DATA inside ngOnInit
    console.log('Dialog Data:', this.data);
  }

  close(): void {
    this.dialogRef.close();
  }
}
