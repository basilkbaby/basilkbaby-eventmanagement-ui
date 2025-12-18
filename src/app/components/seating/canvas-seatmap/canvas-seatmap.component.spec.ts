import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CanvasSeatMapComponent } from './canvas-seatmap.component';

describe('CanvasSeatMapComponent', () => {
  let component: CanvasSeatMapComponent;
  let fixture: ComponentFixture<CanvasSeatMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CanvasSeatMapComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CanvasSeatMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
