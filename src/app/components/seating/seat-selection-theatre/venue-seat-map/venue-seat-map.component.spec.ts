import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VenueSeatMapComponent } from './venue-seat-map.component';

describe('VenueSeatMapComponent', () => {
  let component: VenueSeatMapComponent;
  let fixture: ComponentFixture<VenueSeatMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VenueSeatMapComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VenueSeatMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
