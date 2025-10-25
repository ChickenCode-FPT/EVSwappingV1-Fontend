import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BatteryTransaction } from './battery-transaction';

describe('BatteryTransaction', () => {
  let component: BatteryTransaction;
  let fixture: ComponentFixture<BatteryTransaction>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BatteryTransaction]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BatteryTransaction);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
