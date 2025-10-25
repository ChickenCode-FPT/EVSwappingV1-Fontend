import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BatteryWarehouse } from './battery-warehouse';

describe('BatteryWarehouse', () => {
  let component: BatteryWarehouse;
  let fixture: ComponentFixture<BatteryWarehouse>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BatteryWarehouse]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BatteryWarehouse);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
