import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthValidation {
  passWordValidation(password: string) {
    const passwordRegex = /^(?=.*?[0-9])(?=.*?[A-Za-z]).{8,32}$/;
    if(passwordRegex.test(password)) {
      return {
        isValid: true,
        message: 'Password is valid',
      };
    }
    return {
      isValid: false,
      message: 'Password Not Valid!!!'
    };
  }
}