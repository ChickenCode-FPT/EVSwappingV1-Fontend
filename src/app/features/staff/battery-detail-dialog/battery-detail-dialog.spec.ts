import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BatteryDetailDialog } from './battery-detail-dialog';

describe('BatteryDetailDialog', () => {
  let component: BatteryDetailDialog;
  let fixture: ComponentFixture<BatteryDetailDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BatteryDetailDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BatteryDetailDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
