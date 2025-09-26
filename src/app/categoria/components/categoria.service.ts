
import { Categoria } from "./categoria";
import { Injectable } from "@angular/core";
import { map, catchError, tap } from "rxjs";
import { Apollo } from "apollo-angular";
import { SAVE_CATEGORIA, DELETE_CATEGORIA, GET_CATEGORIAS, UPDATE_CATEGORIA, GET_CATEGORIAS_PAGINADOS, GET_CATEGORIA_BY_ID } from "src/app/graphql/graphql/categoria.graphql";
import { of, throwError } from "rxjs";
@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  constructor(private apollo: Apollo) {}

  getAll() {
    return this.apollo.watchQuery<{ findAllCategorias: Categoria[] }>({
      query: GET_CATEGORIAS,
      errorPolicy: 'all',
      fetchPolicy: 'cache-first'
    }).valueChanges.pipe(
      map(result => {
        return result.data?.findAllCategorias || [];
      }),
      catchError((error) => {
        console.error('Error al cargar categorías:', error);
        return throwError(() => error);
      })
    );
  }

  getById(id: number) {
    return this.apollo.watchQuery<{ findCategoriaById: Categoria }>({
      query: GET_CATEGORIA_BY_ID,
      variables: { id }
    }).valueChanges.pipe(
      map(result => result.data.findCategoriaById)
    );
  }

  create(Categoria: Categoria) {
    return this.apollo.mutate({
      mutation: SAVE_CATEGORIA,
      variables: { input: Categoria }
    });
  }

  update(id: number, Categoria: Categoria) {
    return this.apollo.mutate({
      mutation: UPDATE_CATEGORIA,
      variables: { id, input: Categoria }
    });
  }

  delete(id: number) {
    return this.apollo.mutate({
      mutation: DELETE_CATEGORIA,
      variables: { id }
    });
  }

  getPaginated(page: number, size: number, search: string = '') {
    return this.apollo.watchQuery({
      query: GET_CATEGORIAS_PAGINADOS,
      variables: { page, size, search },
      fetchPolicy: 'cache-and-network'
    }).valueChanges.pipe(
      map((result: any) => {
        return result.data?.findCategoriasPaginated || { items: [], totalItems: 0, totalPages: 0, currentPage: 0 };
      })
    );
  }
}
