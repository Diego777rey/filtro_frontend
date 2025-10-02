import { gql } from "apollo-angular";
export const GET_MOVIMIENTOS_CAJA = gql`
  query GetAllMovimientosCaja {
    findAllMovimientosCaja {
      id
      monto
      tipo
      fecha
      descripcion
      caja {
        id
        nombre
      }
      venta {
        id
        total
        estado
      }
    }
  }
`;

export const GET_MOVIMIENTO_CAJA_BY_ID = gql`
  query GetMovimientoCajaById($id: ID!) {
    findMovinmientoCajaById(movimientoId: $id) {
      id
      monto
      tipo
      fecha
      descripcion
      caja {
        id
        nombre
      }
      venta {
        id
        total
        estado
      }
    }
  }
`;

export const GET_MOVIMIENTOS_CAJA_PAGINADOS = gql`
  query GetMovimientosCajaPaginated($page: Int!, $size: Int!, $search: String) {
    findMovimientosCajaPaginated(page: $page, size: $size, search: $search) {
      items {
        id
        monto
        tipo
        fecha
        descripcion
        caja {
          id
          nombre
        }
        venta {
          id
          total
          estado
        }
      }
      totalItems
      totalPages
      currentPage
      itemsCount
    }
  }
`;

export const CREATE_MOVIMIENTO_CAJA = gql`
  mutation CreateMovimientoCaja($input: InputMovimientoCaja!) {
    createMovimientoCaja(inputMovimientoCaja: $input) {
      id
      monto
      tipo
      fecha
      descripcion
      caja {
        id
        nombre
      }
      venta {
        id
        total
        estado
      }
    }
  }
`;

export const UPDATE_MOVIMIENTO_CAJA = gql`
  mutation UpdateMovimientoCaja($id: ID!, $input: InputMovimientoCaja!) {
    updateMovimientoCaja(id: $id, inputMovimientoCaja: $input) {
      id
      monto
      tipo
      fecha
      descripcion
      caja {
        id
        nombre
      }
      venta {
        id
        total
        estado
      }
    }
  }
`;

export const DELETE_MOVIMIENTO_CAJA = gql`
  mutation DeleteMovimientoCaja($id: ID!) {
    deleteMovimientoCaja(id: $id) {
      id
    }
  }
`;

export const ACEPTAR_VENTA = gql`
  mutation AceptarVenta($ventaId: ID!) {
    aceptarVenta(ventaId: $ventaId) {
      id
      monto
      tipo
      fecha
      descripcion
      caja {
        id
        nombre
      }
      venta {
        id
        total
        estado
      }
    }
  }
`;

export const CANCELAR_VENTA = gql`
  mutation CancelarVenta($ventaId: ID!) {
    cancelarVenta(ventaId: $ventaId) {
      id
      total
      estado
    }
  }
`;

// Nueva consulta para obtener ventas pendientes de aprobación
export const GET_VENTAS_PENDIENTES = gql`
  query GetVentasPendientes($cajaId: ID!) {
    findVentasPendientesByCaja(cajaId: $cajaId) {
      id
      total
      estado
      cliente {
        id
        nombre
        apellido
      }
      vendedor {
        id
        nombre
        apellido
      }
      items {
        id
        cantidad
        precio
        producto {
          id
          nombre
        }
      }
    }
  }
`;
