import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { AuthService } from '../../../core/guards/auth.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { UsuariodialogComponent } from 'src/app/reutilizacion/usuariodialog/usuariodialog.component';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TabService } from '../../../core/services/tab.service';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  requiredRole?: string;
}

interface SubMenuItem {
  id: string;
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  
  readonly showToggle = true;
  readonly selectedDate: Date | null = null;
  isFuncionariosExpanded = false;
  isAdminUser = false;
  userTooltip = '';
  userAvatarColor = '';
  userAvatarIcon = '';
  userFullName = '';
  isCollapsed = true; // Menú colapsado por defecto (solo iconos)

  readonly funcionariosSubMenu: SubMenuItem[] = [
    { id: 'personas', label: 'Personas', icon: 'person', route: '/dashboard/personas' },
    { id: 'cajero', label: 'Cajero', icon: 'account_balance_wallet', route: '/dashboard/cajero' },
    { id: 'vendedor', label: 'Vendedor', icon: 'store', route: '/dashboard/vendedor' },
    { id: 'deposito', label: 'Deposito', icon: 'warehouse', route: '/dashboard/deposito' }
  ];

  constructor(
    public readonly authService: AuthService, 
    private readonly router: Router, 
    private readonly dialog: MatDialog,
    private readonly cdr: ChangeDetectorRef,
    private readonly tabService: TabService,
    private readonly elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    // Cache all user-related data to avoid repeated calls
    this.isAdminUser = this.authService.isAdmin();
    this.cacheUserData();
    
    // Inicializar el servicio de pestañas
    this.tabService.getTabs();
    
    // Comentado: Escuchar cambios de navegación para cerrar submenú cuando sea necesario
    // this.router.events
    //   .pipe(
    //     filter(event => event instanceof NavigationEnd),
    //     takeUntil(this.destroy$)
    //   )
    //   .subscribe((event) => {
    //     this.handleNavigationChange((event as NavigationEnd).url);
    //   });
  }

  private cacheUserData(): void {
    const usuario = this.authService.getUsuario();
    this.userTooltip = `Usuario: ${usuario?.nombre || 'Usuario'}`;
    this.userAvatarColor = this.authService.getAvatarColorByRole();
    this.userAvatarIcon = this.authService.getAvatarByRole();
    
    // Obtener nombre completo del usuario
    if (usuario?.persona) {
      this.userFullName = `${usuario.persona.nombre} ${usuario.persona.apellido}`.trim();
    } else if (usuario?.nombre) {
      this.userFullName = usuario.nombre;
    } else {
      this.userFullName = 'Usuario';
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get isAdmin(): boolean {
    return this.isAdminUser;
  }

  onToggleChanged(event: MatCheckboxChange): void {
    // Handle toggle change if needed
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleFuncionarios(event?: Event): void {
    event?.stopPropagation();
    this.isFuncionariosExpanded = !this.isFuncionariosExpanded;
    
    // Si el menú está colapsado, expandirlo al abrir funcionarios
    if (this.isFuncionariosExpanded && this.isCollapsed) {
      this.isCollapsed = false;
    }
    
    this.cdr.markForCheck();
  }

  closeFuncionariosSubmenu(): void {
    this.isFuncionariosExpanded = false;
    this.cdr.markForCheck();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    // Solo cerrar si el submenú está abierto
    if (!this.isFuncionariosExpanded) {
      return;
    }

    // Verificar si el clic fue dentro del componente del menú
    const clickedInside = this.elementRef.nativeElement.contains(event.target as Node);
    
    if (!clickedInside) {
      this.isFuncionariosExpanded = false;
      this.cdr.markForCheck();
    }
  }


  abrirDialog(): void {
    const usuario = this.authService.getUsuario();
    const rolUsuario = usuario?.rol ?? 'Sin rol asignado';
    const nombreUsuario = usuario?.nombre ?? 'Usuario';

    this.dialog.open(UsuariodialogComponent, {
      width: '350px',
      data: { 
        rol: rolUsuario,
        nombre: nombreUsuario
      }
    });
  }

  expandMenu(): void {
    // Solo expandir si está colapsado y el mouse entra al menú
    if (this.isCollapsed) {
      this.isCollapsed = false;
      this.cdr.markForCheck();
    }
  }

  collapseMenu(): void {
    // Este método ya no se usa automáticamente, solo se mantiene para compatibilidad
    // El menú solo se cierra con el botón de hamburguesa
  }

  toggleMenu(): void {
    this.isCollapsed = !this.isCollapsed;
    if (this.isCollapsed) {
      this.isFuncionariosExpanded = false;
    }
    this.cdr.markForCheck();
  }
}
