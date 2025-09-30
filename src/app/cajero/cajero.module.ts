import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CajeroRoutingModule } from './cajero-routing.module';
import { CajeroComponent } from './page/cajero/cajero.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { MenuModule } from "src/app/menu/menu.module"; // Removido para evitar dependencias circulares
import { ReutilizacionModule } from 'src/app/reutilizacion/reutilizacion.module';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginatorModule } from '@angular/material/paginator';
import { FormularioCajeroComponent } from './page/formulario-cajero/formulario-cajero.component';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { ReporteCajeroComponent } from './page/reporte-cajero/reporte-cajero.component';
@NgModule({
  declarations: [CajeroComponent, FormularioCajeroComponent, ReporteCajeroComponent],
  imports: [
    CommonModule,
    CajeroRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    // MenuModule, // Removido para evitar dependencias circulares
    ReutilizacionModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatPaginatorModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
]
})
export class CajeroModule { }
