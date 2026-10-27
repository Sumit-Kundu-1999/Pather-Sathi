import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { selectAuthToken, authActions } from '@pather-sathi/auth-store'
import { firstValueFrom, map, take } from 'rxjs';
import { AuthService } from '@pather-sathi/auth';
import { BACKEND_URL_PREFIX } from '@pather-sathi/config';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './upload.html',
  styleUrls: ['./upload.css']
})
export class UploadComponent {
  private http = inject(HttpClient);
  private store = inject(Store);
  private authService = inject(AuthService)

  selectedFiles: File[] = [];
  eventName = '';
  altText = '';

  errorMessage = '';
  successMessage = '';
  isUploading = signal(false);

  onFileSelected(event: Event) {
    this.errorMessage = '';
    this.successMessage = '';
    const input = event.target as HTMLInputElement;

    if (!input.files?.length) return;

    const files = Array.from(input.files);
    // Validate file size (Max 2MB)
    const maxSize = 2 * 1024 * 1024;

    const allValid = files.every((file) => {
      if (!file.type.startsWith('image/')) {
        this.errorMessage = 'All files must be images.';
        return false;
      }
      if (file.size > maxSize) {
        this.errorMessage = `The file ${file.name} is too large. Maximum size is 2 MB.`;
        return false;
      }
      return true;
    })

    if (!allValid) {
      this.selectedFiles = [];
      input.value = '';
      return;
    }

    this.selectedFiles = files;
  }

  async onUpload() {
    if (this.selectedFiles.length === 0 || !this.eventName) {
      this.errorMessage = 'Please provide both an image and an event name.';
      return;
    }

    this.isUploading.set(true);
    // this.isUploading = true;
    const formData = new FormData();

    formData.append('eventName', this.eventName);
    formData.append('altText', this.altText || `${this.eventName} photo`);

    this.selectedFiles.forEach(file => {
      formData.append('images', file);
    });

    const token = await firstValueFrom(this.store.select(selectAuthToken));

    // Replace with your actual backend upload endpoint
    this.http.post(
      `${BACKEND_URL_PREFIX}/image/upload`,
      formData,
      {
        headers:{
          'authorization': `Bearer ${token}`
        }
      }
    ).subscribe({
      next: () => {
        this.successMessage = 'Image uploaded successfully!';
        this.isUploading.set(false);
        // this.isUploading = false;
        this.resetForm();
      },
      error: (err) => {
        this.authService.logoutDueToInvalidToken(err.error.mesage);
        this.errorMessage = 'Failed to upload image. Please try again.';
        this.isUploading.set(false);
        // this.isUploading = false;
      }
    });
  }

  resetForm() {
    this.selectedFiles = [];
    this.eventName = '';
    this.altText = '';
    // Reset the actual file input in the DOM
    const fileInput = document.getElementById('fileUpload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }
}