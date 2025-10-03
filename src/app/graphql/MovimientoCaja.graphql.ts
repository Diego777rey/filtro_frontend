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
        codigoCaja
        descripcion
        ubicacion
        estadoCaja
        saldoInicial
        saldoActual
      }
      venta {
        id
        codigoVenta
        fechaVenta
        total
        tipoVenta
        estadoVenta
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
        codigoCaja
        descripcion
        ubicacion
        estadoCaja
        saldoInicial
        saldoActual
      }
      venta {
        id
        codigoVenta
        fechaVenta
        total
        tipoVenta
        estadoVenta
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
          codigoCaja
          descripcion
          ubicacion
          estadoCaja
          saldoInicial
          saldoActual
        }
        venta {
          id
          codigoVenta
          fechaVenta
          total
          tipoVenta
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
        codigoCaja
        descripcion
        ubicacion
        estadoCaja
        saldoInicial
        saldoActual
      }
      venta {
        id
        codigoVenta
        fechaVenta
        total
        tipoVenta
        estadoVenta
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
        codigoCaja
        descripcion
        ubicacion
        estadoCaja
        saldoInicial
        saldoActual
      }
      venta {
        id
        codigoVenta
        fechaVenta
        total
        tipoVenta
        estadoVenta
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
        codigoCaja
        descripcion
        ubicacion
        estadoCaja
        saldoInicial
        saldoActual
      }
      venta {
        id
        codigoVenta
        fechaVenta
        total
        tipoVenta
        estadoVenta
      }
    }
  }
`;

export const CANCELAR_VENTA = gql`
  mutation CancelarVenta($ventaId: ID!) {
    cancelarVenta(ventaId: $ventaId) {
      id
      codigoVenta
      fechaVenta
      total
      tipoVenta
    }
  }
`;

// Consulta para obtener todas las ventas y filtrar las pendientes en el cliente
export const GET_VENTAS_PENDIENTES = gql`
  query GetVentasPendientes {
    findAllVentas {
      id
      codigoVenta
      fechaVenta
      total
      tipoVenta
      caja {
        id
        codigoCaja
      }
      cliente {
        id
        codigoCliente
        persona {
          id
          nombre
          apellido
          documento
          telefono
          email
        }
      }
      vendedor {
        id
        persona {
          id
          nombre
          apellido
        }
      }
      detalles {
        id
        cantidad
        precioUnitario
        descuento
        subtotal
        producto {
          id
          nombre
          precioVenta
        }
      }
    }
  }
`;
