import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobileSvgSeatSelectorComponent } from './mobile-svg-seat-selector.component';

describe('MobileSvgSeatSelectorComponent', () => {
  let component: MobileSvgSeatSelectorComponent;
  let fixture: ComponentFixture<MobileSvgSeatSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobileSvgSeatSelectorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MobileSvgSeatSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
