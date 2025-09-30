import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../guards/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Verificar si es una operación de login (no debe enviar token)
    const isLoginOperation = req.url.includes('graphql') && 
      (req.body?.query?.includes('LoginUsuario') || 
       req.body?.query?.includes('login'));
    
    // Para operaciones de login, NO enviar token
    if (isLoginOperation) {
      return next.handle(req);
    }
    
    // Obtener el token del AuthService para operaciones protegidas
    const token = this.authService.getToken();
    
    if (token && !this.authService.isTokenExpired()) {
      // Clonar la request y agregar el header de autorización
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return next.handle(authReq);
    }
    
    // Si no hay token válido, enviar la request sin modificar
    return next.handle(req);
  }
}
