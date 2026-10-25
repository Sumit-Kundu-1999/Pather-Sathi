import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { GalleryImage } from '@pather-sathi/config'

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gallery.html',
  styleUrls: ['./gallery.css']
})
export class GalleryComponent implements OnInit {
  private http = inject(HttpClient);
  
  images: GalleryImage[] = [];
  isLoading = signal(true);
  errorMessage = '';

  // Replace with your actual backend API endpoint
  private apiUrl = 'http://localhost:3000/image/getPhotos';

  ngOnInit(): void {
    this.fetchImages();
  }

  fetchImages(): void {
    this.isLoading.set(true);
    this.http.get<GalleryImage[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.images = data;
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error fetching gallery images:', error);
        this.errorMessage = 'Failed to load images. Please try again later.';
        this.isLoading.set(false);
      }
    });
  }
}