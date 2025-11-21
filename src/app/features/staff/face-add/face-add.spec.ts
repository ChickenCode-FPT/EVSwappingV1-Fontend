import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaceAdd } from './face-add';

describe('FaceAdd', () => {
  let component: FaceAdd;
  let fixture: ComponentFixture<FaceAdd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaceAdd]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FaceAdd);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
