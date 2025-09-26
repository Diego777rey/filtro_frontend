import { gql } from "apollo-angular";
export const GET_CLIENTES = gql`
  query GetAllClientes {
    findAllClientes {
      id
      codigoCliente
      fechaRegistro
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

export const GET_CLIENTE_BY_ID = gql`
  query GetClienteById($id: ID!) {
    findClienteById(clienteId: $id) {
      id
      codigoCliente
      fechaRegistro
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

export const GET_CLIENTES_PAGINADOS = gql`
  query GetClientesPaginated($page: Int!, $size: Int!, $search: String) {
    findClientesPaginated(page: $page, size: $size, search: $search) {
      items {
        id
        codigoCliente
        fechaRegistro
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

export const CREATE_CLIENTE = gql`
  mutation CreateCliente($input: InputCliente!) {
    createCliente(inputCliente: $input) {
      id
      codigoCliente
      fechaRegistro
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

export const UPDATE_CLIENTE = gql`
  mutation UpdateCliente($id: ID!, $input: InputCliente!) {
    updateCliente(id: $id, inputCliente: $input) {
      id
      codigoCliente
      fechaRegistro
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

export const DELETE_CLIENTE = gql`
  mutation DeleteCliente($id: ID!) {
    deleteCliente(id: $id) {
      id
    }
  }
`;