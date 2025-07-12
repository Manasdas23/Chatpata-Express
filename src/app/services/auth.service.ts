import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { 
  User, 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest 
} from '../models/user-interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'https://api.chatpataexpress.com/auth'; // Replace with your API URL
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user_data';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Check if user is already logged in on service initialization
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const token = this.getToken();
    const userData = this.getUserData();
    
    if (token && userData) {
      this.currentUserSubject.next(userData);
    }
  }

  // Login method
  login(credentials: LoginRequest): Observable<AuthResponse> {
    // For demo purposes, simulate login with demo credentials
    if (credentials.email === 'admin@chatpata.com' && credentials.password === 'admin123') {
      const mockResponse: AuthResponse = {
        user: {
          id: '1',
          name: 'Admin User',
          email: 'admin@chatpata.com',
          phone: '+1234567890',
          address: '123 Main St'
        },
        token: 'mock-jwt-token-' + Date.now(),
        refreshToken: 'mock-refresh-token-' + Date.now()
      };

      // Store auth data
      this.setToken(mockResponse.token);
      this.setUserData(mockResponse.user);
      this.currentUserSubject.next(mockResponse.user);

      return new Observable(observer => {
        setTimeout(() => {
          observer.next(mockResponse);
          observer.complete();
        }, 1000); // Simulate network delay
      });
    }

    // For real implementation, use this:
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials)
      .pipe(
        tap(response => {
          this.setToken(response.token);
          this.setUserData(response.user);
          this.currentUserSubject.next(response.user);
        }),
        catchError(this.handleError)
      );
  }

  // Register method
  register(userData: RegisterRequest): Observable<AuthResponse> {
    // For demo purposes, simulate registration
    const mockResponse: AuthResponse = {
      user: {
        id: Date.now().toString(),
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        address: ''
      },
      token: 'mock-jwt-token-' + Date.now(),
      refreshToken: 'mock-refresh-token-' + Date.now()
    };

    // Store auth data
    this.setToken(mockResponse.token);
    this.setUserData(mockResponse.user);
    this.currentUserSubject.next(mockResponse.user);

    return new Observable(observer => {
      setTimeout(() => {
        observer.next(mockResponse);
        observer.complete();
      }, 1000); // Simulate network delay
    });

    // For real implementation, use this:
    // return this.http.post<AuthResponse>(`${this.API_URL}/register`, userData)
    //   .pipe(
    //     tap(response => {
    //       this.setToken(response.token);
    //       this.setUserData(response.user);
    //       this.currentUserSubject.next(response.user);
    //     }),
    //     catchError(this.handleError)
    //   );
  }

  // Logout method
  logout(): void {
    // Clear local storage
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    
    // Clear current user
    this.currentUserSubject.next(null);
    
    // Redirect to login
    this.router.navigate(['/login']);
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Get token
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Get user data
  getUserData(): User | null {
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  // Private helper methods
  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  private setUserData(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  private isTokenExpired(token: string): boolean {
    try {
      // For demo purposes, assume token never expires
      // In real implementation, decode JWT and check expiration
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp;
      return Math.floor(new Date().getTime() / 1000) >= expiry;
    } catch (error) {
      return false; // For demo tokens, assume they don't expire
    }
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      switch (error.status) {
        case 401:
          errorMessage = 'Invalid credentials';
          break;
        case 403:
          errorMessage = 'Access denied';
          break;
        case 404:
          errorMessage = 'Service not found';
          break;
        case 500:
          errorMessage = 'Internal server error';
          break;
        default:
          errorMessage = error.error?.message || 'Something went wrong';
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }

  // Refresh token method (for future use)
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = localStorage.getItem('refresh_token');
    return this.http.post<AuthResponse>(`${this.API_URL}/refresh`, { refreshToken })
      .pipe(
        tap(response => {
          this.setToken(response.token);
          this.setUserData(response.user);
          this.currentUserSubject.next(response.user);
        }),
        catchError(this.handleError)
      );
  }
}