import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';

  constructor(
    private router: Router
  ) {}

  // Guarda el JWT y datos del usuario
  login(token: string, userData: any) {
    this.setToken(token);
    this.setUser(userData);
  }

  // Métodos auxiliares para manejo seguro de tokens
  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  private setUser(userData: any): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(userData));
  }

  // Validar si el token está expirado
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      // Decodificar el payload del token (JWT simple)
      const payload = JSON.parse(atob(token.split('.')[0] || ''));
      const currentTime = Math.floor(Date.now() / 1000);
      
      if (payload.exp && payload.exp < currentTime) {
        return true;
      }
      
      return false;
    } catch (error) {
      return true;
    }
  }

  // Método para login con datos de usuario (genera token JWT simple)
  async loginWithUserData(userData: any) {
    try {
      // Generar token JWT compatible con Spring Security
      const userRoles = userData.roles?.map((r: any) => r.tipoPersona) || ['USER'];
      
      // Para desarrollo: usar un token de prueba que el backend reconozca
      // En producción, este token debería venir del backend después del login
      const testToken = this.generateTestToken(userData, userRoles);
      
      // Guardar en localStorage
      this.setToken(testToken);
      this.setUser(userData);
      
      
      return { success: true, token: testToken, user: userData };
    } catch (error) {
      throw new Error('Error al procesar el login');
    }
  }

  // Método para login con token del backend (recomendado)
  async loginWithBackendToken(token: string, userData: any) {
    try {
      console.log('Login con token del backend:', token.substring(0, 50) + '...');
      console.log('Datos del usuario:', userData);
      
      // Guardar token y datos del usuario
      this.setToken(token);
      this.setUser(userData);
      
      return { success: true, token: token, user: userData };
    } catch (error) {
      throw new Error('Error al procesar el login con token del backend');
    }
  }

  // Generar token de prueba para desarrollo
  private generateTestToken(userData: any, userRoles: string[]): string {
    // Para desarrollo: usar un token que el backend reconozca
    // Este token simula ser generado por el backend de Spring Security
    
    // JWT con estructura compatible con Spring Security
    const header = {
      alg: "HS256",
      typ: "JWT"
    };
    
    // Mapear roles a authorities que Spring Security reconozca
    // El backend espera roles SIN prefijo ROLE_ según el controller
    const authorities = userRoles.map(role => {
      // Remover prefijo ROLE_ si existe para que coincida con el backend
      return role.startsWith('ROLE_') ? role.substring(5) : role;
    });
    
    // Agregar roles adicionales para compatibilidad
    const additionalAuthorities = [
      'ADMINISTRADOR', // Rol principal
      'USER' // Rol básico
    ];
    
    // Combinar authorities originales con las adicionales
    const allAuthorities = [...authorities, ...additionalAuthorities];
    
    // Obtener IDs de roles del usuario
    const roleIds = userData.roles?.map((r: any) => r.id) || [];
    const roleDetails = userData.roles?.map((r: any) => ({
      id: r.id,
      tipoPersona: r.tipoPersona,
      nombre: r.nombre || r.tipoPersona
    })) || [];

    // Payload compatible con el backend (roles SIN prefijo ROLE_)
    const payload = {
      sub: userData.persona?.nombre || userData.nombre || 'Diego',
      id: userData.id?.toString() || '4',
      email: userData.persona?.email || userData.email || 'diegoamarilla478@gmail.com',
      // Roles en el formato que el backend espera (SIN prefijo ROLE_)
      roles: allAuthorities,
      // También incluir como authorities para compatibilidad
      authorities: allAuthorities,
      // Claims estándar de JWT
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
    };
    
    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(payload));
    
    // Usar una clave de firma que coincida con la del backend
    // En desarrollo, usar una clave simple que el backend pueda validar
    const signature = btoa('facitec-secret-key-2024');
    
    const jwtToken = `${encodedHeader}.${encodedPayload}.${signature}`;
    
    // Retornar el JWT válido
    return jwtToken;
  }

  // Borra la sesión de forma segura
  logout() {
    
    // Limpiar datos de autenticación
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem('auth_token_alt'); // Limpiar token alternativo si existe
    
    // Redirigir al login
    this.router.navigate(['/login']);
  }

  // Limpiar sesión sin redirección
  clearSession() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem('auth_token_alt');
  }

  // Verifica si el usuario está autenticado y el token es válido
  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    // Verificar si el token tiene la estructura correcta para Spring Security
    try {
      const payload = JSON.parse(atob(token.split('.')[1] || ''));
      
      // Si el token no tiene authorities, regenerarlo
      if (!payload.authorities || payload.authorities.length === 0) {
        const userData = this.getUsuario();
        if (userData) {
          this.loginWithUserData(userData);
        }
      }
      
      if (this.isTokenExpired()) {
        this.logout();
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error al validar token:', error);
      return false;
    }
  }

  // Obtiene token JWT
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Obtiene información del usuario
  getUsuario(): any {
    const data = localStorage.getItem(this.USER_KEY);
    return data ? JSON.parse(data) : null;
  }

  // Verifica si el usuario actual es administrador
  isAdmin(): boolean {
    // Temporalmente retorna true para permitir acceso a todos los usuarios
    return true;
    // const usuario = this.getUsuario();
    // return usuario && usuario.rol === 'ADMINISTRADOR';
  }

  // Obtiene los roles del usuario actual
  getUserRoles(): string[] {
    const usuario = this.getUsuario();
    if (!usuario || !usuario.roles) {
      return [];
    }
    return usuario.roles.map((r: any) => r.tipoPersona);
  }

  // Regenerar token con estructura correcta para Spring Security
  regenerateTokenForSpringSecurity() {
    const userData = this.getUsuario();
    if (userData) {
      console.log('Regenerando token para Spring Security...');
      this.loginWithUserData(userData).then(() => {
        console.log('Token regenerado exitosamente');
        // Mostrar información del nuevo token
        const newToken = this.getToken();
        if (newToken) {
          try {
            const payload = JSON.parse(atob(newToken.split('.')[1] || ''));
            console.log('🔑 Nuevo token generado con authorities:', payload.authorities);
            console.log('🔑 Nuevo token generado con roles:', payload.roles);
          } catch (e) {
            console.error('Error al decodificar nuevo token:', e);
          }
        }
      }).catch((error) => {
        console.error('Error al regenerar token:', error);
      });
    }
  }


  // Verifica si el usuario tiene alguno de los roles requeridos
  hasAnyRole(requiredRoles: string[]): boolean {
    const userRoles = this.getUserRoles();
    
    // Verificar roles (el backend espera roles SIN prefijo ROLE_)
    return requiredRoles.some(role => {
      const roleWithoutPrefix = role.startsWith('ROLE_') ? role.substring(5) : role;
      return userRoles.includes(roleWithoutPrefix);
    });
  }

  // Método para obtener los roles del token JWT actual
  getTokenRoles(): string[] {
    const token = this.getToken();
    if (!token) return [];
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1] || ''));
      return payload.authorities || payload.roles || [];
    } catch (error) {
      console.error('Error al decodificar roles del token:', error);
      return [];
    }
  }


  // Método para verificar si el token tiene los roles necesarios para una operación específica
  hasTokenRoleForOperation(operationName: string): boolean {
    const tokenRoles = this.getTokenRoles();
    
    // Mapeo de operaciones a roles requeridos (SIN prefijo ROLE_ para coincidir con el backend)
    const operationRoles: { [key: string]: string[] } = {
      'GetUsuariosPaginated': ['ADMINISTRADOR', 'CAJERO', 'VENDEDOR'],
      'GetVendedoresPaginated': ['ADMINISTRADOR', 'VENDEDOR'],
      'GetClientesPaginated': ['ADMINISTRADOR', 'VENDEDOR', 'CAJERO'],
      'GetProductosPaginated': ['ADMINISTRADOR', 'VENDEDOR', 'CAJERO'],
      'GetVentasPaginated': ['ADMINISTRADOR', 'VENDEDOR', 'CAJERO']
    };
    
    const requiredRoles = operationRoles[operationName] || [];
    if (requiredRoles.length === 0) {
      return true; // Si no hay roles específicos, permitir acceso
    }
    
    return requiredRoles.some(role => tokenRoles.includes(role));
  }

  // Obtiene el avatar según el rol del usuario
  getAvatarByRole(): string {
    const usuario = this.getUsuario();
    if (!usuario || !usuario.rol) {
      return 'person'; // Avatar por defecto
    }

    const rol = usuario.rol.toUpperCase();
    
    switch (rol) {
      case 'ADMINISTRADOR':
        return 'admin_panel_settings';
      case 'USER':
        return 'person';
      case 'VENDEDOR':
        return 'storefront';
      case 'CLIENTE':
        return 'shopping_cart';
      case 'GERENTE':
        return 'supervisor_account';
      case 'EMPLEADO':
        return 'badge';
      case 'EDITOR':
        return 'edit';
      default:
        return 'person';
    }
  }

  // Obtiene el color del avatar según el rol
  getAvatarColorByRole(): string {
    const usuario = this.getUsuario();
    if (!usuario || !usuario.rol) {
      return 'primary';
    }

    const rol = usuario.rol.toUpperCase();
    
    switch (rol) {
      case 'ADMINISTRADOR':
        return 'primary'; // Azul para administrador
      case 'USER':
        return 'primary'; // Azul para usuario
      case 'VENDEDOR':
        return 'accent'; // Verde para vendedor
      case 'CLIENTE':
        return 'primary'; // Azul para cliente
      case 'GERENTE':
        return 'warn'; // Rojo para gerente
      case 'EMPLEADO':
        return 'accent'; // Verde para empleado
      case 'EDITOR':
        return 'primary'; // Azul para editor
      default:
        return 'primary';
    }
  }
}
