import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GridSeatmapComponent } from './svg-seatmap.component';

describe('GridSeatmapComponent', () => {
  let component: GridSeatmapComponent;
  let fixture: ComponentFixture<GridSeatmapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GridSeatmapComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GridSeatmapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
