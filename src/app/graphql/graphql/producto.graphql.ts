import { gql } from "apollo-angular";
//este es el query para las consultas
export const GET_PRODUCTOS = gql`
  query GetAllProductos {
    findAllProductos {
      id
      descripcion
      precioCompra
      precioVenta
      stock
      activo
      categoria {
      id
      descripcion
    }
    }
  }
`;
export const GET_PRODUCTOS_BY_ID = gql`
  query GetProductoById($productoId: ID!) {
    findProductoById(productoId: $productoId) {
      id
      descripcion
      precioCompra
      precioVenta
      stock
      activo
      categoria {
        id
        descripcion
      }
    }
  }
`;
//apartir de aca hacemos la mutation
export const CREATE_PRODUCTO = gql`
  mutation CreateProducto($input: InputProducto!) {
    createProducto(inputProducto: $input) {
      id
      descripcion
      precioCompra
      precioVenta
      stock
      activo
      categoria {
        id
        descripcion
      }
    }
  }
`;
export const UPDATE_PRODUCTO = gql`
  mutation UpdateProducto($id: ID!, $input: InputProducto!) {
    updateProducto(id: $id, inputProducto: $input) {
      id
      descripcion
      precioCompra
      precioVenta
      activo
      stock
      categoria {
        id
        descripcion
      }
    }
  }
`;
export const DELETE_PRODUCTO = gql`
  mutation DeleteProducto($id: ID!) {
    deleteProducto(id: $id) {
      id
    }
  }
`;
export const GET_PRODUCTOS_PAGINADOS = gql`
  query GetProductosPaginated($page: Int!, $size: Int!, $search: String) {
    findProductosPaginated(page: $page, size: $size, search: $search) {
      items {
        id
        descripcion
        precioCompra
        precioVenta
        stock
        activo
        categoria {
          id
          descripcion
        }
      }
      totalItems
      totalPages
      currentPage
    }
  }
`;
