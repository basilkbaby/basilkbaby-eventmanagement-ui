import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VenueSectionComponent } from './venue-section.component';

describe('VenueSectionComponent', () => {
  let component: VenueSectionComponent;
  let fixture: ComponentFixture<VenueSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VenueSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VenueSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
