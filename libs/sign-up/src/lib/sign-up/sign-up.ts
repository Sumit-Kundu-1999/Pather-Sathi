import { Storage } from '@pather-sathi/storage';
import { AuthService, AuthValidation } from '@pather-sathi/auth';
import { ChangeDetectorRef, Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'app-sign-up',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.css',
})
export class SignUp implements OnInit {
  @Input() isVisible = false;
  @Output() closeModal = new EventEmitter<boolean>();
  private cdr = inject(ChangeDetectorRef);

  myForm = new FormGroup({
    name: new FormControl(''),
    email: new FormControl(''),
    password: new FormControl(''),
    admin: new FormControl('')
  });
  statusMessage: { message: string, type: 'success' | 'error' } | null = null;
  submitBtnDisabled = true;

  validation = inject(AuthValidation);
  sessionStorage = inject(Storage);
  authService = inject(AuthService)
  router = inject(Router)

  get password() {
    return this.myForm.get('password');
  }

  get userName() {
    return this.myForm.get('name');
  }

  get email() {
    return this.myForm.get('email');
  }

  get adminPassword() {
    return this.myForm.get('admin');
  }

  // isSubmitButtonAbleToEnable() {
  //   if (this.email?.value !== '' && this.userName?.value !== '' && this.password?.value !== '' && this.adminPassword?.value !== '') {
  //     this.submitBtnDisabled = false;
  //   } else {
  //     this.submitBtnDisabled = true;
  //   }
  // }

  ngOnInit(): void {
    // this.email?.valueChanges.pipe(
    //   debounceTime(2000)
    // ).subscribe(() => {
    //   this.isSubmitButtonAbleToEnable();
    // });

    this.password?.valueChanges.pipe(
      debounceTime(2000)
    ).subscribe(() => {
      this.passWordCheck();
    })

    // this.adminPassword?.valueChanges.pipe(
    //   debounceTime(2000),
    // ).subscribe(() => this.isSubmitButtonAbleToEnable());
  }

  onClose() {
    this.closeModal.emit();
  }

  async onSubmit() {
    const user = this.userName?.value ?? '';
    const email = this.email?.value ?? '';
    const pass = this.password?.value ?? '';
    const admin = this.adminPassword?.value ?? '';
    if (user !== '' && pass !== '' && email !== '' && admin !== '') {
      this.createUsers();
    } else {
      this.statusMessage = {
        message: "Please Fill All the input",
        type: 'error'
      }
    }
  }

  onModalContentClick(event: Event): void {
    event.stopPropagation();
  }

  passWordCheck() {
    const value = this.password?.value ?? '';
    const passWordCheck = this.validation.passWordValidation(value);
    if (passWordCheck.isValid) {
      this.statusMessage = {
        message: passWordCheck.message,
        type: 'success'
      }
      this.submitBtnDisabled = false;
    } else {
      this.statusMessage = {
        message: passWordCheck.message,
        type: 'error'
      }
      this.submitBtnDisabled = true;
    }
  }

  private async createUsers() {
    this.statusMessage = null;

    this.authService.login({
      name: this.userName?.value,
      email: this.email?.value,
      password: this.password?.value,
      admin: this.adminPassword?.value
    }, 'register').subscribe({
      next: async (respose) => {
        console.log('User loggedin successfully', respose);
        this.statusMessage = {
          message: "User Created Successfully",
          type: 'success'
        };
        this.cdr.markForCheck();
        await this.router.navigate(['home']);
      },
      error: (err) => {
        this.statusMessage = {
          message: err.error.msg ?? 'Server Error',
          type: 'error'
        }
        this.cdr.markForCheck();
      },
    });
  }
}