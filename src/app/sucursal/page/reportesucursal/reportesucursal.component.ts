import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SucursalReporteService } from '../../components/sucursal.reporte.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reportesucursal',
  templateUrl: './reportesucursal.component.html',
  styleUrls: ['./reportesucursal.component.scss']
})
export class ReporteSucursalComponent implements OnInit, OnDestroy {
  reporteForm: FormGroup;
  isLoading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private sucursalReporteService: SucursalReporteService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar, 
    private router: Router
  ) {
    this.reporteForm = this.fb.group({
      nombre: ['']
    });
  }

  ngOnInit(): void {
    // No se necesitan validaciones adicionales para sucursales
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  volver(){
    this.router.navigate(['dashboard/sucursal']);
  }

  descargarReporte(): void {
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;
    const formValue = this.reporteForm.value;
    
    this.sucursalReporteService.descargar(formValue.nombre)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.showPdfInBrowser(res, 'reporte-sucursales.pdf');
          this.showSuccessMessage('Reporte generado exitosamente. Se abrirá en una nueva pestaña.');
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error al generar el reporte', err);
          this.showErrorMessage('Error al generar el reporte. Intente nuevamente.');
          this.isLoading = false;
        }
      });
  }

  private showPdfInBrowser(blob: Blob, filename: string): void {
    // Crear URL del blob
    const url = window.URL.createObjectURL(blob);
    
    // Abrir PDF en nueva pestaña
    const newWindow = window.open(url, '_blank');
    
    // Verificar si se pudo abrir la ventana
    if (!newWindow) {
      // Si no se puede abrir (popup bloqueado), mostrar mensaje y descargar directamente
      this.showErrorMessage('No se pudo abrir el PDF. Descargando directamente...');
      this.downloadFile(blob, filename);
      return;
    }
    
    // Configurar la nueva ventana
    newWindow.document.title = filename;
    
    // Limpiar la URL después de un tiempo para liberar memoria
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 10000);
    
    // Agregar botón de descarga en la nueva ventana
    newWindow.addEventListener('load', () => {
      const downloadBtn = newWindow.document.createElement('button');
      downloadBtn.innerHTML = '📥 Descargar PDF';
      downloadBtn.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        z-index: 9999;
        background: #1976d2;
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 14px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
      `;
      
      downloadBtn.addEventListener('click', () => {
        this.downloadFile(blob, filename);
      });
      
      newWindow.document.body.appendChild(downloadBtn);
    });
  }

  private downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  private showSuccessMessage(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showErrorMessage(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  limpiarFiltros(): void {
    this.reporteForm.reset();
  }
}
