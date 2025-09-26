export const environment = {
  production: true,
  apiUrl: 'https://tu-dominio.com/graphql', // Cambiar por tu dominio de producción
  jwtSecret: 'claveSuperSecretaMuyLargaQueTengaAlMenos32Caracteres!', // En producción, usar variable de entorno
  tokenExpirationTime: '1h', // Tiempo de expiración más corto en producción
  enableAuth: true
};
