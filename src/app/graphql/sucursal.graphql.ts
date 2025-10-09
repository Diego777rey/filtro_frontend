import { gql } from "apollo-angular";

export const GET_SUCURSALES = gql`
  query GetAllSucursales {
    findAllSucursales {
    id
    nombre
    pais
    departamento
    ciudad
    direccion
    telefono
    }
  }
`;
export const GET_SUCURSAL_BY_ID = gql`
  query GetSucursalById($id: ID!) {
    findSucursalById(SucursalId: $id) {
      id
      nombre
      pais
      departamento
      ciudad
      direccion
      telefono
    }
  }
`;

export const CREATE_SUCURSAL = gql`
  mutation createSucursal($input: InputSucursal!) {
    createSucursal(inputSucursal: $input) {
      id
      nombre
      pais
      departamento
      ciudad
      direccion
      telefono
    }
  }
`;
export const UPDATE_SUCURSAL = gql`
  mutation UpdateSucursal($id: ID!, $input: InputSucursal!) {
    updateSucursal(id: $id, inputSucursal: $input) {
      id
      nombre
      pais
      departamento
      ciudad
      direccion
      telefono
    }
  }
`;
export const DELETE_SUCURSAL = gql`
  mutation DeleteSucursal($id: ID!) {
    deleteSucursal(id: $id) {
      id
    }
  }
`;
export const GET_SUCURSALES_PAGINADOS = gql`
  query GetSucursalesPaginated($page: Int!, $size: Int!, $search: String) {
    findSucursalesPaginated(page: $page, size: $size, search: $search) {
      items {
          id
          nombre
          pais
          departamento
          ciudad
          direccion
          telefono
        }
      totalItems
      totalPages
      currentPage
    }
  }
`;