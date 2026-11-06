import { ChangeDetectorRef, Component, inject, OnInit, output, OutputEmitterRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Storage } from '@pather-sathi/storage';
import { SignUp } from '@pather-sathi/sign-up';
import { AuthValidation, AuthService } from '@pather-sathi/auth';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, SignUp],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  readonly loginSuccess: OutputEmitterRef<boolean> = output<boolean>();
  private cdr = inject(ChangeDetectorRef);

  loginForm!: FormGroup;
  statusMessage: { message: string, type: 'success' | 'error' } | null = null;

  isLoading = false;
  isSuccess = false;
  isSignUpPopUpOpen = false;

  get userName() {
    return this.loginForm.get('username');
  }

  get password() {
    return this.loginForm.get('password');
  }

  router = inject(Router);
  validation = inject(AuthValidation);
  sessionStorageService = inject(Storage);
  authService = inject(AuthService)
  fb = inject(FormBuilder)

  constructor() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['home'])
    }
  }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  closeSingInPopUp() {
    this.isSignUpPopUpOpen = false;
  }

  onClickSignUp() {
    this.isSignUpPopUpOpen = true;
  }

  onLoginSubmit() {
    if (this.loginForm.invalid) {
      this.statusMessage = {
        message: "Please Fill All the input",
        type: 'error'
      }
      this.isSuccess = false;
      this.loginForm.markAllAsTouched(); // Show validation errors
      return;
    }

    this.isLoading = true;
    this.statusMessage = null;

    const { username, password } = this.loginForm.value;

    try {
      this.authService.login({
        email: username,
        password: password,
      }).subscribe({
        next: async () => {
          this.isSuccess = true;
          await this.router.navigate(['home']);
          this.loginSuccess.emit(this.authService.isLoggedIn());
        },
        error: (error) => {
          this.isSuccess = false;
          console.log('Error => ', error);
          this.statusMessage = { message: error.error.msg ?? 'Server Error', type: 'error' };
          this.cdr.markForCheck();
        },
      })
    } catch {
      this.isSuccess = false;
      this.statusMessage = {
        message: 'An unexpected network error occurred.',
        type: 'error'
      }
    } finally {
      this.isLoading = false;
    }
  }
}