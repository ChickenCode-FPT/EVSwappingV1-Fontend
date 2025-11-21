import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterTransferCreate } from './inter-transfer-create';

describe('InterTransferCreate', () => {
  let component: InterTransferCreate;
  let fixture: ComponentFixture<InterTransferCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterTransferCreate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterTransferCreate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
