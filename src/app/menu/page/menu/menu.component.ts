import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/guards/auth.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { UsuariodialogComponent } from 'src/app/reutilizacion/usuariodialog/usuariodialog.component';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {
  //title = 'Dashboard';
  showToggle = true;
  selectedDate: Date | null = null;

  constructor(public authService: AuthService, private router: Router, private dialog: MatDialog) {}
  abrirDialog(): void {
    // Obtenemos el rol del usuario desde el AuthService
    const usuario = this.authService.getUsuario();
    const rolUsuario = usuario ? usuario.rol : 'Sin rol asignado';
    const nombreUsuario = usuario ? usuario.nombre : 'Usuario';

    this.dialog.open(UsuariodialogComponent, {
      width: '350px',
      data: { 
        rol: rolUsuario,
        nombre: nombreUsuario
      }
    });
  }

  ngOnInit(): void {
    // Componente inicializado
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }
  //para evitar usar el get isAdmin() se puede usar el metodo isAdmin() y dentro de el hacemos la misma logica evitando llamadas excesivas que afecten el rendimiento

  onToggleChanged(event: any) {
    this.showToggle = event.checked;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
