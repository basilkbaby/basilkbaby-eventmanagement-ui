import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobileSectionSelectorComponent } from './mobile-section-selector.component';

describe('MobileSectionSelectorComponent', () => {
  let component: MobileSectionSelectorComponent;
  let fixture: ComponentFixture<MobileSectionSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobileSectionSelectorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MobileSectionSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
