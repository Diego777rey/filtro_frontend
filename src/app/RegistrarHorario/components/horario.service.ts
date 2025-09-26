import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { map, catchError } from 'rxjs';
import { of, throwError } from 'rxjs';
import { 
  GET_HORARIOS, 
  GET_HORARIO_BY_ID, 
  CREATE_HORARIO, 
  UPDATE_HORARIO, 
  DELETE_HORARIO,
  GET_HORARIOS_PAGINADOS 
} from '../../graphql/graphql/horario.graphql';
import { Horario } from './horario';

export interface InputHorario {
  fechaHora: string;
  horarios: string;
  vendedorId: number;
}

@Injectable({
  providedIn: 'root'
})
export class HorarioService {
  constructor(private apollo: Apollo) {}

  getAll() {
    return this.apollo.watchQuery<{ findAllRegistrarHorarios: Horario[] }>({
      query: GET_HORARIOS,
      errorPolicy: 'all',
      fetchPolicy: 'cache-first'
    }).valueChanges.pipe(
      map(result => {
        return result.data?.findAllRegistrarHorarios || [];
      }),
      catchError((error) => {
        console.error('Error al cargar horarios:', error);
        return throwError(() => error);
      })
    );
  }

  getById(id: number) {
    return this.apollo.watchQuery<{ findRegistrarHorarioById: Horario }>({
      query: GET_HORARIO_BY_ID,
      variables: { id }
    }).valueChanges.pipe(
      map(result => result.data.findRegistrarHorarioById)
    );
  }

  create(horario: InputHorario) {
    return this.apollo.mutate({
      mutation: CREATE_HORARIO,
      variables: { inputRegistrarHorario: horario }
    });
  }

  update(id: number, horario: InputHorario) {
    return this.apollo.mutate({
      mutation: UPDATE_HORARIO,
      variables: { id, inputRegistrarHorario: horario }
    });
  }

  delete(id: number) {
    return this.apollo.mutate({
      mutation: DELETE_HORARIO,
      variables: { id }
    });
  }

  getPaginated(page: number, size: number, search: string = '') {
    return this.apollo.watchQuery({
      query: GET_HORARIOS_PAGINADOS,
      variables: { page, size },
      fetchPolicy: 'cache-and-network'
    }).valueChanges.pipe(
      map((result: any) => {
        return result.data?.findRegistrarHorariosPaginated || { items: [], totalItems: 0, totalPages: 0, currentPage: 0 };
      })
    );
  }
}
