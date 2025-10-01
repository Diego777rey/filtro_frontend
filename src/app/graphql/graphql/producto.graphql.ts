import { gql } from "apollo-angular";

// ----------------------------- QUERIES -----------------------------

// Obtener todos los productos
export const GET_PRODUCTOS = gql`
  query GetAllProductos {
    findAllProductos {
      id
      codigoProducto
      nombre
      descripcion
      precioCompra
      precioVenta
      stock
      productoEstado
      categoria {
        id
        nombre
        categoriaEstado
      }
      proveedor {
        id
        ruc
        razonSocial
        rubro
        telefono
        email
        observaciones
      }
    }
  }
`;

// Obtener producto por ID
export const GET_PRODUCTOS_BY_ID = gql`
  query GetProductoById($productoId: ID!) {
    findProductoById(productoId: $productoId) {
      id
      codigoProducto
      nombre
      descripcion
      precioCompra
      precioVenta
      stock
      productoEstado
      categoria {
        id
        nombre
        categoriaEstado
      }
      proveedor {
        id
        ruc
        razonSocial
        rubro
        telefono
        email
        observaciones
      }
    }
  }
`;

// Obtener productos paginados
export const GET_PRODUCTOS_PAGINADOS = gql`
  query GetProductosPaginated($page: Int!, $size: Int!, $search: String) {
    findProductosPaginated(page: $page, size: $size, search: $search) {
      items {
        id
        codigoProducto
        nombre
        descripcion
        precioCompra
        precioVenta
        stock
        productoEstado
        categoria {
          id
          nombre
          categoriaEstado
        }
        proveedor {
          id
          ruc
          razonSocial
          rubro
          telefono
          email
          observaciones
        }
      }
      totalItems
      totalPages
      currentPage
      itemsCount
    }
  }
`;

// Consulta simple para probar
export const GET_PRODUCTOS_SIMPLES = gql`
  query GetProductosSimples($page: Int!, $size: Int!, $search: String) {
    findProductosPaginated(page: $page, size: $size, search: $search) {
      items {
        id
        nombre
        descripcion
        precioVenta
        stock
        productoEstado
      }
      totalItems
      totalPages
      currentPage
      itemsCount
    }
  }
`;

// ----------------------------- MUTATIONS -----------------------------

// Crear producto
export const CREATE_PRODUCTO = gql`
  mutation CreateProducto($input: InputProducto!) {
    createProducto(inputProducto: $input) {
      id
      codigoProducto
      nombre
      descripcion
      precioCompra
      precioVenta
      stock
      productoEstado
      categoria {
        id
        nombre
        categoriaEstado
      }
      proveedor {
        id
        ruc
        razonSocial
        rubro
        telefono
        email
        observaciones
      }
    }
  }
`;

// Actualizar producto
export const UPDATE_PRODUCTO = gql`
  mutation UpdateProducto($id: ID!, $input: InputProducto!) {
    updateProducto(id: $id, inputProducto: $input) {
      id
      codigoProducto
      nombre
      descripcion
      precioCompra
      precioVenta
      stock
      productoEstado
      categoria {
        id
        nombre
        categoriaEstado
      }
      proveedor {
        id
        ruc
        razonSocial
        rubro
        telefono
        email
        observaciones
      }
    }
  }
`;

// Eliminar producto
export const DELETE_PRODUCTO = gql`
  mutation DeleteProducto($id: ID!) {
    deleteProducto(id: $id) {
      id
    }
  }
`;
