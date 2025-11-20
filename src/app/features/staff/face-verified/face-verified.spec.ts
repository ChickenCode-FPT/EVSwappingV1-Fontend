import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaceVerified } from './face-verified';

describe('FaceVerified', () => {
  let component: FaceVerified;
  let fixture: ComponentFixture<FaceVerified>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaceVerified]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FaceVerified);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
