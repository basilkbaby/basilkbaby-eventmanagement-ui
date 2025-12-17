import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobileSeatSelectorComponent } from './mobile-seat-selector.component';

describe('MobileSeatSelectorComponent', () => {
  let component: MobileSeatSelectorComponent;
  let fixture: ComponentFixture<MobileSeatSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobileSeatSelectorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MobileSeatSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
