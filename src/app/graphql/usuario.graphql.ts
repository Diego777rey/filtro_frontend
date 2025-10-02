import { gql } from "apollo-angular";

// --- Query para obtener todos los usuarios ---
export const GET_USUARIOS = gql`
  query GetAllUsuarios {
    findAllUsuarios {
      id
      contrasenha
      persona {
        id
        nombre
        apellido
        email
      }
      roles {
        id
        tipoPersona
      }
    }
  }
`;

// --- Query para usuarios paginados ---
export const GET_USUARIOS_PAGINADOS = gql`
  query GetUsuariosPaginated($page: Int!, $size: Int!, $search: String) {
    findUsuariosPaginated(page: $page, size: $size, search: $search) {
      items {
        id
        contrasenha
        persona {
          id
          nombre
          apellido
          email
        }
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

// --- Query para un usuario por ID ---
export const GET_USUARIO_BY_ID = gql`
  query GetUsuarioById($id: ID!) {
    findUsuarioById(id: $id) {
      id
      contrasenha
      persona {
        id
        nombre
        apellido
        email
      }
      roles {
        id
        tipoPersona
      }
    }
  }
`;

// --- Mutations de usuario ---

export const CREATE_USUARIO = gql`
  mutation CreateUsuario($input: UsuarioInput!) {
    crearUsuario(input: $input) {
      id
      contrasenha
      persona {
        id
        nombre
        apellido
        email
      }
      roles {
        id
        tipoPersona
      }
    }
  }
`;

export const UPDATE_USUARIO = gql`
  mutation UpdateUsuario($id: ID!, $input: UsuarioInput!) {
    actualizarUsuario(id: $id, input: $input) {
      id
      contrasenha
      persona {
        id
        nombre
        apellido
        email
      }
      roles {
        id
        tipoPersona
      }
    }
  }
`;

export const DELETE_USUARIO = gql`
  mutation DeleteUsuario($id: ID!) {
    eliminarUsuario(id: $id) {
      id
    }
  }
`;

export const LOGIN_USUARIO = gql`
  mutation LoginUsuario($nombre: String!, $contrasenha: String!) {
    login(nombre: $nombre, contrasenha: $contrasenha) {
      usuario {
        id
        contrasenha
        persona {
          id
          nombre
          apellido
          email
        }
        roles {
          id
          tipoPersona
        }
      }
      token
    }
  }
`;

// Mutación alternativa que podría incluir token si tu backend lo soporta
export const LOGIN_USUARIO_WITH_TOKEN = gql`
  mutation LoginUsuarioWithToken($nombre: String!, $contrasenha: String!) {
    login(nombre: $nombre, contrasenha: $contrasenha) {
      token
      usuario {
        id
        contrasenha
        persona {
          id
          nombre
          apellido
          email
        }
        roles {
          id
          tipoPersona
        }
      }
    }
  }
`;


