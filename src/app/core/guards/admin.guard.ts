import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.authService.isAdmin()) {
      return true;
    } else {
      // Mostrar mensaje de acceso denegado y redirigir
      alert('Acceso denegado. Solo los administradores pueden acceder a esta sección.');
      this.router.navigate(['/dashboard/bienvenido']);
      return false;
    }
  }
}
