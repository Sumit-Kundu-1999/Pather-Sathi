import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BACKEND_URL_PREFIX } from '@pather-sathi/config'
import { AuthService } from '@pather-sathi/auth';

export interface CareSlide {
  _id?: string;
  altText: string;
  contentType: string;
  diseaseName: string;
  description: string;
  fileName: string;
  path: string,
  phoneNumber: string;
}

export interface UploadCareSlide {
  description: string;
  phoneNumber: string;
  image: File;
}

@Injectable({
  providedIn: 'root'
})

export class CarouselService {
  private http = inject(HttpClient);
  private uploadSpecialChildPath = `${BACKEND_URL_PREFIX}/special-child/upload`;
  private fetchSpecialChildPath = `${BACKEND_URL_PREFIX}/special-child/get`;
  private fetchSpecificSpecialChildPath = `${BACKEND_URL_PREFIX}/special-child/fetch`
  private authService = inject(AuthService);

  slides = signal<CareSlide[]>([]);
  get token() {
    return this.authService.getToken();
  }


  fetchSlides() {
    this.http.get<CareSlide[]>(this.fetchSpecialChildPath).subscribe(data => {
      this.slides.set(data);
    });
  }



  addSlide(slide: FormData) {
    return this.http.post<{ message: string }>(
      this.uploadSpecialChildPath,
      slide,
      {
        headers: {
          'authorization': `Bearer ${this.token}`
        }
      }
    );
  }

  getSlideById(id: string) {
    return this.http.get<CareSlide>(`${this.fetchSpecificSpecialChildPath}/${id}`);
  }
}
