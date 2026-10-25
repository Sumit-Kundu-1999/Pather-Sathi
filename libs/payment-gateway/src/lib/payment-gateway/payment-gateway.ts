import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface DonationTier {
  amount: number;
  label: string;
  impact: string;
  icon: string;
  popular?: boolean;
}

@Component({
  selector: 'app-payment-gateway',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './payment-gateway.html',
  styleUrl: './payment-gateway.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentGateway {
  readonly ngoUpiId = 'nikhilkundu1581977-1@oksbi';
  readonly ngoMerchantName = 'Pather Sathi';

  readonly currentStep = signal<1 | 2 | 3>(1);
  readonly selectedAmount = signal<number>(500);
  readonly copied = signal<boolean>(false);
  readonly isVerifying = signal<boolean>(false);
  readonly receiptId = signal<string>(Math.floor(100000 + Math.random() * 900000).toString());

  utrNumber = '';
  todayDate = new Date().toLocaleDateString('en-IN', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  donationTiers: DonationTier[] = [
    { amount: 250, label: 'Child Dress', impact: 'Provides a fresh set of clothes for a child', icon: '👚' },
    { amount: 500, label: 'Child Dress & Kit', impact: 'Dress, grooming & essential kits for a child', icon: '🎒', popular: true },
    { amount: 1000, label: 'Help 2 Children', impact: 'Complete dress & essential kits for 2 children', icon: '✨' },
    { amount: 2500, label: 'Support 5 Children', impact: 'Full clothing, makeup & care kits for 5 children', icon: '🎁' },
  ];

  donorForm = new FormGroup({
    name: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)]
    }),
    phone: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]
    }),
    email: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.email]
    }),
    // requiresTaxReceipt: new FormControl<boolean>(true, { nonNullable: true }),
    // pan: new FormControl<string>('', {
    //   nonNullable: true,
    //   validators: [Validators.required, Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i)]
    // }),
    city: new FormControl<string>('', { nonNullable: true }),
    pincode: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.pattern(/^\d{6}$/)]
    })
  });

  private copyTimeout: any;

  //  constructor() {
    // Toggle PAN validation dynamically based on the 80G tax receipt checkbox
    // this.donorForm.controls.requiresTaxReceipt.valueChanges.subscribe((requires) => {
    //   const panControl = this.donorForm.controls.pan;
    //   if (requires) {
    //     panControl.setValidators([Validators.required, Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i)]);
    //   } else {
    //     panControl.clearValidators();
    //   }
    //   panControl.updateValueAndValidity();
    // });
  // }

  readonly dynamicImpactMessage = computed(() => {
    const amt = this.selectedAmount();
    if (amt <= 250) return `Provides a new dress & basic grooming kit for a child in need`;
    if (amt <= 500) return `Sponsors a complete clothing set, makeup/care items & essentials for a child`;
    if (amt <= 1500) return `Supplies fresh dresses, footwear, and grooming kits for 2 to 3 children`;
    if (amt <= 3000) return `Sponsors full festive dresses, makeup, hygiene, and care kits for 5 children`;
    return `Sponsors comprehensive clothing, grooming kits, and essential care for underprivileged children in our care drive`;
  });

  readonly upiPayUrl = computed(() => {
    const amt = this.selectedAmount();
    const donorName = encodeURIComponent(this.donorForm?.get('name')?.value || 'Supporter');
    const note = encodeURIComponent(`Donation from ${donorName}`);
    return `upi://pay?pa=${this.ngoUpiId}&pn=${encodeURIComponent(this.ngoMerchantName)}&am=${amt}&cu=INR&tn=${note}`;
  });

  readonly qrCodeImageUrl = computed(() => {
    const upiPayload = encodeURIComponent(this.upiPayUrl());
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${upiPayload}&margin=8`;
  });

  upiIntentUrl(targetApp: 'gpay' | 'phonepe' | 'paytm' | 'generic'): string {
    const baseUpi = this.upiPayUrl();
    switch (targetApp) {
      case 'gpay':
        return baseUpi.replace('upi://', 'gpay://upi/');
      case 'phonepe':
        return baseUpi.replace('upi://', 'phonepe://');
      case 'paytm':
        return baseUpi.replace('upi://', 'paytmmp://');
      default:
        return baseUpi;
    }
  }

  selectPresetAmount(amt: number): void {
    this.selectedAmount.set(amt);
  }

  onCustomAmountChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const val = Number(input.value);
    if (!isNaN(val) && val >= 0) {
      this.selectedAmount.set(val);
    }
  }

  goToPaymentStep(): void {
    if (this.donorForm.valid && this.selectedAmount() >= 10) {
      this.currentStep.set(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      this.donorForm.markAllAsTouched();
    }
  }

  copyUpiId(): void {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(this.ngoUpiId).then(() => {
        this.copied.set(true);
        clearTimeout(this.copyTimeout);
        this.copyTimeout = setTimeout(() => this.copied.set(false), 2500);
      });
    }
  }

  confirmDonation(): void {
    this.isVerifying.set(true);
    // Simulating instant UTR verification / ledger entry
    setTimeout(() => {
      this.isVerifying.set(false);
      this.receiptId.set(Math.floor(100000 + Math.random() * 900000).toString());
      this.currentStep.set(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1200);
  }

  printReceipt(): void {
    window.print();
  }

  resetFlow(): void {
    this.donorForm.reset({
      // requiresTaxReceipt: true,
      name: '',
      phone: '',
      email: '',
      // pan: '',
      city: '',
      pincode: ''
    });
    this.utrNumber = '';
    this.selectedAmount.set(500);
    this.currentStep.set(1);
  }

  ngOnDestroy(): void {
    if (this.copyTimeout) {
      clearTimeout(this.copyTimeout);
    }
  }
}
