import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VolunteersManagement } from './volunteers-management';

describe('VolunteersManagement', () => {
  let component: VolunteersManagement;
  let fixture: ComponentFixture<VolunteersManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VolunteersManagement],
    }).compileComponents();

    fixture = TestBed.createComponent(VolunteersManagement);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
