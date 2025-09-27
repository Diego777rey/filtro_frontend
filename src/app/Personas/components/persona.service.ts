import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Persona, PersonaPaginatedResponse } from './persona';
import { 
  GET_PERSONAS, 
  GET_PERSONA_BY_ID, 
  GET_PERSONAS_PAGINADAS, 
  CREATE_PERSONA, 
  UPDATE_PERSONA, 
  DELETE_PERSONA 
} from 'src/app/graphql/graphql/persona.graphql';

@Injectable({
  providedIn: 'root'
})
export class PersonaService {

  constructor(private apollo: Apollo) { }

  // Obtener todas las personas
  getAll(): Observable<Persona[]> {
    return this.apollo.watchQuery<{ findAllPersonas: Persona[] }>({
      query: GET_PERSONAS
    }).valueChanges.pipe(
      map(result => result.data.findAllPersonas)
    );
  }

  // Obtener persona por ID
  getById(id: string): Observable<Persona> {
    return this.apollo.watchQuery<{ findPersonaById: Persona }>({
      query: GET_PERSONA_BY_ID,
      variables: { id }
    }).valueChanges.pipe(
      map(result => result.data.findPersonaById)
    );
  }

  // Obtener personas paginadas
  getPaginated(page: number, size: number, search?: string): Observable<PersonaPaginatedResponse> {
    return this.apollo.watchQuery<{ findPersonasPaginated: PersonaPaginatedResponse }>({
      query: GET_PERSONAS_PAGINADAS,
      variables: { page, size, search: search || '' },
      errorPolicy: 'all'
    }).valueChanges.pipe(
      map(result => result.data?.findPersonasPaginated || { 
        items: [], 
        totalItems: 0, 
        totalPages: 0, 
        currentPage: 0 
      })
    );
  }

  // Crear persona
  create(persona: Partial<Persona>): Observable<Persona> {
    return this.apollo.mutate<{ createPersona: Persona }>({
      mutation: CREATE_PERSONA,
      variables: { input: persona }
    }).pipe(
      map(result => result.data!.createPersona)
    );
  }

  // Actualizar persona
  update(id: string, persona: Partial<Persona>): Observable<Persona> {
    return this.apollo.mutate<{ updatePersona: Persona }>({
      mutation: UPDATE_PERSONA,
      variables: { id, input: persona }
    }).pipe(
      map(result => result.data!.updatePersona)
    );
  }

  // Eliminar persona
  delete(id: string): Observable<{ id: string }> {
    return this.apollo.mutate<{ deletePersona: { id: string } }>({
      mutation: DELETE_PERSONA,
      variables: { id }
    }).pipe(
      map(result => result.data!.deletePersona)
    );
  }
}
