import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BACKEND_URL_PREFIX } from '@pather-sathi/config'
import { AuthService } from '@pather-sathi/auth'

export interface Donor {
  _id?: string;
  name: string;
  amount: number;
  year: number;
  adminName: string;
  address?: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface DonorRecord {
  donors: Donor[];
}

interface GroupedDonors {
  year: number;
  donors: Donor[];
  totalAmount: number;
  isExpanded?: boolean;
}

@Component({
  selector: 'app-donor-record',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './donor-records.html',
  styleUrls: ['./donor-records.css']
})
export class DonorRecordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  private authService = inject(AuthService);

  // Replace with your actual API endpoint
  private apiUrl = `${BACKEND_URL_PREFIX}/donors`;

  donorForm: FormGroup;
  groupedDonors: GroupedDonors[] = [];
  isLoading = true;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  allDonors: Donor[] = [];
  uniqueAdmins: string[] = [];
  selectedAdmin: string = '';
  selectedAdminTotal: number = 0;

  get token() {
    return this.authService.getToken();
  }

  constructor() {
    const currentYear = new Date().getFullYear();
    this.donorForm = this.fb.group({
      name: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(1)]],
      year: [currentYear, [Validators.required, Validators.min(2000)]],
      adminName: ['', Validators.required],
      address: [''],
      phone: [''] // Optional
    });
  }

  ngOnInit() {
    this.loadDonors();
  }

  loadDonors() {
    this.isLoading = true;
    this.http.get<DonorRecord>(
      `${this.apiUrl}/records`,
      {
        headers:{
          'Cache-Control': 'no-cache'
        }
      }
    ).subscribe({
      next: (data) => {
        this.processDonorData(data.donors);
        this.allDonors = data.donors;
        this.processDonorData(data.donors);
        this.extractUniqueAdmins(); // Extract admins for dropdown
        this.calculateAdminTotal();
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error fetching donors', err);
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  // Extract unique admin names from the fetched data
  extractUniqueAdmins() {
    const admins = new Set(this.allDonors.map(d => d.adminName).filter(name => !!name));
    this.uniqueAdmins = Array.from(admins).sort();
  }

  onAdminSelect(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedAdmin = target.value;
    this.calculateAdminTotal();
  }

  calculateAdminTotal() {
    if (!this.selectedAdmin) {
      this.selectedAdminTotal = 0;
      return;
    }
    
    this.selectedAdminTotal = this.allDonors
      .filter(donor => donor.adminName === this.selectedAdmin)
      .reduce((sum, donor) => sum + donor.amount, 0);
  }

  processDonorData(data: Donor[]) {
    // Group by year
    const grouped = data.reduce((acc, curr) => {
      if (!acc[curr.year]) {
        acc[curr.year] = { year: curr.year, donors: [], totalAmount: 0 };
      }
      acc[curr.year].donors.push(curr);
      acc[curr.year].totalAmount += curr.amount;
      return acc;
    }, {} as Record<number, GroupedDonors>);

    // Convert object to array and sort by year descending (e.g., 2026, 2025)
    this.groupedDonors = Object.values(grouped).sort((a, b) => b.year - a.year);
  }

  onSubmit() {
    if (this.donorForm.invalid) {
      this.donorForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.http.post(
      `${this.apiUrl}/donor/details`, 
      this.donorForm.value,
      {
        headers:{
          'authorization': `Bearer ${this.token}`
        }
      }
    ).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.successMessage = 'Donor record added successfully!';

        // Reset form but keep the current year
        const currentYear = this.donorForm.get('year')?.value;
        this.donorForm.reset({ year: currentYear });

        // Refresh the list
        this.loadDonors();

        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        console.error(err);
        this.authService.logoutDueToInvalidToken(err.error.message);
        this.isSubmitting = false;
        this.errorMessage = 'Failed to add donor record. Please try again.';
      }
    });
  }

  toggleAccordion(clickedGroup: GroupedDonors) {
    // If clicking the one that is already open, just close it
    if (clickedGroup.isExpanded) {
      clickedGroup.isExpanded = false;
      return;
    }

    // Close all others, then open the clicked one
    this.groupedDonors.forEach(group => group.isExpanded = false);
    clickedGroup.isExpanded = true;
    this.cdr.markForCheck();
  }
}