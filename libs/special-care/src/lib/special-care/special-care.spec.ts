import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SpecialCare } from './special-care';

describe('SpecialCare', () => {
  let component: SpecialCare;
  let fixture: ComponentFixture<SpecialCare>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpecialCare],
    }).compileComponents();

    fixture = TestBed.createComponent(SpecialCare);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
