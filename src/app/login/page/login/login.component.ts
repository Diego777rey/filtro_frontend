import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/guards/auth.service';
import { Apollo } from 'apollo-angular';
import { LOGIN_USUARIO } from 'src/app/graphql/usuario.graphql';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  usuarioForm = this.fb.group({
    nombre: ['', Validators.required],
    contrasenha: ['', Validators.required],
  });

  returnUrl: string = '/dashboard/bienvenido';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private apollo: Apollo
  ) {}

  ngOnInit(): void {
    const queryReturnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    if (queryReturnUrl) {
      this.returnUrl = queryReturnUrl;
    }
  }

  iniciarSesion() {
    if (this.usuarioForm.invalid) {
      this.usuarioForm.markAllAsTouched();
      return;
    }

    const nombre = this.usuarioForm.value.nombre?.trim();
    const contrasenha = this.usuarioForm.value.contrasenha?.trim();

    // Validación adicional para evitar valores null o vacíos
    if (!nombre || !contrasenha) {
      alert('Por favor, complete todos los campos requeridos');
      return;
    }

    // Intentando login con la estructura correcta según el esquema del backend
    this.apollo.mutate({
      mutation: LOGIN_USUARIO,
      variables: {
        nombre: nombre,
        contrasenha: contrasenha
      },
      errorPolicy: 'all'
    }).subscribe({
      next: (result: any) => {
        if (result.errors && result.errors.length > 0) {
          const errorMessage = result.errors[0].message;
          
          // Manejo específico de errores comunes
          if (errorMessage.includes('Variable') && errorMessage.includes('null')) {
            alert('Error: Los campos nombre y contraseña son obligatorios');
          } else if (errorMessage.includes('Invalid credentials') || errorMessage.includes('Usuario no encontrado')) {
            alert('Usuario o contraseña incorrectos');
          } else {
            alert(`Error: ${errorMessage}`);
          }
          return;
        }

        const loginResult = result.data?.login;
        if (loginResult) {
          // Verificar si el resultado incluye un token JWT y usuario
          if (loginResult.token && loginResult.usuario) {
            // Caso 1: Backend retorna token JWT + usuario (estructura AuthPayload exitosa)
            // Usar el token real del backend
            this.authService.loginWithBackendToken(loginResult.token, loginResult.usuario).then(() => {
              this.router.navigateByUrl(this.returnUrl);
            }).catch((error) => {
              alert('Error al procesar el login');
            });
          } else if (loginResult.usuario && !loginResult.token) {
            // Caso 2: Backend retorna solo Usuario sin token (login exitoso pero sin JWT)
            // Generar token de prueba para desarrollo
            this.authService.loginWithUserData(loginResult.usuario).then(() => {
              this.router.navigateByUrl(this.returnUrl);
            }).catch((error) => {
              alert('Error al procesar el login');
            });
          } else if (loginResult.id) {
            // Caso 3: Backend retorna directamente Usuario (estructura antigua)
            // Generar token de prueba para desarrollo
            this.authService.loginWithUserData(loginResult).then(() => {
              this.router.navigateByUrl(this.returnUrl);
            }).catch((error) => {
              alert('Error al procesar el login');
            });
          } else {
            // Login fallido - no hay usuario válido ni token
            alert('Usuario o contraseña incorrectos');
            return;
          }
        } else {
          // Login fallido - no hay datos de respuesta
          alert('Usuario o contraseña incorrectos');
        }
      },
      error: (err) => {
        
        // Manejo específico de errores de red
        if (err.networkError) {
          if (err.networkError.status === 0) {
            alert('Error: No se puede conectar al servidor. Verifique que esté ejecutándose.');
          } else {
            alert(`Error de red: ${err.networkError.status} - ${err.networkError.statusText}`);
          }
        } else if (err.graphQLErrors?.length > 0) {
          // Manejo de errores GraphQL específicos
          const graphQLError = err.graphQLErrors[0];
          if (graphQLError.message.includes('Variable') && graphQLError.message.includes('null')) {
            alert('Error: Los campos son obligatorios y no pueden estar vacíos');
          } else {
            alert(`Error GraphQL: ${graphQLError.message}`);
          }
        } else {
          alert('Ocurrió un error inesperado durante el login');
        }
      }
    });
  }
}
