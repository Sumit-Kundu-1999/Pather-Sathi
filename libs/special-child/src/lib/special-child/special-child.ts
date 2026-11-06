import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CareSlide, CarouselService, UploadCareSlide } from '@pather-sathi/carousel';
import { AuthService } from '@pather-sathi/auth';

@Component({
  selector: 'app-special-child',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './special-child.html',
  styleUrl: './special-child.css',
})
export class SpecialChild {
  private fb = inject(FormBuilder);
  private carouselService = inject(CarouselService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  slideForm = this.fb.group({
    description: ['', [Validators.required,]],
    diseaseName: ['', Validators.required],
    phoneNumber: ['', Validators.required]
  });
  successMessage = '';
  errorMessage = ''

  selectedFile: File | null = null;
  fileError: string = '';

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      // 2 MB in bytes = 2 * 1024 * 1024 = 2097152
      if (file.size > 2097152) {
        this.fileError = 'File size exceeds the 2MB limit. Please choose a smaller image.';
        this.selectedFile = null;
        event.target.value = ''; // Clear the input
      } else {
        this.fileError = '';
        this.selectedFile = file;
      }
    }
  }

  async onSubmit() {
    if (this.slideForm.valid && this.selectedFile) {
      // Use FormData because we are sending a physical file, not a JSON string
      const formData = new FormData();
      formData.append('image', this.selectedFile);
      formData.append('description', this.slideForm.get('description')?.value || '');
      formData.append('phoneNumber', this.slideForm.get('phoneNumber')?.value || '');
      formData.append('diseaseName', this.slideForm.get('diseaseName')?.value || '')

      this.carouselService.addSlide(formData).subscribe({
        next: (data) => {
          this.errorMessage = '';
          this.slideForm.reset();
          this.selectedFile = null;
          this.successMessage = data.message;
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.successMessage = '';
          console.log("Error on Special Child Form Submission ", err);
          this.authService.logoutDueToInvalidToken(err.error.message);
          this.errorMessage = err.error.message
          this.cdr.markForCheck();
        }
      });
    }
  }
}
