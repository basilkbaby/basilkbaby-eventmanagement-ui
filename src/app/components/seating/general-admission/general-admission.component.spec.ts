import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralAdmissionComponent } from './general-admission.component';

describe('GeneralAdmissionComponent', () => {
  let component: GeneralAdmissionComponent;
  let fixture: ComponentFixture<GeneralAdmissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeneralAdmissionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GeneralAdmissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
