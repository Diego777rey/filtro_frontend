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

interface DropdownMenu {
  id: string;
  label: string;
  icon: string;
  isExpanded: boolean;
  subItems: SubMenuItem[];
}

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  
  readonly showToggle = true;
  readonly selectedDate: Date | null = null;
  isAdminUser = false;
  userTooltip = '';
  userAvatarColor = '';
  userAvatarIcon = '';
  userFullName = '';
  isCollapsed = true; // Menú colapsado por defecto (solo iconos)

  readonly dropdownMenus: DropdownMenu[] = [
    {
      id: 'funcionarios',
      label: 'Funcionarios',
      icon: 'business_center',
      isExpanded: false,
      subItems: [
        { id: 'personas', label: 'Personas', icon: 'person', route: '/dashboard/personas' },
        { id: 'cajero', label: 'Cajero', icon: 'account_balance_wallet', route: '/dashboard/cajero' },
        { id: 'vendedor', label: 'Vendedor', icon: 'store', route: '/dashboard/vendedor' },
        { id: 'deposito', label: 'Deposito', icon: 'warehouse', route: '/dashboard/deposito' }
      ]
    },
    {
      id: 'empresarial',
      label: 'Empresarial',
      icon: 'business',
      isExpanded: false,
      subItems: [
        { id: 'sucursales', label: 'Sucursales', icon: 'business', route: '/dashboard/sucursal' }
      ]
    }
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

  getDropdownById(id: string): DropdownMenu | undefined {
    return this.dropdownMenus.find(menu => menu.id === id);
  }

  isDropdownExpanded(id: string): boolean {
    const menu = this.getDropdownById(id);
    return menu?.isExpanded ?? false;
  }

  onToggleChanged(event: MatCheckboxChange): void {
    // Handle toggle change if needed
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleDropdown(menuId: string, event?: Event): void {
    event?.stopPropagation();
    
    const targetMenu = this.dropdownMenus.find(menu => menu.id === menuId);
    if (!targetMenu) return;
    
    const wasExpanded = targetMenu.isExpanded;
    
    // Cerrar todos los demás menús
    this.dropdownMenus.forEach(menu => {
      menu.isExpanded = false;
    });
    
    // Toggle el menú seleccionado solo si no estaba expandido
    targetMenu.isExpanded = !wasExpanded;
    
    // Si el menú está colapsado, expandirlo al abrir cualquier dropdown
    if (targetMenu.isExpanded && this.isCollapsed) {
      this.isCollapsed = false;
    }
    
    this.cdr.detectChanges();
  }

  closeAllDropdowns(): void {
    this.dropdownMenus.forEach(menu => {
      menu.isExpanded = false;
    });
    this.cdr.detectChanges();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    // Verificar si algún submenú está abierto
    const hasOpenDropdown = this.dropdownMenus.some(menu => menu.isExpanded);
    if (!hasOpenDropdown) {
      return;
    }

    // Verificar si el clic fue dentro del componente del menú
    const clickedInside = this.elementRef.nativeElement.contains(event.target as Node);
    
    if (!clickedInside) {
      this.closeAllDropdowns();
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
    // Solo expandir si está colapsado
    if (this.isCollapsed) {
      this.isCollapsed = false;
      this.cdr.detectChanges();
    }
  }

  collapseMenu(): void {
    // Este método ya no se usa automáticamente, solo se mantiene para compatibilidad
    // El menú solo se cierra con el botón de hamburguesa
  }

  toggleMenu(): void {
    this.isCollapsed = !this.isCollapsed;
    if (this.isCollapsed) {
      this.closeAllDropdowns();
    }
  }
}
