export interface CampoDepositoFormulario {
  control: string;
  label: string;
  tipo: 'text' | 'number' | 'email' | 'date' | 'select' | 'multiselect' | 'checkbox';
  placeholder?: string;
  requerido: boolean;
  opciones?: { value: any; label: string }[];
}
