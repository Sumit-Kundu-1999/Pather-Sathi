import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DonorRecords } from './donor-records';

describe('DonorRecords', () => {
  let component: DonorRecords;
  let fixture: ComponentFixture<DonorRecords>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DonorRecords],
    }).compileComponents();

    fixture = TestBed.createComponent(DonorRecords);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
