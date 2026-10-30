import { ChangeDetectorRef, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Volunteer, VolunteerApiResponse } from '@pather-sathi/volunteers-management'
import { AuthService } from '@pather-sathi/auth';
import { BACKEND_URL_PREFIX } from '@pather-sathi/config';
import { DonorRecord } from '@pather-sathi/donor-records';

interface ChatMessage {
  sender: 'user' | 'agent';
  text: string;
  timestamp: Date;
}

type HealthLabel = 'Online' | 'Offline' | 'Checking...';

interface ResponseData {
  type: string,
  text: string,
  extras: {
    signature: string
  }
}

interface AiResponse {
  reply: ResponseData[]
}

interface HealthStatus {
  status: string,
  message?: string,
  agent?: {
    status: string,
    service: string,
    stateCode?: number
  }
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  private authService = inject(AuthService);

  private getVolunteerPath = `${BACKEND_URL_PREFIX}/volunteers/info`;
  private donarRecordPath = `${BACKEND_URL_PREFIX}/donors/records`;
  private healthDbPath = `${BACKEND_URL_PREFIX}//health/db`;
  private healthAgentPath = `${BACKEND_URL_PREFIX}/health/agent`;
  private healthResendPath = `${BACKEND_URL_PREFIX}/health/resend`
  private aiQueryPath = `${BACKEND_URL_PREFIX}/ai/ai-query`

  // Dashboard Metrics (Can be fetched via API later)
  metrics = {
    totalDonations: 1250000,
    activeVolunteers: 42,
    pendingApprovals: 5,
    activeCampaigns: 2
  };

  isDbHealthy = false;
  dbStatusText = signal<HealthLabel>('Checking...');

  isAiAgentHealthy = false;
  aiAgentStatusText = signal<HealthLabel>('Checking...');

  isResendHealthy = false;
  resendStatusText = signal<HealthLabel>('Checking...');

  // AI Chat State
  chatMessages: ChatMessage[] = [];
  userInput: string = '';
  isAgentTyping: boolean = false;

  isVolunteersLoading = true;
  pendingVolunteers: Volunteer[] = [];
  approvedVolunteers: Volunteer[] = [];

  isDonarAmmountLoading = true;
  totalDonatedAmmount = 0;

  get token() {
    return this.authService.getToken();
  }

  async ngOnInit() {
    // Welcome message from the agent
    this.chatMessages.push({
      sender: 'agent',
      text: 'Hello Admin. I am your Pather Sathi AI Assistant. Currently, I can help you analyze donor records. Who or what would you like to search for?',
      timestamp: new Date()
    });
    this.http.get<HealthStatus>(this.healthDbPath).subscribe({
      next: (data) => {
        if (data.status === 'healthy') {
          this.dbStatusText.set('Online')
        } else {
          this.dbStatusText.set('Offline');
        }
      },
      error: () => {
        this.isDbHealthy = false;
        this.dbStatusText.set('Offline');
      }
    });
    this.http.get<HealthStatus>(this.healthAgentPath).subscribe({
      next: (data) => {
        if (data.status === 'healthy') {
          this.aiAgentStatusText.set('Online')
        } else {
          this.aiAgentStatusText.set('Offline');
        }
      },
      error: () => {
        this.isAiAgentHealthy = false;
        this.aiAgentStatusText.set('Offline');
      }
    });

    this.http.get<HealthStatus>(this.healthResendPath).subscribe({
      next: (data) => {
        if (data.status === 'healthy') {
          this.resendStatusText.set('Online')
        } else {
          this.resendStatusText.set('Offline');
        }
      },
      error: () => {
        this.isResendHealthy = false;
        this.resendStatusText.set('Offline');
      }
    });
    await this.loadVolunteers();
    await this.loadDonors();
  }

  sendMessage() {
    if (!this.userInput.trim()) return;

    const userText = this.userInput.trim();
    this.chatMessages.push({ sender: 'user', text: userText, timestamp: new Date() });
    this.userInput = '';
    this.isAgentTyping = true;

    // Auto-scroll logic can be implemented here

    this.http.post<AiResponse>(this.aiQueryPath, { message: userText })
      .subscribe({
        next: (response) => {
          this.isAgentTyping = false;
          this.chatMessages.push({ sender: 'agent', text: response.reply[0].text, timestamp: new Date() });
          this.cdr.markForCheck();
        },
        error: () => {
          this.isAgentTyping = false;
          this.chatMessages.push({
            sender: 'agent',
            text: 'Connection error. The AI agent is currently offline.',
            timestamp: new Date()
          });
          this.cdr.markForCheck();
        }
      });
  }

  async loadVolunteers() {
    this.isVolunteersLoading = true;
    this.http.get<VolunteerApiResponse>(
      this.getVolunteerPath,
      {
        headers: {
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
        this.isVolunteersLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error fetching volunteers', err);
        this.authService.logoutDueToInvalidToken(err.error.message);
        this.isVolunteersLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  async loadDonors() {
    this.isDonarAmmountLoading = true;
    this.http.get<DonorRecord>(
      this.donarRecordPath,
      {
        headers:{
          'Cache-Control': 'no-cache'
        }
      }
    ).subscribe({
      next: (data) => {
        this.totalDonatedAmmount = data.donors.reduce((sum, donar) => sum + donar.amount, 0);
        this.isDonarAmmountLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error fetching donors', err);
        this.isDonarAmmountLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

}