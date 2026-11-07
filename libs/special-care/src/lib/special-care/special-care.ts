import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CarouselService, CareSlide } from '@pather-sathi/carousel'
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-special-care',
  imports: [CommonModule, RouterModule],
  templateUrl: './special-care.html',
  styleUrl: './special-care.css',
})
export class SpecialCare implements OnInit {
  private carouselService = inject(CarouselService);
  private route = inject(ActivatedRoute);
  private routeSub!: Subscription;

  currentLang = signal<'EN' | 'BN'>('EN');
  slideData = signal<CareSlide | null>(null);
  isLoading = signal<boolean>(true);

  ngOnInit() {
    this.routeSub = this.route.paramMap.subscribe((params) => {
      const specialChildId = params.get('id');
      if (specialChildId) {
        this.fetchSlideData(specialChildId);
      } else {
        this.isLoading.set(false);
        console.error("No ID found in route");
      }

    });
  }

  fetchSlideData(id: string) {
    this.isLoading.set(true);
    this.carouselService.getSlideById(id).subscribe({
      next: (data) => {
        this.slideData.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to fetch special care details', err);
        this.isLoading.set(false);
      }
    });
  }

  ngOnDestroy() {
    // Always clean up subscriptions to prevent memory leaks
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }
}
