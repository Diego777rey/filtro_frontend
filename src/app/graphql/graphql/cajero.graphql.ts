import { gql } from "apollo-angular";

export const GET_CAJEROS = gql`
  query GetAllCajeros {
    findAllCajeros {
      id
      codigoCajero
      turno
      fechaIngreso
      estado
      caja {
        id
        descripcion
        estado
      }
      persona {
        id
        nombre
        apellido
      }
    }
  }
`;
export const GET_CAJERO_BY_ID = gql`
  query GetCajeroById($cajeroId: ID!) {
    findCajeroById(CajeroId: $cajeroId) {
      id
      codigoCajero
      turno
      fechaIngreso
      estado
      caja {
        id
        descripcion
        estado
      }
      persona {
        id
        nombre
        apellido
      }
    }
  }
`;

export const GET_CAJEROS_PAGINADOS = gql`
  query GetCajerosPaginated($page: Int!, $size: Int!, $search: String) {
    findCajerosPaginated(page: $page, size: $size, search: $search) {
      items {
        id
        codigoCajero
        turno
        fechaIngreso
        estado
        caja {
          id
          descripcion
          estado
        }
        persona {
          id
          nombre
          apellido
        }
      }
      totalItems
      totalPages
      currentPage
      itemsCount
    }
  }
`;

export const CREATE_CAJERO = gql`
  mutation CreateCajero($input: InputCajero!) {
    createCajero(inputCajero: $input) {
      id
      codigoCajero
      turno
      fechaIngreso
      estado
      caja {
        id
        descripcion
        estado
      }
      persona {
        id
        nombre
        apellido
      }
    }
  }
`;
export const UPDATE_CAJERO = gql`
  mutation UpdateCajero($id: ID!, $input: InputCajero!) {
    updateCajero(id: $id, inputCajero: $input) {
      id
      codigoCajero
      turno
      fechaIngreso
      estado
      caja {
        id
        descripcion
        estado
      }
      persona {
        id
        nombre
        apellido
      }
    }
  }
`;
export const DELETE_CAJERO = gql`
  mutation DeleteCajero($id: ID!) {
    deleteCajero(id: $id) {
      id
    }
  }
`;
