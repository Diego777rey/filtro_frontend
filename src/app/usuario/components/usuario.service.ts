import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { Apollo } from "apollo-angular";
import { InputUsuario } from "./input.usuario";
import {
  CREATE_USUARIO,
  DELETE_USUARIO,
  UPDATE_USUARIO,
  GET_USUARIO_BY_ID,
  GET_USUARIOS,
  GET_USUARIOS_PAGINADOS,
  LOGIN_USUARIO
} from "src/app/graphql/graphql/usuario.graphql";

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  constructor(private apollo: Apollo) {}

  // --- LOGIN seguro con GraphQL ---
  login(nombre: string, contrasenha: string) {
    return this.apollo.mutate({
      mutation: LOGIN_USUARIO,
      variables: { nombre, contrasenha }
    }).pipe(
      map((result: any) => {
        const loginData = result.data?.login;
        console.log('Datos del login:', loginData);
        
        // Retornar usuario y token si están disponibles
        return {
          usuario: loginData?.usuario,
          token: loginData?.token
        };
      })
    );
  }
  
  

  // --- Obtener todos los usuarios ---
  getAll(): Observable<InputUsuario[]> {
    return this.apollo.watchQuery<{ findAllUsuarios: InputUsuario[] }>({
      query: GET_USUARIOS
    }).valueChanges.pipe(map(result => result.data.findAllUsuarios));
  }

  // --- Obtener usuario por ID ---
  getById(id: number): Observable<InputUsuario> {
    return this.apollo.watchQuery<{ findUsuarioById: InputUsuario }>({
      query: GET_USUARIO_BY_ID,
      variables: { id }
    }).valueChanges.pipe(map(result => result.data.findUsuarioById));
  }

  // --- Crear usuario ---
  create(usuario: InputUsuario): Observable<any> {
    return this.apollo.mutate({
      mutation: CREATE_USUARIO,
      variables: { input: usuario }
    });
  }

  // --- Actualizar usuario ---
  update(id: number, usuario: InputUsuario): Observable<any> {
    return this.apollo.mutate({
      mutation: UPDATE_USUARIO,
      variables: { id, input: usuario }
    });
  }

  // --- Eliminar usuario ---
  delete(id: number): Observable<any> {
    return this.apollo.mutate({
      mutation: DELETE_USUARIO,
      variables: { id }
    });
  }

  // --- Obtener usuarios paginados ---
  getPaginated(page: number, size: number, search: string = ''): Observable<any> {
    return this.apollo.watchQuery({
      query: GET_USUARIOS_PAGINADOS,
      variables: { page, size, search },
      fetchPolicy: 'cache-and-network'
    }).valueChanges.pipe(
      map((result: any) => {
        return result.data?.findUsuariosPaginated || { items: [], totalItems: 0, totalPages: 0, currentPage: 0 };
      })
    );
  }
}