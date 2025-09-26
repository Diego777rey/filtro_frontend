import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../guards/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Obtener el token del AuthService
    const token = this.authService.getToken();
    
    if (token) {
      // Clonar la request y agregar el header de autorización
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Token JWT agregado a la petición HTTP
      return next.handle(authReq);
    }
    
    // Si no hay token, enviar la request sin modificar
    return next.handle(req);
  }
}
