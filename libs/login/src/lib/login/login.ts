import { Component, inject, OnInit, output, OutputEmitterRef } from '@angular/core';
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
  loginForm!: FormGroup;

  isLoading = false;
  isSuccess = false;
  isSignUpPopUpOpen = false;
  statusMessage = '';
  
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
    if(this.authService.isLoggedIn()) {
      this.router.navigate(['home'])
    }
  }

  ngOnInit(): void {
      this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  async onClick() {
    const user = this.userName?.value ?? '';
    const pass = this.password?.value ?? '';
    if (user !== '' && pass !== '') {
      this.setMessages({});
      this.authService.login({
        email: user, 
        password: pass,
      }).subscribe({
        next: async () => {
          await this.router.navigate(['home']);
          this.loginSuccess.emit(this.authService.isLoggedIn());
        },
        error: (error) =>  {
          this.setMessages({ erroMsg: error.error.msg ?? 'Server Error' });
        },
      })

    } else {
      this.setMessages({ erroMsg: 'Please fill User name & Password' });
    }
  }

  closeSingInPopUp() {
    this.isSignUpPopUpOpen = false;
  }

  onClickSignUp() {
    this.isSignUpPopUpOpen = true;
  }

  private setMessages({
    erroMsg,
    successMsg,
  }: {
    erroMsg?: string;
    successMsg?: string;
  }) {
    if (erroMsg) {
      this.statusMessage = erroMsg;
    } else if (successMsg) {
      this.statusMessage = successMsg;
    } else if (!erroMsg && !successMsg) {
      this.statusMessage = '';
    }
  }

  onLoginSubmit() {
    if (this.loginForm.invalid) {
      this.setMessages({
        erroMsg: 'Please fill out all required fields.'
      })
      this.isSuccess = false;
      this.loginForm.markAllAsTouched(); // Show validation errors
      return;
    }

    this.isLoading = true;
    this.statusMessage = '';

    const { username, password } = this.loginForm.value;

    try{
      this.authService.login({
        email: username, 
        password: password,
      }).subscribe({
        next: async () => {
          this.isSuccess = true;
          await this.router.navigate(['home']);
          this.loginSuccess.emit(this.authService.isLoggedIn());
        },
        error: (error) =>  {
          this.isSuccess = false;
          this.setMessages({ erroMsg: error.error.msg ?? 'Server Error' });
        },
      })
    } catch {
      this.isSuccess = false;
      this.setMessages({
        erroMsg: 'An unexpected network error occurred.'
      })
    } finally {
      this.isLoading = false;
    }
  }
}