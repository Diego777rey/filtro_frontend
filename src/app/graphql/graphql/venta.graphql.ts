import gql from 'graphql-tag';

export const VENTAS_QUERY = gql`
  query {
    ventas {
      id
      fecha
      tipoPago
      cliente {
        id
        nombre
        documento
      }
      vendedor {
        id
        nombre
        documento
      }
      items {
        id
        cantidad
        precio
        subtotal
        producto {
          id
          descripcion
          precioVenta
        }
      }
    }
  }
`;

export const VENTA_BY_ID_QUERY = gql`
  query Venta($id: ID!) {
    venta(id: $id) {
      id
      fecha
      tipoPago
      cliente {
        id
        nombre
        documento
        email
      }
      vendedor {
        id
        nombre
        documento
        email
      }
      items {
        id
        cantidad
        precio
        subtotal
        producto {
          id
          descripcion
          precioVenta
          stock
        }
      }
    }
  }
`;

export const CREAR_VENTA_MUTATION = gql`
  mutation CrearVenta($input: InputVenta!) {
    crearVenta(input: $input) {
      id
      fecha
      tipoPago
      cliente {
        id
        nombre
      }
      vendedor {
        id
        nombre
      }
      items {
        id
        cantidad
        precio
        subtotal
        producto {
          id
          descripcion
        }
      }
    }
  }
`;

export const ACTUALIZAR_VENTA_MUTATION = gql`
  mutation ActualizarVenta($id: ID!, $input: InputVenta!) {
    actualizarVenta(id: $id, input: $input) {
      id
      fecha
      tipoPago
      cliente {
        id
        nombre
      }
      vendedor {
        id
        nombre
      }
      items {
        id
        cantidad
        precio
        subtotal
        producto {
          id
          descripcion
        }
      }
    }
  }
`;

export const ELIMINAR_VENTA_MUTATION = gql`
  mutation EliminarVenta($id: ID!) {
    eliminarVenta(id: $id)
  }
`;