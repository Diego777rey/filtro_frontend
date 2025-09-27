import { gql } from "apollo-angular";
export const GET_PROVEEDORES = gql`
  query GetAllProveedores {
    findAllProveedores {
      id
      ruc
      razonSocial
      rubro
      telefono
      email
      persona {
        id
      }
      observaciones
    }
  }
`;
export const GET_PROVEEDOR_BY_ID = gql`
  query GetProveedorById($proveedorId: ID!) {
    findProveedorById(proveedorId: $proveedorId) {
      id
      ruc
      razonSocial
      rubro
      telefono
      email
      persona {
        id
      }
      observaciones
    }
  }
`;
export const GET_PROVEEDORES_PAGINADOS = gql`
  query GetProveedoresPaginated($page: Int!, $size: Int!, $search: String) {
    findProveedoresPaginated(page: $page, size: $size, search: $search) {
      items {
        id
        ruc
        razonSocial
        rubro
        telefono
        email
        persona {
          id
        }
        observaciones
      }
      totalItems
      totalPages
      currentPage
      itemsCount
    }
  }
`;

export const CREATE_PROVEEDOR = gql`
  mutation CreateProveedor($input: InputProveedor!) {
    createProveedor(inputProveedor: $input) {
      id
      ruc
      razonSocial
      rubro
      telefono
      email
      persona {
        id
      }
      observaciones
    }
  }
`;
export const UPDATE_PROVEEDOR = gql`
  mutation UpdateProveedor($id: ID!, $input: InputProveedor!) {
    updateProveedor(id: $id, inputProveedor: $input) {
      id
      ruc
      razonSocial
      rubro
      telefono
      email
      persona {
        id
      }
      observaciones
    }
  }
`;
export const DELETE_PROVEEDOR = gql`
  mutation DeleteProveedor($id: ID!) {
    deleteProveedor(id: $id) {
      id
    }
  }
`;
