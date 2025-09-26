import { Injectable } from '@angular/core';
import { SignJWT, jwtVerify } from 'jose';
import { environment } from '../../../environments/environment';
import { SecurityConfig } from '../config/security.config';

@Injectable({
  providedIn: 'root'
})
export class JwtService {
  
  // Configuración de seguridad
  private readonly JWT_CONFIG = SecurityConfig.JWT_CONFIG;
  
  // Convertir la clave a formato compatible con jose
  private getSecretKey() {
    return new TextEncoder().encode(this.JWT_CONFIG.secret);
  }
  
  /**
   * Genera un JWT válido para el usuario
   * @param userData Datos del usuario
   * @returns JWT token válido
   */
  async generateJWT(userData: any): Promise<string> {
    const payload = {
      sub: userData.id, // Subject (ID del usuario)
      username: userData.persona?.nombre || 'usuario',
      roles: userData.roles?.map((role: any) => role.tipoPersona) || ['USER']
    };
    
    try {
      const jwt = await new SignJWT(payload)
        .setProtectedHeader({ alg: this.JWT_CONFIG.algorithm })
        .setIssuedAt()
        .setExpirationTime(this.JWT_CONFIG.expirationTime)
        .setIssuer(this.JWT_CONFIG.issuer)
        .setAudience(this.JWT_CONFIG.audience)
        .sign(this.getSecretKey());
        
      return jwt;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Valida si un JWT es válido (solo para desarrollo)
   * @param token JWT token
   * @returns true si es válido
   */
  async validateJWT(token: string): Promise<boolean> {
    try {
      await jwtVerify(token, this.getSecretKey());
      return true;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Decodifica un JWT para ver su contenido
   * @param token JWT token
   * @returns Payload decodificado
   */
  decodeJWT(token: string): any {
    try {
      // Decodificar sin verificar (solo para ver el contenido)
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      const payload = parts[1];
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch (error) {
      return null;
    }
  }
}
