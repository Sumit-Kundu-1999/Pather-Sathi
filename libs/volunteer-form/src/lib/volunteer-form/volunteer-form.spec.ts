import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VolunteerForm } from './volunteer-form';

describe('VolunteerForm', () => {
  let component: VolunteerForm;
  let fixture: ComponentFixture<VolunteerForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VolunteerForm],
    }).compileComponents();

    fixture = TestBed.createComponent(VolunteerForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
