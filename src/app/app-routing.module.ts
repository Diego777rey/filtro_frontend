import { NgModule } from '@angular/core';
import { RouterModule, Routes, PreloadAllModules } from '@angular/router';
import { MenuComponent } from './menu/page/menu/menu.component';
import { AuthGuard } from './core/guards/auth.guard';
import { AdminGuard } from './core/guards/admin.guard';

const routes: Routes = [
  // Ruta pública
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then(m => m.LoginModule)
  },
  // Redirección por defecto
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  // Rutas protegidas
  {
    path: 'dashboard',
    component: MenuComponent,
    canActivate: [AuthGuard],         // protege acceso al componente Menu
    canActivateChild: [AuthGuard],    // protege todas las rutas hijas
    children: [
      { path: '', redirectTo: 'bienvenido', pathMatch: 'full' },
      {
        path: 'bienvenido',
        loadChildren: () => import('./bienvenido/bienvenido.module').then(m => m.BienvenidoModule)
      },
      {
        path: 'clientes',
        loadChildren: () => import('./cliente/cliente.module').then(m => m.ClienteModule)
      },
      {
        path: 'usuario',
        loadChildren: () => import('./usuario/usuario.module').then(m => m.UsuarioModule),
        canActivate: [AdminGuard]
      },
      {
        path: 'categoria',
        loadChildren: () => import('./categoria/categoria.module').then(m => m.CategoriaModule)
      },
      {
        path: 'vendedor',
        loadChildren: () => import('./vendedor/vendedor.module').then(m => m.VendedorModule)
      },
      {
        path: 'producto',
        loadChildren: () => import('./producto/producto.module').then(m => m.ProductoModule)
      },
      {
        path: 'ventas',
        loadChildren: () => import('./venta/ventas.module').then(m => m.VentasModule)
      },
      {
        path: 'horario',
        loadChildren: () => import('./RegistrarHorario/registrar-horario.module').then(m => m.RegistrarHorarioModule)
      }
    ]
  },
  // Ruta comodín: redirige cualquier URL desconocida
  {
    path: '**',
    redirectTo: '/login'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules, // optimiza la carga perezosa
      scrollPositionRestoration: 'enabled'
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
