import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  sidebarCollapsed = false; // Control global del estado del sidebar
  showSidebar = true;

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // Rutas donde NO quieres mostrar la barra
        const noSidebarRoutes = ['/login', '/'];
        this.showSidebar = !noSidebarRoutes.includes(event.url);
      }
    });
  }

  onSidebarToggled() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }
}