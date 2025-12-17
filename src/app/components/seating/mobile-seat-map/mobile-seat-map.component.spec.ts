import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobileSeatMapComponent } from './mobile-seat-map.component';

describe('MobileSeatMapComponent', () => {
  let component: MobileSeatMapComponent;
  let fixture: ComponentFixture<MobileSeatMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobileSeatMapComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MobileSeatMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
