import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  showHeader = true;
  
  constructor(private router: Router) {}

  ngOnInit(): void {
    // Listen to route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // Hide header on auth pages
      this.showHeader = !this.isAuthPage(event.urlAfterRedirects);
    });

    // Check initial route
    this.showHeader = !this.isAuthPage(this.router.url);
  }

  private isAuthPage(url: string): boolean {
    return url.includes('/login') || url.includes('/register');
  }

  public openCart(){
    this.router.navigateByUrl('/cart')
  }
}