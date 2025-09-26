import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, CanLoad, Router, ActivatedRouteSnapshot, RouterStateSnapshot, Route, UrlSegment, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild, CanLoad {
  constructor(private authService: AuthService, private router: Router) {}

  private checkLogin(url?: string): boolean | UrlTree {
    if (this.authService.isLoggedIn()) {
      return true;
    }
    // Redirige al login y guarda la URL original
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
