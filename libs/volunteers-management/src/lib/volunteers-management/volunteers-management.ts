import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BACKEND_URL_PREFIX } from '@pather-sathi/config';
import { AuthService } from '@pather-sathi/auth';

export interface Volunteer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  approvalPending: boolean;
  dateOfBirth: Date,
  address: string,
  bloodGroup: string,
  profession: string,
  skills: string,
  createdAt: string,
  updatedAt: string,
  _v: number;
}

export interface VolunteerApiResponse {
  volunteers: Volunteer[];
}

@Component({
  selector: 'app-volunteer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './volunteers-management.html',
  styleUrls: ['./volunteers-management.css']
})
export class VolunteerComponent implements OnInit {
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  private authService = inject(AuthService)
  
  // API path
  private volunteersUrl = `${BACKEND_URL_PREFIX}/volunteers`;
  private getVolunteerPath = `${this.volunteersUrl}/info`;

  pendingVolunteers: Volunteer[] = [];
  approvedVolunteers: Volunteer[] = [];
  isLoading = true;

  get token() {
    return this.authService.getToken();
  }

  ngOnInit() {
    this.loadVolunteers();
  }

  async loadVolunteers() {
    this.isLoading = true;
    this.http.get<VolunteerApiResponse>(
      this.getVolunteerPath, 
      {
        headers:{
          'authorization': `Bearer ${this.token}`
        }
      }
    ).subscribe({
      next: (data) => {
        // Split data based on the approvalPending flag
        this.pendingVolunteers = data.volunteers.filter(v => v.approvalPending);
        this.approvedVolunteers = data.volunteers.filter(v => !v.approvalPending);
        console.log(this.approvedVolunteers);
        console.log(this.pendingVolunteers);
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error fetching volunteers', err);
        this.authService.logoutDueToInvalidToken(err.error.message);
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  approveVolunteer(id: string) {
    // Call API to set approvalPending: false
    this.http.put(`${this.volunteersUrl}/${id}/approve`, {}).subscribe({
      next: () => {
        // Refresh the lists
        this.loadVolunteers();
      },
      error: (err) => console.error('Error approving volunteer', err)
    });
  }

  removeVolunteer(id: string) {
    if (confirm('Are you sure you want to remove this volunteer? This action cannot be undone.')) {
      // Call API to delete from database
      this.http.delete(`${this.volunteersUrl}/${id}`,
        {
        headers:{
          'authorization': `Bearer ${this.token}`
        }
      }
      ).subscribe({
        next: () => {
          // Refresh the lists
          this.loadVolunteers();
        },
        error: (err) => console.error('Error deleting volunteer', err)
      });
    }
  }

  // Inside your VolunteerComponent class
  calculateAge(dobInput: string | Date): number {
    if (!dobInput) return 0;

    const today = new Date();
    // new Date() safely handles both ISO strings and existing Date objects
    const birthDate = new Date(dobInput);

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
}