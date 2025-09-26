import { NgModule } from '@angular/core';
import { ApolloModule, APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache, ApolloClientOptions } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { AuthService } from './core/guards/auth.service';
import { environment } from '../environments/environment';

// Configuración desde variables de entorno
const uri = environment.apiUrl;
const DISABLE_AUTH = !environment.enableAuth;

export function createApollo(httpLink: HttpLink, authService: AuthService): ApolloClientOptions<any> {

  const authLink = setContext((operation, context) => {
    const headers: any = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    // Operaciones públicas que no requieren autenticación
    const publicOperations = ['LoginUsuario', 'RegisterUsuario', 'ForgotPassword'];
    const operationName = operation.operationName;

    // Para operaciones públicas, no enviar token
    if (operationName && publicOperations.includes(operationName)) {
      return { headers };
    }

    // Para operaciones protegidas, enviar token JWT
    const token = authService.getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return { headers };
  });

  // Link de manejo de errores mejorado
  const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
    if (networkError) {
      const status = (networkError as any).status;
      
      if (status === 401) {
        // Solo cerrar sesión si no es una operación pública
        const operationName = operation.operationName;
        const publicOperations = ['LoginUsuario', 'RegisterUsuario', 'ForgotPassword'];
        
        if (!publicOperations.includes(operationName)) {
          authService.logout();
        }
      }
    }
    
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, locations, path, extensions }) => {
        // Solo mostrar errores críticos en producción
        if (message === 'Access Denied') {
          console.error('Error de acceso denegado');
        }
      });
    }
  });

  // Link HTTP
  const http = httpLink.create({ uri });
  const link = authLink.concat(errorLink).concat(http);

  return {
    link,
    cache: new InMemoryCache(),
  };
}

@NgModule({
  exports: [ApolloModule],
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory: createApollo,
      deps: [HttpLink, AuthService],
    },
  ],
})
export class GraphQLModule {}
