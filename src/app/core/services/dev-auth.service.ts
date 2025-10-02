import { Injectable } from '@angular/core';
import { AuthService } from '../guards/auth.service';

/**
 * Servicio para autenticación automática en desarrollo
 * Solo debe usarse en entorno de desarrollo
 */
@Injectable({
  providedIn: 'root'
})
export class DevAuthService {

  constructor(private authService: AuthService) {}

  /**
   * Inicializa una sesión de desarrollo automáticamente
   * Solo para desarrollo - NO usar en producción
   */
  initializeDevSession(): void {
    // Verificar si ya hay una sesión válida
    if (this.authService.isLoggedIn()) {
      console.log('Usuario ya autenticado');
      return;
    }

    // Datos de usuario de desarrollo
    const devUser = {
      id: 1,
      persona: {
        id: 1,
        nombre: 'Usuario',
        apellido: 'Desarrollo',
        email: 'dev@example.com',
        documento: '12345678',
        telefono: '0987654321'
      },
      roles: [
        {
          id: 1,
          tipoPersona: 'ADMINISTRADOR',
          nombre: 'Administrador'
        },
        {
          id: 2,
          tipoPersona: 'VENDEDOR',
          nombre: 'Vendedor'
        },
        {
          id: 3,
          tipoPersona: 'CAJERO',
          nombre: 'Cajero'
        }
      ]
    };

    // Realizar login automático
    this.authService.loginWithUserData(devUser)
      .then(() => {
        console.log('Sesión de desarrollo iniciada automáticamente');
        console.log('Usuario:', devUser);
      })
      .catch(error => {
        console.error('Error al iniciar sesión de desarrollo:', error);
      });
  }

  /**
   * Verifica y restaura la sesión si es necesario
   */
  ensureDevSession(): boolean {
    if (!this.authService.isLoggedIn()) {
      this.initializeDevSession();
      return true;
    }
    return true;
  }
}
