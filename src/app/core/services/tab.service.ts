import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { filter,} from 'rxjs/operators';

export interface Tab {
  id: string;
  title: string;
  route: string;
  icon?: string;
  isActive: boolean;
  canClose: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TabService {
  private tabsSubject = new BehaviorSubject<Tab[]>([]);
  private currentRouteSubject = new BehaviorSubject<string>('');
  
  public tabs$ = this.tabsSubject.asObservable();
  public currentRoute$ = this.currentRouteSubject.asObservable();

  // Mapeo de rutas a títulos e iconos
  private readonly routeConfig: Record<string, { title: string; icon?: string }> = {
    '/dashboard/movimientos-caja': { title: 'Movimientos de Caja', icon: 'account_balance' },
    '/dashboard/proveedor': { title: 'Proveedores', icon: 'local_shipping' },
    '/dashboard/personas': { title: 'Personas', icon: 'person' },
    '/dashboard/caja': { title: 'Caja', icon: 'account_balance_wallet' },
    '/dashboard/cajero': { title: 'Cajero', icon: 'point_of_sale' },
    '/dashboard/deposito': { title: 'Depósito', icon: 'warehouse' },
    '/dashboard/clientes': { title: 'Clientes', icon: 'people' },
    '/dashboard/usuario': { title: 'Usuarios', icon: 'admin_panel_settings' },
    '/dashboard/categoria': { title: 'Categorías', icon: 'category' },
    '/dashboard/vendedor': { title: 'Vendedores', icon: 'person_add' },
    '/dashboard/producto': { title: 'Productos', icon: 'inventory' },
    '/dashboard/ventas': { title: 'Ventas', icon: 'shopping_cart' },
    '/dashboard/horario': { title: 'Registro de Horarios', icon: 'schedule' },
    '/dashboard/sucursal': { title: 'Sucursales', icon: 'business' },
    '/dashboard/inventario': { title: 'Inventarios', icon: 'business' },
    '/dashboard/roles': {title: 'Roles', icon: 'business'}
  };

  constructor(private router: Router) {
    this.initializeRouteTracking();
  }

  private initializeRouteTracking(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event) => {
        const navigationEnd = event as NavigationEnd;
        this.currentRouteSubject.next(navigationEnd.url);
        this.handleRouteChange(navigationEnd.url);
      });
  }

  private handleRouteChange(url: string): void {
    const config = this.routeConfig[url];
    if (!config) return;

    const existingTab = this.findTabByRoute(url);
    
    if (existingTab) {
      // Activar pestaña existente
      this.activateTab(existingTab.id);
    } else {
      // Crear nueva pestaña
      this.addTab({
        id: this.generateTabId(url),
        title: config.title,
        route: url,
        icon: config.icon,
        isActive: true,
        canClose: true
      });
    }
  }

  private generateTabId(route: string): string {
    return route.replace(/[^a-zA-Z0-9]/g, '_');
  }

  private findTabByRoute(route: string): Tab | undefined {
    return this.tabsSubject.value.find(tab => tab.route === route);
  }

  private addTab(tab: Tab): void {
    const currentTabs = this.tabsSubject.value;
    
    // Desactivar todas las pestañas existentes
    const updatedTabs = currentTabs.map(t => ({ ...t, isActive: false }));
    
    // Agregar nueva pestaña
    updatedTabs.push(tab);
    
    this.tabsSubject.next(updatedTabs);
  }

  private activateTab(tabId: string): void {
    const currentTabs = this.tabsSubject.value;
    const updatedTabs = currentTabs.map(tab => ({
      ...tab,
      isActive: tab.id === tabId
    }));
    
    this.tabsSubject.next(updatedTabs);
  }

  public closeTab(tabId: string): void {
    const currentTabs = this.tabsSubject.value;
    const tabToClose = currentTabs.find(tab => tab.id === tabId);
    
    if (!tabToClose || !tabToClose.canClose) return;

    const updatedTabs = currentTabs.filter(tab => tab.id !== tabId);
    
    // Si se cerró la pestaña activa, activar otra pestaña o redirigir a bienvenido
    if (tabToClose.isActive) {
      if (updatedTabs.length > 0) {
        // Activar la última pestaña disponible
        const lastTab = updatedTabs[updatedTabs.length - 1];
        updatedTabs[updatedTabs.length - 1] = { ...lastTab, isActive: true };
        this.router.navigate([lastTab.route]);
      } else {
        // Si no quedan pestañas, redirigir al módulo de bienvenido
        this.router.navigate(['/dashboard/bienvenido']);
      }
    }
    
    this.tabsSubject.next(updatedTabs);
  }

  public closeAllTabs(): void {
    this.tabsSubject.next([]);
    this.router.navigate(['/dashboard/bienvenido']);
  }

  public getTabs(): Tab[] {
    return this.tabsSubject.value;
  }

  public getCurrentRoute(): string {
    return this.currentRouteSubject.value;
  }
}
