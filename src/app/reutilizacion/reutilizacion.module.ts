import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DatePipe, CurrencyPipe } from '@angular/common';

// Importar componentes
import { BuscadorComponent } from './buscador/buscador.component';
import { TablaPaginadaComponent } from './tabla-paginada/tabla-paginada.component';
import { AccionesComponent } from './acciones/acciones.component';
import { FormularioGenericoComponent } from './formulario-generico/formulario-generico.component';
import { UsuariodialogComponent } from './usuariodialog/usuariodialog.component';
import { BuscadorVendedorComponent } from './buscador-vendedor/buscador-vendedor.component';
import { BuscadorClienteComponent } from './buscador-cliente/buscador-cliente.component';
import { BuscadorCategoriaComponent } from './buscador-categoria/buscador-categoria.component';
import { BuscadorProductoComponent } from './buscador-producto/buscador-producto.component';
import { BuscadorPersonaComponent } from './buscador-persona/buscador-persona.component';
import { BuscadorProveedorComponent } from './buscador-proveedor/buscador-proveedor.component';
import { TabComponent } from './tab/tab.component';
import { TabContainerComponent } from './tab-container/tab-container.component';

@NgModule({
  declarations: [
    BuscadorComponent,
    TablaPaginadaComponent,
    AccionesComponent,
    FormularioGenericoComponent,
    UsuariodialogComponent,
    BuscadorVendedorComponent,
    BuscadorClienteComponent,
    BuscadorCategoriaComponent,
    BuscadorProductoComponent,
    BuscadorPersonaComponent,
    BuscadorProveedorComponent,
    TabComponent,
    TabContainerComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatOptionModule,
    MatSelectModule,
    MatDialogModule,
    MatMenuModule,
    MatTooltipModule,
    MatListModule,
    MatCardModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
  ],
  providers: [
    DatePipe,
    CurrencyPipe
  ],
  exports: [
    BuscadorComponent,
    TablaPaginadaComponent,
    AccionesComponent,
    FormularioGenericoComponent,
    BuscadorVendedorComponent,
    BuscadorClienteComponent,
    BuscadorCategoriaComponent,
    BuscadorProductoComponent,
    BuscadorPersonaComponent,
    BuscadorProveedorComponent,
    TabComponent,
    TabContainerComponent
  ]
})
export class ReutilizacionModule { }