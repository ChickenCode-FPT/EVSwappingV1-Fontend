import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BatteryModels } from './battery-model';

describe('BatteryModel', () => {
  let component: BatteryModels;
  let fixture: ComponentFixture<BatteryModels>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BatteryModels]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BatteryModels);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
