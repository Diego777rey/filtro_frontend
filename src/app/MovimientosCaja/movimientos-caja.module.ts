import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';

import { MovimientosCajaRoutingModule } from './movimientos-caja-routing.module';
import { MovimientosCajaComponent } from './page/movimientos-caja/movimientos-caja.component';
import { FormularioMovimientosComponent } from './page/formulario-movimientos/formulario-movimientos.component';
import { VentasPendientesComponent } from './page/ventas-pendientes/ventas-pendientes.component';

// Importar módulos reutilizables
import { ReutilizacionModule } from '../reutilizacion/reutilizacion.module';
import { GraphQLModule } from '../graphql.module';

@NgModule({
  declarations: [
    MovimientosCajaComponent,
    FormularioMovimientosComponent,
    VentasPendientesComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MovimientosCajaRoutingModule,
    GraphQLModule,
    ReutilizacionModule,
    
    // Material Modules
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatSnackBarModule,
    MatDialogModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatChipsModule
  ]
})
export class MovimientosCajaModule { }
