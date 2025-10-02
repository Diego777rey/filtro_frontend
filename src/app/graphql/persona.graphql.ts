import { gql } from "apollo-angular";

export const GET_PERSONAS = gql`
  query GetAllPersonas {
    findAllPersonas {
      id
      nombre
      apellido
      direccion
      telefono
      email
      documento
      estadoPersona
      fechaNacimiento
      roles {
        id
        tipoPersona
      }
    }
  }
`;

export const GET_PERSONA_BY_ID = gql`
  query GetPersonaById($id: ID!) {
    findPersonaById(personaId: $id) {
      id
      nombre
      apellido
      direccion
      telefono
      email
      documento
      estadoPersona
      fechaNacimiento
      roles {
        id
        tipoPersona
      }
    }
  }
`;

export const GET_PERSONAS_PAGINADAS = gql`
  query GetPersonasPaginated($page: Int!, $size: Int!, $search: String) {
    findPersonasPaginated(page: $page, size: $size, search: $search) {
      items {
        id
        nombre
        apellido
        direccion
        telefono
        email
        documento
        estadoPersona
        fechaNacimiento
        roles {
          id
          tipoPersona
        }
      }
      totalItems
      totalPages
      currentPage
    }
  }
`;

//////////////////////////////
// MUTATIONS PERSONA
//////////////////////////////
export const CREATE_PERSONA = gql`
  mutation CreatePersona($input: InputPersona!) {
    createPersona(inputPersona: $input) {
      id
      nombre
      apellido
      direccion
      telefono
      email
      documento
      estadoPersona
      fechaNacimiento
      roles {
        id
        tipoPersona
      }
    }
  }
`;

export const UPDATE_PERSONA = gql`
  mutation UpdatePersona($id: ID!, $input: InputPersona!) {
    updatePersona(id: $id, inputPersona: $input) {
      id
      nombre
      apellido
      direccion
      telefono
      email
      documento
      estadoPersona
      fechaNacimiento
      roles {
        id
        tipoPersona
      }
    }
  }
`;

export const DELETE_PERSONA = gql`
  mutation DeletePersona($id: ID!) {
    deletePersona(id: $id) {
      id
    }
  }
`;