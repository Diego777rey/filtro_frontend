import { environment } from '../../../environments/environment';

/**
 * Configuración de seguridad para la aplicación
 * Implementa las mejores prácticas de seguridad para producción
 */
export class SecurityConfig {
  
  // Configuración de JWT
  static readonly JWT_CONFIG = {
    secret: environment.jwtSecret,
    expirationTime: environment.tokenExpirationTime,
    algorithm: 'HS256' as const,
    issuer: 'tu-aplicacion', // Cambiar por el nombre de tu aplicación
    audience: 'tu-audiencia' // Cambiar por la audiencia de tu aplicación
  };
  
  // Configuración de headers de seguridad
  static readonly SECURITY_HEADERS = {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block'
  };
  
  // Configuración de CORS
  static readonly CORS_CONFIG = {
    allowedOrigins: environment.production 
      ? ['https://tu-dominio.com'] // Cambiar por tu dominio de producción
      : ['http://localhost:4200', 'http://localhost:8080'],
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  };
  
  // Configuración de rate limiting
  static readonly RATE_LIMIT = {
    maxRequests: 100, // Máximo de requests por minuto
    windowMs: 60000, // Ventana de tiempo en milisegundos
    skipSuccessfulRequests: true
  };
  
  // Configuración de logging de seguridad
  static readonly SECURITY_LOGGING = {
    logAuthAttempts: true,
    logFailedRequests: true,
    logSuspiciousActivity: true
  };
}
