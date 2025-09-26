export interface CampoClienteFormulario {
    control: string;                                // Nombre del FormControl
    label: string;                                  // Etiqueta visible
    tipo: 'text' | 'number' | 'select' | 'multiselect' | 'checkbox' | 'date'; // Tipo de campo
    opciones?: { value: any; label: string }[];     // Solo para select
    placeholder?: string;                           // Opcional
    requerido?: boolean;                            // Opcional
  }
