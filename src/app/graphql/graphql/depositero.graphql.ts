import { gql } from "apollo-angular";

export const GET_DEPOSITEROS = gql`
  query GetAllDepositeros {
    findAllDepositeros {
      id
      codigoDepositero
      fechaIngreso
      turno
      almacenAsignado
      supervisor
      horario
      estado
      persona {
        id
        nombre
        apellido
        documento
        telefono
        email
      }
    }
  }
`;

export const GET_DEPOSITERO_BY_ID = gql`
    query GetDepositeroById($id: ID!) {
    findDepositeroById(depositeroId: $id) {
      id
      codigoDepositero
      fechaIngreso
      turno
      almacenAsignado
      supervisor
      horario
      estado
      persona {
        id
        nombre
        apellido
        documento
        telefono
        email
      }
    }
  }
`;

export const GET_DEPOSITEROS_PAGINADOS = gql`
  query GetDepositerosPaginated($page: Int!, $size: Int!, $search: String) {
    findDepositerosPaginated(page: $page, size: $size, search: $search) {
      items {
        id
        codigoDepositero
        fechaIngreso
        turno
        almacenAsignado
        supervisor
        horario
        estado
        persona {
          id
          nombre
          apellido
          documento
          telefono
          email
        }
      }
      totalItems
      totalPages
      currentPage
    }
  }
`;

export const CREATE_DEPOSITERO = gql`
  mutation CreateDepositero($input: InputDepositero!) {
    createDepositero(inputDepositero: $input) {
      id
      codigoDepositero
      fechaIngreso
      turno
      almacenAsignado
      supervisor
      horario
      estado
      persona {
        id
        nombre
        apellido
        documento
        telefono
        email
      }
    }
  }
`;

    export const UPDATE_DEPOSITERO = gql`
  mutation UpdateDepositero($id: ID!, $input: InputDepositero!) {
    updateDepositero(id: $id, inputDepositero: $input) {
      id
      codigoDepositero
      fechaIngreso
      turno
      almacenAsignado
      supervisor
      horario
      estado
      persona {
        id
        nombre
        apellido
        documento
        telefono
        email
      }
    }
  }
`;

export const DELETE_DEPOSITERO = gql`
  mutation DeleteDepositero($id: ID!) {
    deleteDepositero(id: $id) {
      id
    }
  }
`;