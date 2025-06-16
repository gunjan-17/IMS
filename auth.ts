import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface User {
  id: number;
  username: string;
  name: string;
  role: 'EMPLOYEE' | 'ADMIN';
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';

  private isLoggedInUser: User | null = null;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  private authToken: string | null = null;

  constructor(private http: HttpClient) {}

  // POST /api/auth/login
  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { username, password })
      .pipe(
        tap((response: LoginResponse) => {
          if (response.success && response.token && response.user) {
            this.authToken = response.token;
            this.setCurrentUser(response.user);
          }
        })
      );
  }

  // GET /api/auth/me
  getCurrentUserFromServer(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`)
      .pipe(
        tap((user: User) => {
          this.setCurrentUser(user);
        })
      );
  }

  isLoggedIn(): boolean {
    return !!this.authToken && !!this.isLoggedInUser;
  }

  setCurrentUser(user: User | null): void {
    this.isLoggedInUser = user;
    this.currentUserSubject.next(user);
  }

  getCurrentUser(): User | null {
    return this.isLoggedInUser;
  }

  getToken(): string | null {
    return this.authToken;
  }

  isAdmin(): boolean {
    return this.getCurrentUser()?.role === 'ADMIN';
  }

  logout(): void {
    this.authToken = null;
    this.isLoggedInUser = null;
    this.setCurrentUser(null);
  }
}