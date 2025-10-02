import { gql } from "apollo-angular";

// ==================== Queries ====================

// Obtener todas las ventas
export const GET_VENTAS = gql`
  query GetAllVentas {
    findAllVentas {
      id
      codigoVenta
      fechaVenta
      total
      tipoVenta
      estadoVenta
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
        codigoVendedor
        persona {
          id
          nombre
          apellido
        }
      }
      cajero {
        id
        codigoCajero
      }
      caja {
        id
        codigoCaja
      }
      factura {
        id
        numero
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

// Obtener venta por ID
export const GET_VENTA_BY_ID = gql`
  query GetVentaById($id: ID!) {
    findVentaById(ventaId: $id) {
      id
      codigoVenta
      fechaVenta
      total
      tipoVenta
      estadoVenta
      cliente {
        id
        codigoCliente
        persona {
          id
          nombre
          apellido
        }
      }
      vendedor {
        id
        codigoVendedor
        persona {
          id
          nombre
          apellido
        }
      }
      cajero {
        id
        codigoCajero
      }
      caja {
        id
        codigoCaja
      }
      factura {
        id
        numero
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

// Obtener ventas paginadas
export const GET_VENTAS_PAGINADAS = gql`
  query GetVentasPaginated($page: Int!, $size: Int!, $search: String) {
    findVentasPaginated(page: $page, size: $size, search: $search) {
      items {
        id
        codigoVenta
        fechaVenta
        total
        tipoVenta
        estadoVenta
        cliente {
          id
          codigoCliente
          persona {
            id
            nombre
            apellido
          }
        }
        vendedor {
          id
          nombre
        }
        cajero {
          id
          codigoCajero
        }
        caja {
          id
          codigoCaja
        }
        detalles {
          id
          cantidad
          precioUnitario
          subtotal
          producto {
            id
            nombre
            precio
          }
        }
      }
      totalItems
      totalPages
      currentPage
    }
  }
`;

// ==================== Mutations ====================

// Crear venta
export const CREATE_VENTA = gql`
  mutation CreateVenta($input: InputVenta!) {
    createVenta(input: $input) {
      id
      codigoVenta
      fechaVenta
      total
      tipoVenta
      estadoVenta
      cliente {
        id
        codigoCliente
        persona {
          id
          nombre
          apellido
        }
      }
      vendedor {
        id
        codigoVendedor
        persona {
          id
          nombre
          apellido
        }
      }
      cajero {
        id
        codigoCajero
      }
      caja {
        id
        codigoCaja
      }
      detalles {
        id
        cantidad
        precioUnitario
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

// Actualizar venta
export const UPDATE_VENTA = gql`
  mutation UpdateVenta($id: ID!, $input: InputVenta!) {
    updateVenta(ventaId: $id, input: $input) {
      id
      codigoVenta
      fechaVenta
      total
      tipoVenta
      estadoVenta
    }
  }
`;

// Eliminar venta
export const DELETE_VENTA = gql`
  mutation DeleteVenta($id: ID!) {
    deleteVenta(ventaId: $id)
  }
`;

// Actualizar estado de venta
export const UPDATE_VENTA_STATUS = gql`
  mutation UpdateVentaStatus($id: ID!, $estado: EstadoVenta!) {
    updateVentaStatus(id: $id, estado: $estado) {
      id
      estadoVenta
    }
  }
`;
