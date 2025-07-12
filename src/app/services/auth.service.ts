import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../models/user-interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
 private apiUrl = 'https://api.chatpataexpress.com/auth'; // Replace with your actual API URL
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);

  public currentUser$ = this.currentUserSubject.asObservable();
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const token = this.getToken();
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const user: User = JSON.parse(userData);
        this.currentUserSubject.next(user);
        this.isLoggedInSubject.next(true);
      } catch (error) {
        console.error('Error parsing user data:', error);
        this.logout();
      }
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    // Mock API call - replace with actual HTTP request
    return this.mockLogin(credentials).pipe(
      tap(response => {
        this.setAuthData(response);
      }),
      catchError(error => {
        console.error('Login error:', error);
        throw error;
      })
    );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    // Mock API call - replace with actual HTTP request
    return this.mockRegister(userData).pipe(
      tap(response => {
        this.setAuthData(response);
      }),
      catchError(error => {
        console.error('Registration error:', error);
        throw error;
      })
    );
  }

  private setAuthData(authResponse: AuthResponse): void {
    localStorage.setItem('token', authResponse.token);
    localStorage.setItem('user', JSON.stringify(authResponse.user));
    
    if (authResponse.refreshToken) {
      localStorage.setItem('refreshToken', authResponse.refreshToken);
    }

    this.currentUserSubject.next(authResponse.user);
    this.isLoggedInSubject.next(true);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('refreshToken');
    
    this.currentUserSubject.next(null);
    this.isLoggedInSubject.next(false);
    
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.isLoggedInSubject.value && !!this.getToken();
  }

  updateUserProfile(userData: Partial<User>): Observable<User> {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      throw new Error('No user logged in');
    }

    // Mock API call - replace with actual HTTP request
    return this.mockUpdateProfile(currentUser.id, userData).pipe(
      tap(updatedUser => {
        localStorage.setItem('user', JSON.stringify(updatedUser));
        this.currentUserSubject.next(updatedUser);
      })
    );
  }

  // Mock API methods - replace with actual HTTP calls
  private mockLogin(credentials: LoginRequest): Observable<AuthResponse> {
    return new Observable(observer => {
      setTimeout(() => {
        if (credentials.email === 'admin@chatpata.com' && credentials.password === 'admin123') {
          const response: AuthResponse = {
            user: {
              id: '1',
              name: 'Admin User',
              email: credentials.email,
              phone: '+91 98765 43210',
              address: 'Mumbai, Maharashtra'
            },
            token: 'mock-jwt-token-' + Date.now(),
            refreshToken: 'mock-refresh-token-' + Date.now()
          };
          observer.next(response);
          observer.complete();
        } else {
          observer.error({ message: 'Invalid credentials' });
        }
      }, 1000);
    });
  }

  private mockRegister(userData: RegisterRequest): Observable<AuthResponse> {
    return new Observable(observer => {
      setTimeout(() => {
        const response: AuthResponse = {
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
        observer.next(response);
        observer.complete();
      }, 1000);
    });
  }

  private mockUpdateProfile(userId: string, userData: Partial<User>): Observable<User> {
    return new Observable(observer => {
      setTimeout(() => {
        const currentUser = this.getCurrentUser();
        if (currentUser) {
          const updatedUser: User = { ...currentUser, ...userData };
          observer.next(updatedUser);
          observer.complete();
        } else {
          observer.error({ message: 'User not found' });
        }
      }, 500);
    });
  }
}
