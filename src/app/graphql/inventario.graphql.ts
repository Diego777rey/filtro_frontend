import { gql } from "apollo-angular";

// ----------------------------- QUERIES -----------------------------

// Obtener todos los productos
export const GET_INVENTARIOS = gql`
  query GetAllInventarios {
    findAllInventarios {
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
      sucursal {
        id
        nombre
        pais
        departamento
        ciudad
        direccion
        telefono
      }
    }
  }
`;

// Obtener producto por ID
export const GET_INVENTARIOS_BY_ID = gql`
  query GetInventarioById($inventarioId: ID!) {
    findInventarioById(inventarioId: $inventarioId) {
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
      sucursal {
        id
        nombre
        pais
        departamento
        ciudad
        direccion
        telefono
      }
    }
  }
`;

// Obtener productos paginados
export const GET_INVENTARIOS_PAGINADOS = gql`
  query GetInventariosPaginated($page: Int!, $size: Int!, $search: String) {
    findInventariosPaginated(page: $page, size: $size, search: $search) {
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
        sucursal {
        id
        nombre
        pais
        departamento
        ciudad
        direccion
        telefono
      }
      }
      totalItems
      totalPages
      currentPage
      itemsCount
    }
  }
`;
// Crear producto
export const CREATE_INVENTARIO = gql`
  mutation CreateInventario($input: InputInventario!) {
    createInventario(inputInventario: $input) {
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
      sucursal {
        id
        nombre
        pais
        departamento
        ciudad
        direccion
        telefono
      }
    }
  }
`;

// Actualizar producto
export const UPDATE_INVENTARIO = gql`
  mutation UpdateInventario($id: ID!, $input: InputInventario!) {
    updateInventario(id: $id, inputInventario: $input) {
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
      sucursal {
        id
        nombre
        pais
        departamento
        ciudad
        direccion
        telefono
      }
    }
  }
`;

// Eliminar producto
export const DELETE_INVENTARIO = gql`
  mutation DeleteInventario($id: ID!) {
    deleteInventario(id: $id) {
      id
    }
  }
`;
