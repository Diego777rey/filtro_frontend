import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ClienteService } from '../../components/cliente.service';
import { Cliente } from '../../components/cliente';
import { Subject, takeUntil, catchError, of } from 'rxjs';
import { CampoClienteFormulario } from './campo-cliente.formulario';

// Definir la interfaz Persona local para evitar conflictos
export interface Persona {
  id?: number;
  nombre: string;
  apellido: string;
  documento: string;
  telefono: string;
  email: string;
  direccion?: string;
  estadoPersona?: string;
  fechaNacimiento?: string;
  roles?: Array<{
    id?: number;
    tipoPersona: string;
  }>;
}

@Component({
  selector: 'app-formulariocliente',
  templateUrl: './formulariocliente.component.html',
  styleUrls: ['./formulariocliente.component.scss']
})
export class FormularioclienteComponent implements OnInit, OnDestroy {
  titulo = 'Cliente';
  private destroy$ = new Subject<void>();

  formGroup: FormGroup;
  campos: CampoClienteFormulario[] = [];
  isEdit = false;
  clienteId: number | null = null;
  loading = false;
  formEnabled = false; // controla habilitación de inputs
  personaSeleccionada: Persona | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private clienteService: ClienteService,
    private snackBar: MatSnackBar
  ) {
    this.formGroup = this.fb.group({});//aca inicializo el formulario que luego se llena con los campos
  }

  ngOnInit(): void {
    this.checkEditMode();//determinamos si estamos editando
    this.initCampos();//aca definimos los campos del formulario y los validamos
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initCampos(): void {//aca inicializamos los campos del formulario según el esquema GraphQL
    this.campos = [
      { control: 'codigoCliente', label: 'Código Cliente', tipo: 'text', placeholder: 'Ingrese código cliente', requerido: true },
      { control: 'fechaRegistro', label: 'Fecha de Registro', tipo: 'date', placeholder: 'Seleccione fecha', requerido: true }
    ];

    // Crear los FormControls - habilitados si estamos en modo edición
    this.campos.forEach(campo => {
      const validators = campo.requerido ? [Validators.required] : [];
      if (campo.control === 'email') {
        validators.push(Validators.email);
      }
      const disabled = !this.isEdit; // Habilitar si estamos editando
      
      // Establecer valor por defecto para fechaRegistro
      let defaultValue: any = '';
      if (campo.control === 'fechaRegistro') {
        defaultValue = new Date(); // Fecha actual
      }
      
      this.formGroup.addControl(campo.control, this.fb.control({value: defaultValue, disabled: disabled}, validators));
    });
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.clienteId = Number(id);
      this.loadCliente(this.clienteId);
      this.formEnabled = true; // si es edición, habilitamos el formulario
      this.formGroup.enable();
    }
  }

  loadCliente(id: number): void {
    this.loading = true;
    this.clienteService.getById(id)
      .pipe(takeUntil(this.destroy$), catchError(() => of(null)))
      .subscribe((data: Cliente | null) => {
        if (data) {
          this.formGroup.patchValue({
            codigoCliente: data.codigoCliente,
            fechaRegistro: data.fechaRegistro
          });
          // Establecer la persona seleccionada con conversión de tipos
          this.personaSeleccionada = this.convertirPersona(data.persona);
        }
        this.loading = false;
      });
  }

  // -------------------
  // Eventos botones
  // -------------------
  nuevo(): void {
    this.formGroup.reset({ 
      activo: true,
      fechaRegistro: new Date() // Establecer fecha actual por defecto
    });
    this.personaSeleccionada = null;
    this.formEnabled = true;
    this.formGroup.enable();
  }

  cancelar(): void {
    this.formGroup.reset();
    this.personaSeleccionada = null;
    this.formEnabled = false;
    this.formGroup.disable();
  }

  volver(): void {
    this.router.navigate(['dashboard/clientes']);
  }

  onPersonaSeleccionada(persona: Persona | null): void {
    this.personaSeleccionada = persona;
  }

  // Método para convertir persona del servicio a la interfaz local
  private convertirPersona(personaFromService: any): Persona {
    return {
      id: personaFromService.id ? parseInt(personaFromService.id) : undefined,
      nombre: personaFromService.nombre,
      apellido: personaFromService.apellido,
      documento: personaFromService.documento,
      telefono: personaFromService.telefono,
      email: personaFromService.email,
      direccion: personaFromService.direccion,
      estadoPersona: personaFromService.estadoPersona,
      fechaNacimiento: personaFromService.fechaNacimiento,
      roles: personaFromService.roles?.map((role: any) => ({
        id: role.id ? parseInt(role.id) : undefined,
        tipoPersona: role.tipoPersona
      }))
    };
  }

  guardar(): void {
    if (this.formGroup.invalid) {
      console.error('Formulario inválido:', this.formGroup.errors);
      this.formGroup.markAllAsTouched();
      this.snackBar.open('Por favor, complete todos los campos obligatorios correctamente', 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    if (!this.personaSeleccionada) {
      this.snackBar.open('Error: Debe seleccionar una persona', 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    try {
      const formValue = this.formGroup.value;
      const clienteData = {
        codigoCliente: formValue.codigoCliente,
        fechaRegistro: formValue.fechaRegistro,
        personaId: this.personaSeleccionada.id
      };

      const obs$ = this.isEdit && this.clienteId
        ? this.clienteService.updateClienteWithPersona(this.clienteId, clienteData)
        : this.clienteService.createClienteWithPersona(clienteData);

      this.loading = true;
      obs$.pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          console.error('Error al guardar cliente:', error);
          this.loading = false;
          
          // Manejar errores específicos
          let mensajeError = 'Error al guardar el cliente';
          
          if (error.message && error.message.includes('llave duplicada')) {
            mensajeError = 'Ya existe un cliente con ese documento o email. Por favor, verifique los datos.';
          } else if (error.message && error.message.includes('constraint')) {
            mensajeError = 'Error de validación: Ya existe un cliente con esos datos.';
          } else if (error.message) {
            mensajeError = 'Error al guardar el cliente: ' + error.message;
          }
          
          this.snackBar.open(mensajeError, 'Cerrar', {
            duration: 7000,
            panelClass: ['error-snackbar']
          });
          return of(null);
        })
      ).subscribe((result) => {
        if (result) {
          // Cliente guardado exitosamente
          this.loading = false;
          this.formEnabled = false;
          this.formGroup.disable();
          this.snackBar.open('Cliente guardado exitosamente', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['dashboard/clientes']);
        }
      });
    } catch (error) {
      console.error('Error al crear el cliente:', error);
      this.loading = false;
      this.snackBar.open('Error al crear el cliente: ' + (error as Error).message, 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  }
}
