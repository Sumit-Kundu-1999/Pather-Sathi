import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BACKEND_URL_PREFIX } from '@pather-sathi/config';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact-us.html',
  styleUrls: ['./contact-us.css']
})
export class ContactComponent {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  
  contactForm: FormGroup;
  isSubmitting = false;
  successMessage = '';

  constructor() {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', Validators.required],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  onSubmit() {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const payload = this.contactForm.value;

    this.http.post(`${BACKEND_URL_PREFIX}/api/contact`, payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.successMessage = 'Thank you for reaching out! We will get back to you soon.';
        this.contactForm.reset();
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.successMessage = err.error.message ?? 'Please check all the fields'
        this.cdr.markForCheck();
      }
    })
  }
}