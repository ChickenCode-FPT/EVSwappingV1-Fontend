import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterTransferList } from './inter-transfer-list';

describe('InterTransferList', () => {
  let component: InterTransferList;
  let fixture: ComponentFixture<InterTransferList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterTransferList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterTransferList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
