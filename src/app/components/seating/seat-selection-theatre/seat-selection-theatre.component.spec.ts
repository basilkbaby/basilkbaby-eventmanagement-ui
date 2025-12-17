import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeatSelectionTheatreComponent } from './seat-selection-theatre.component';

describe('SeatSelectionTheatreComponent', () => {
  let component: SeatSelectionTheatreComponent;
  let fixture: ComponentFixture<SeatSelectionTheatreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeatSelectionTheatreComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeatSelectionTheatreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
