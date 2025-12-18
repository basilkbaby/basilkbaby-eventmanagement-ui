import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeatMapSectionComponent } from './seatmap-section.component';

describe('SeatMapSectionComponent', () => {
  let component: SeatMapSectionComponent;
  let fixture: ComponentFixture<SeatMapSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeatMapSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeatMapSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
