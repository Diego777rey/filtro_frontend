import { gql } from "apollo-angular";

// ----------------------------- QUERIES -----------------------------

// Obtener todas las cajas
export const GET_CAJAS = gql`
  query GetAllCajas {
    findAllCajas {
      id
      codigoCaja
      descripcion
      ubicacion
      estadoCaja
      saldoInicial
      saldoActual
    }
  }
`;

// Obtener caja por ID
export const GET_CAJA_BY_ID = gql`
  query GetCajaById($cajaId: ID!) {
    findCajaById(cajaId: $cajaId) {
      id
      codigoCaja
      descripcion
      ubicacion
      estadoCaja
      saldoInicial
      saldoActual
    }
  }
`;

// Obtener cajas paginadas
export const GET_CAJAS_PAGINADAS = gql`
  query GetCajasPaginated($page: Int!, $size: Int!, $search: String) {
    findCajasPaginated(page: $page, size: $size, search: $search) {
      items {
        id
        codigoCaja
        descripcion
        ubicacion
        estadoCaja
        saldoInicial
        saldoActual
      }
      totalItems
      totalPages
      currentPage
      itemsCount
    }
  }
`;

// ----------------------------- MUTATIONS -----------------------------

// Crear caja
export const CREATE_CAJA = gql`
  mutation CreateCaja($input: InputCaja!) {
    saveCaja(inputCaja: $input) {
      id
      codigoCaja
      descripcion
      ubicacion
      estadoCaja
      saldoInicial
      saldoActual
    }
  }
`;

// Actualizar caja
export const UPDATE_CAJA = gql`
  mutation UpdateCaja($id: ID!, $input: InputCaja!) {
    updateCaja(id: $id, inputCaja: $input) {
      id
      codigoCaja
      descripcion
      ubicacion
      estadoCaja
      saldoInicial
      saldoActual
    }
  }
`;

// Eliminar caja
export const DELETE_CAJA = gql`
  mutation DeleteCaja($id: ID!) {
    deleteCaja(id: $id) {
      id
    }
  }
`;
