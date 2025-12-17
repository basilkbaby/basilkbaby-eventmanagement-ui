import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FullSeatmapComponent } from './full-seatmap.component';

describe('FullSeatmapComponent', () => {
  let component: FullSeatmapComponent;
  let fixture: ComponentFixture<FullSeatmapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FullSeatmapComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FullSeatmapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
