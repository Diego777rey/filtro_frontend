import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, CanLoad, Router, ActivatedRouteSnapshot, RouterStateSnapshot, Route, UrlSegment, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';
import { DevAuthService } from '../services/dev-auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild, CanLoad {
  constructor(
    private authService: AuthService, 
    private router: Router,
    private devAuthService: DevAuthService
  ) {}

  private checkLogin(url?: string): boolean | UrlTree {
    // En desarrollo, intentar restaurar sesión automáticamente
    if (!this.authService.isLoggedIn()) {
      console.log('Usuario no autenticado, intentando restaurar sesión de desarrollo...');
      
      // Intentar restaurar sesión de desarrollo
      const sessionRestored = this.devAuthService.ensureDevSession();
      
      if (sessionRestored && this.authService.isLoggedIn()) {
        console.log('Sesión de desarrollo restaurada exitosamente');
        return true;
      }
    } else {
      return true;
    }
    
    // Si no se pudo restaurar la sesión, redirigir al login
    console.log('No se pudo restaurar la sesión, redirigiendo al login');
    const returnUrl = url || this.router.url;
    return this.router.parseUrl('/login?returnUrl=' + encodeURIComponent(returnUrl));
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    return this.checkLogin(state.url);
  }

  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    return this.checkLogin(state.url);
  }

  canLoad(route: Route, segments: UrlSegment[]): boolean | UrlTree {
    const url = '/' + segments.map(s => s.path).join('/');
    return this.checkLogin(url);
  }
}
