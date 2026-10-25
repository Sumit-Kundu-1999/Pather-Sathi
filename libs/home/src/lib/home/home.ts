import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NGO_INFO } from '@pather-sathi/config';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private router = inject(Router)
  // Data for the impact section to keep the template clean
  impactStats = [
    { number: '5,000+', label: 'Smiles Delivered' },
    { number: '1,200+', label: 'Dresses Gifted' },
    { number: '20+', label: 'Social Initiatives' }
  ];

  desciption = NGO_INFO.DESCRIPTION;

  // Data for team fundamentals/pillars
  fundamentals = [
    {
      icon: '🤍',
      title: 'Compassion First',
      description: 'Every child deserves to feel the joy and warmth of the festive season, regardless of their background.'
    },
    {
      icon: '🤝',
      title: '100% Transparency',
      description: 'From public donations to the physical dresses and makeup kits, we track and share every step of the journey.'
    },
    {
      icon: '🌱',
      title: 'Sustainable Support',
      description: 'Beyond Durga Puja, we conduct year-round social programs focusing on health, education, and holistic growth.'
    }
  ];

  onDonateClick() {
    this.router.navigate(['donate'])
  }

  onVolunteerClick() {
    // Logic to route to volunteer registration
    console.log('Navigate to volunteer module');
  }


}
