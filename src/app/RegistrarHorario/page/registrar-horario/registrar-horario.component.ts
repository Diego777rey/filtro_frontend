import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HorarioService } from '../../components/horario.service';
import { VendedorService } from '../../../vendedor/components/vendedor.service';
import { Horario } from '../../components/horario';
import { Vendedor } from '../../../vendedor/components/vendedor';
import { Subject, takeUntil, catchError, of } from 'rxjs';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-registrar-horario',
  templateUrl: './registrar-horario.component.html',
  styleUrls: ['./registrar-horario.component.scss'],
  animations: [
    trigger('slideInOut', [
      state('in', style({
        transform: 'translateY(0)',
        opacity: 1
      })),
      state('out', style({
        transform: 'translateY(-100%)',
        opacity: 0
      })),
      transition('out => in', animate('300ms ease-in')),
      transition('in => out', animate('300ms ease-out'))
    ])
  ]
})
export class RegistrarHorarioComponent implements OnInit, OnDestroy {
  titulo = 'Horario';
  private destroy$ = new Subject<void>();

  formGroup!: FormGroup;
  isEdit = false;
  horarioId: number | null = null;
  vendedores: Vendedor[] = [];
  vendedorSeleccionado: Vendedor | null = null;
  loading = false;
  formEnabled = false; // controla habilitación de inputs

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private horarioService: HorarioService,
    private vendedorService: VendedorService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadVendedores();
    this.checkEditMode();
    this.initCampos();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initCampos(): void {
    const fechaActual = new Date();
    const horaActual = this.getCurrentTime();
    this.formGroup = this.fb.group({
      fechaHora: [{ value: fechaActual, disabled: !this.formEnabled }, Validators.required],
      hora: [{ value: horaActual, disabled: !this.formEnabled }, Validators.required],
      horarios: [{ value: '', disabled: !this.formEnabled }, Validators.required],
      vendedorId: [{ value: '', disabled: !this.formEnabled }, Validators.required]
    });
  }

  private getCurrentTime(): string {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  getDisplayDateTime(): Date {
    return this.formGroup.get('fechaHora')?.value || new Date();
  }

  private combineDateTime(fecha: Date, hora: string): string {
    const [hours, minutes] = hora.split(':');
    const combinedDate = new Date(fecha);
    combinedDate.setHours(parseInt(hours), parseInt(minutes));
    
    return combinedDate.toISOString().slice(0, 16); // Formato YYYY-MM-DDTHH:MM
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.horarioId = Number(id);
      this.loadHorario(this.horarioId);
      this.formEnabled = true; // si es edición, habilitamos el formulario
    } else {
      // Si no es edición, el formulario permanece deshabilitado hasta presionar "Nuevo"
      this.formEnabled = false;
    }
    // Actualizar el estado de los controles después de determinar el modo
    setTimeout(() => {
      this.updateFormControlsState();
    });
  }

  loadVendedores(): void {
    this.loading = true;
    this.vendedorService.getAll()
      .pipe(takeUntil(this.destroy$), catchError((error) => {
        console.error('Error al cargar vendedores:', error);
        return of([]);
      }))
      .subscribe(data => {
        this.vendedores = data || [];
        this.loading = false;
        // Actualizar el estado del control vendedorId después de cargar los datos
        this.updateFormControlsState();
      });
  }

  loadHorario(id: number): void {
    this.loading = true;
    this.horarioService.getById(id)
      .pipe(takeUntil(this.destroy$), catchError(() => of(null)))
      .subscribe((data: Horario | null) => {
        if (data) {
          const fechaDate = new Date(data.fechaHora);
          const horaTime = `${String(fechaDate.getHours()).padStart(2, '0')}:${String(fechaDate.getMinutes()).padStart(2, '0')}`;
          this.formGroup.patchValue({
            fechaHora: fechaDate,
            hora: horaTime,
            horarios: data.horarios,
            vendedorId: data.vendedor.id
          });
          // Buscar el vendedor completo en la lista cargada
          this.vendedorSeleccionado = this.vendedores.find(v => v.id === data.vendedor.id) || null;
        }
        this.loading = false;
      });
  }

  // -------------------
  // Eventos botones
  // -------------------
  nuevo(): void {
    this.formGroup.reset();
    this.vendedorSeleccionado = null;
    this.formEnabled = true;
    // Establecer la fecha y hora actual al crear un nuevo horario
    const fechaActual = new Date();
    const horaActual = this.getCurrentTime();
    this.formGroup.patchValue({
      fechaHora: fechaActual,
      hora: horaActual
    });
    this.updateFormControlsState();
  }

  cancelar(): void {
    this.formGroup.reset();
    this.vendedorSeleccionado = null;
    // Mantener la fecha y hora actual al cancelar
    const fechaActual = new Date();
    const horaActual = this.getCurrentTime();
    this.formGroup.patchValue({
      fechaHora: fechaActual,
      hora: horaActual
    });
    // Deshabilitar el formulario después de cancelar
    this.formEnabled = false;
    this.updateFormControlsState();
    if (this.isEdit) {
      this.router.navigate(['dashboard/horario']);
    }
  }

  private updateFormControlsState(): void {
    if (this.formEnabled) {
      this.formGroup.get('fechaHora')?.enable();
      this.formGroup.get('hora')?.enable();
      this.formGroup.get('horarios')?.enable();
      this.formGroup.get('vendedorId')?.enable();
    } else {
      this.formGroup.get('fechaHora')?.disable();
      this.formGroup.get('hora')?.disable();
      this.formGroup.get('horarios')?.disable();
      this.formGroup.get('vendedorId')?.disable();
    }
  }

  onDateChange(event: any): void {
    if (event.value) {
      const selectedDate = event.value as Date;
      const currentTime = this.formGroup.get('hora')?.value || this.getCurrentTime();
      const [hours, minutes] = currentTime.split(':');
      
      // Crear nueva fecha con la hora seleccionada
      const newDate = new Date(selectedDate);
      newDate.setHours(parseInt(hours), parseInt(minutes));
      
      this.formGroup.get('fechaHora')?.setValue(newDate);
    }
  }

  onTimeChange(event: any): void {
    const selectedTime = event.target.value;
    const currentDate = this.formGroup.get('fechaHora')?.value || new Date();
    const [hours, minutes] = selectedTime.split(':');
    
    // Crear nueva fecha con la hora seleccionada
    const newDate = new Date(currentDate);
    newDate.setHours(parseInt(hours), parseInt(minutes));
    
    this.formGroup.get('fechaHora')?.setValue(newDate);
  }

  // -------------------
  // Método para manejar selección de vendedor
  // -------------------
  onVendedorSeleccionado(vendedor: Vendedor | null): void {
    this.vendedorSeleccionado = vendedor;
    if (vendedor) {
      this.formGroup.patchValue({ vendedorId: vendedor.id });
    } else {
      this.formGroup.patchValue({ vendedorId: '' });
    }
  }

  guardar(): void {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      this.snackBar.open('Por favor, complete todos los campos obligatorios correctamente', 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    // Verificar si los vendedores se han cargado
    if (this.vendedores.length === 0) {
      this.snackBar.open('Error: No hay vendedores disponibles. Por favor, recarga la página.', 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    // Validación básica de campos obligatorios
    const formValue = this.formGroup.value;
    if (!formValue.fechaHora || !(formValue.fechaHora instanceof Date)) {
      this.snackBar.open('Error: La fecha y hora son obligatorias', 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      return;
    }
    
    // Verificar que se haya seleccionado un vendedor
    if (!formValue.vendedorId) {
      this.snackBar.open('Error: Debe seleccionar un vendedor', 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      return;
    }
    
    // Buscar el vendedor seleccionado
    const vendedorSeleccionado = this.vendedores.find(v => v.id == formValue.vendedorId);
    
    if (!vendedorSeleccionado) {
      this.snackBar.open('Error: No se encontró el vendedor seleccionado', 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    try {
      // Combinar fecha y hora
      const fechaHoraCompleta = this.combineDateTime(formValue.fechaHora, formValue.hora);
      
      const horario = new Horario({
        fechaHora: fechaHoraCompleta,
        horarios: formValue.horarios,
        vendedor: vendedorSeleccionado
      });

      const horarioDto = horario.toDto();

      const obs$ = this.isEdit && this.horarioId
        ? this.horarioService.update(this.horarioId, horarioDto)
        : this.horarioService.create(horarioDto);

      this.loading = true;
      obs$.pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          console.error('Error al guardar horario:', error);
          this.loading = false;
          
          // Manejar errores específicos
          let mensajeError = 'Error al guardar el horario';
          
          if (error.message && error.message.includes('llave duplicada')) {
            mensajeError = 'Ya existe un horario con esos datos. Por favor, verifica la información.';
          } else if (error.message && error.message.includes('constraint')) {
            mensajeError = 'Error de validación: Ya existe un horario con esos datos.';
          } else if (error.message) {
            mensajeError = 'Error al guardar el horario: ' + error.message;
          }
          
          this.snackBar.open(mensajeError, 'Cerrar', {
            duration: 7000,
            panelClass: ['error-snackbar']
          });
          return of(null);
        })
      ).subscribe((result) => {
        if (result) {
          this.loading = false;
          this.formEnabled = false;
          this.updateFormControlsState();
          this.snackBar.open('Horario guardado exitosamente', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['dashboard/horario']);
        }
      });
    } catch (error) {
      console.error('Error al crear el horario:', error);
      this.loading = false;
      this.snackBar.open('Error al crear el horario: ' + (error as Error).message, 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  }
}
