import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientsSectionComponent } from './patients-section.component';

describe('PatientsSectionComponent', () => {
  let component: PatientsSectionComponent;
  let fixture: ComponentFixture<PatientsSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientsSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientsSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
