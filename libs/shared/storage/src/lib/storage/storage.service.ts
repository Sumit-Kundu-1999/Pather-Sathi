import { Injectable } from '@angular/core';

export interface userInfo {
  userName: string;
  password: string;
  _id: string;
  __v: number;
}

@Injectable({
  providedIn: "root"
})
export class Storage {
  getSession(key = 'userInfo') {
    const value = JSON.parse(sessionStorage.getItem(key) as string);
    return value;
  }

  setSession(userInfo:userInfo[], key = 'userInfo') {
    if(userInfo) {
      sessionStorage.setItem(key, JSON.stringify(userInfo));
    }
  }

  clearSession(key = 'userInfo') {
    sessionStorage.removeItem(key);
  }
}