import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BACKEND_URL_PREFIX } from '@pather-sathi/config';
import { Router } from '@angular/router';

@Component({
  selector: 'app-volunteer-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './volunteer-form.html',
  styleUrls: ['./volunteer-form.css']
})
export class VolunteerFormComponent {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  // API path
  private apiUrl = `${BACKEND_URL_PREFIX}/volunteers`;
  private createVolunterPath = `${this.apiUrl}/create`;

  volunteerForm: FormGroup;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  constructor() {
    this.volunteerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10,12}$')]],
      dateOfBirth: ['', Validators.required],
      address: ['', Validators.required],
      bloodGroup: [''], // Optional
      profession: [''], // Optional
      skills: ['']      // Optional
    });
  }

  onSubmit() {
    if (this.volunteerForm.invalid) {
      this.volunteerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    // The backend schema will automatically apply `approvalPending: true`
    this.http.post(this.createVolunterPath, this.volunteerForm.value).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.successMessage = 'Your application has been submitted successfully! An admin will review and approve your request shortly.';
        this.volunteerForm.reset();

        // Hide success message after 8 seconds
        setTimeout(() => {
          this.successMessage = '';
          this.router.navigate(['home']);
        }, 2500);
      },
      error: (err) => {
        console.error(err);
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Something went wrong. Please try again later.';
        this.cdr.markForCheck();
      }
    });
  }
}