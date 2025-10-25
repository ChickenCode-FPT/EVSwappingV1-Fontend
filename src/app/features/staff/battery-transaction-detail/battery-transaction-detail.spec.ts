import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BatteryTransactionDetail } from './battery-transaction-detail';

describe('BatteryTransactionDetail', () => {
  let component: BatteryTransactionDetail;
  let fixture: ComponentFixture<BatteryTransactionDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BatteryTransactionDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BatteryTransactionDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
