import { gql } from "apollo-angular";

// Obtener todos los horarios
export const GET_HORARIOS = gql`
  query GetAllRegistrarHorarios {
    findAllRegistrarHorarios {
      id
      fechaHora
      horarios
      vendedor {
        id
        nombre
      }
    }
  }
`;

// Obtener un horario por ID
export const GET_HORARIO_BY_ID = gql`
  query GetRegistrarHorarioById($id: ID!) {
    findRegistrarHorarioById(id: $id) {
      id
      fechaHora
      horarios
      vendedor {
        id
        nombre
      }
    }
  }
`;

// Obtener horarios por vendedor
export const GET_HORARIOS_POR_VENDEDOR = gql`
  query GetRegistrarHorariosPorVendedor($vendedorId: ID!) {
    findRegistrarHorariosPorVendedor(vendedorId: $vendedorId) {
      id
      fechaHora
      horarios
      vendedor {
        id
        nombre
      }
    }
  }
`;

// Paginación de horarios
export const GET_HORARIOS_PAGINADOS = gql`
  query GetRegistrarHorariosPaginated($page: Int!, $size: Int!) {
    findRegistrarHorariosPaginated(page: $page, size: $size) {
      items {
        id
        fechaHora
        horarios
        vendedor {
          id
          nombre
        }
      }
      totalItems
      totalPages
      currentPage
    }
  }
`;
// Crear horario
export const CREATE_HORARIO = gql`
  mutation CreateRegistrarHorario($inputRegistrarHorario: InputRegistrarHorario!) {
    createRegistrarHorario(inputRegistrarHorario: $inputRegistrarHorario) {
      id
      fechaHora
      horarios
      vendedor {
        id
        nombre
      }
    }
  }
`;


// Actualizar horario
export const UPDATE_HORARIO = gql`
  mutation UpdateRegistrarHorario($id: ID!, $inputRegistrarHorario: InputRegistrarHorario!) {
    updateRegistrarHorario(id: $id, inputRegistrarHorario: $inputRegistrarHorario) {
      id
      fechaHora
      horarios
      vendedor {
        id
        nombre
      }
    }
  }
`;

export const DELETE_HORARIO = gql`
  mutation DeleteRegistrarHorario($id: ID!) {
    deleteRegistrarHorario(id: $id)
  }
`;
