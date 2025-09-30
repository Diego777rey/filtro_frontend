import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-usuariodialog',
  templateUrl: './usuariodialog.component.html',
  styleUrls: ['./usuariodialog.component.scss']
})
export class UsuariodialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { rol: string; nombre?: string }) {}

  getAvatarIcon(): string {
    const rol = this.data.rol?.toUpperCase();
    
    switch (rol) {
      case 'ADMINISTRADOR':
        return 'admin_panel_settings';
      case 'Depositero':
        return 'person';
      case 'VENDEDOR':
        return 'storefront';
      case 'CLIENTE':
        return 'shopping_cart';
      case 'GERENTE':
        return 'supervisor_account';
      case 'EMPLEADO':
        return 'badge';
      case 'EDITOR':
        return 'edit';
      default:
        return 'person';
    }
  }

  getAvatarColor(): string {
    const rol = this.data.rol?.toUpperCase();
    
    switch (rol) {
      case 'ADMINISTRADOR':
        return 'primary';
      case 'USER':
        return 'primary';
      case 'VENDEDOR':
        return 'accent';
      case 'CLIENTE':
        return 'primary';
      case 'GERENTE':
        return 'warn';
      case 'EMPLEADO':
        return 'accent';
      case 'EDITOR':
        return 'primary';
      default:
        return 'primary';
    }
  }
}
