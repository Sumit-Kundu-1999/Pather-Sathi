import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SpecialChild } from './special-child';

describe('SpecialChild', () => {
  let component: SpecialChild;
  let fixture: ComponentFixture<SpecialChild>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpecialChild],
    }).compileComponents();

    fixture = TestBed.createComponent(SpecialChild);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
