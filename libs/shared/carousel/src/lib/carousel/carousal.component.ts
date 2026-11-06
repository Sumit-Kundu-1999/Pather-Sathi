import { Component, inject, OnInit } from '@angular/core';
import { CarouselService } from './service/carousel';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-home-carousel',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './carousal.component.html',
  styleUrl: './carousal.component.css'
})

export class HomeCarouselComponent implements OnInit {
  carouselService = inject(CarouselService);
  private router = inject(Router);

  ngOnInit() {
    this.carouselService.fetchSlides();
  }

  goToDetail(slideId: string | undefined) {
    if (!slideId) {
      console.error("The _id is undefined! needs to check MongoDB data.");
      return;
    };
    
    console.log("Attempting to navigate to ID:", slideId);
    this.router.navigate(['/special-care', slideId]).then(success => {
      if (success) {
        console.log("Navigation successful!");
      } else {
        console.error("Navigation failed! Check app.routes.ts config.");
      }
    }).catch((err) => {
      console.error("ROUTING ERROR:", err);
    });
  }
}