import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NGO_INFO } from '@pather-sathi/config'

@Component({
  selector: 'app-footer',
  imports: [CommonModule, RouterModule],
  templateUrl: './footer-component.html',
  styleUrl: './footer-component.css',
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
  ngoName = NGO_INFO.NAME
  description = 'Dedicated to bringing the joy of Durga Puja to every child through new dresses, essential kits, and lasting community support.'
  email = NGO_INFO.EMAIL
  address = NGO_INFO.ADDRESS
  contactNo = NGO_INFO.CONTACT_NO
}
