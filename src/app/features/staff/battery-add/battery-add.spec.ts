import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BatteryAdd } from './battery-add';

describe('BatteryAdd', () => {
  let component: BatteryAdd;
  let fixture: ComponentFixture<BatteryAdd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BatteryAdd]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BatteryAdd);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
