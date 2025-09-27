import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PersonaService } from '../../components/persona.service';
import { Persona } from '../../components/persona';
import { Subject, takeUntil, catchError, of } from 'rxjs';
import { CampoPersonaFormulario } from './campo-persona.formulario';

@Component({
  selector: 'app-formulario-persona',
  templateUrl: './formulario-persona.component.html',
  styleUrls: ['./formulario-persona.component.scss']
})
export class FormularioPersonaComponent implements OnInit, OnDestroy {
  titulo = 'Persona';
  private destroy$ = new Subject<void>();

  formGroup: FormGroup;
  campos: CampoPersonaFormulario[] = [];
  isEdit = false;
  personaId: string | null = null;
  loading = false;
  formEnabled = false; // controla habilitación de inputs

  // Mapeo de nombres de roles a IDs numéricos
  private rolMapping: { [key: string]: number } = {
    'CAJERO': 1,
    'VENDEDOR': 2,
    'PROVEEDOR': 3,
    'CLIENTE': 4,
    'DEPOSITERO': 5,
    'ADMINISTRADOR': 6
  };

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private personaService: PersonaService,
    private snackBar: MatSnackBar
  ) {
    this.formGroup = this.fb.group({});
  }

  ngOnInit(): void {
    this.checkEditMode();
    this.initCampos();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initCampos(): void {
    this.campos = [
      { control: 'nombre', label: 'Nombre', tipo: 'text', placeholder: 'Ingrese nombre', requerido: true },
      { control: 'apellido', label: 'Apellido', tipo: 'text', placeholder: 'Ingrese apellido', requerido: true },
      { control: 'documento', label: 'Documento', tipo: 'text', placeholder: 'Ingrese documento', requerido: true },
      { control: 'telefono', label: 'Teléfono', tipo: 'text', placeholder: 'Ingrese teléfono', requerido: true },
      { control: 'email', label: 'Email', tipo: 'text', placeholder: 'ejemplo@correo.com', requerido: true },
      { control: 'direccion', label: 'Dirección', tipo: 'text', placeholder: 'Ingrese dirección', requerido: false },
      { control: 'fechaNacimiento', label: 'Fecha de Nacimiento', tipo: 'date', placeholder: 'Seleccione fecha', requerido: false },
      { 
        control: 'estadoPersona', 
        label: 'Estado', 
        tipo: 'select', 
        placeholder: 'Seleccione estado', 
        requerido: true,
        opciones: [
          { value: 'ACTIVO', label: 'Activo' },
          { value: 'INACTIVO', label: 'Inactivo' }
        ]
      },
      { 
        control: 'rolIds', 
        label: 'Roles', 
        tipo: 'multiselect', 
        placeholder: 'Seleccione roles', 
        requerido: true,
        opciones: [
          { value: 'CAJERO', label: 'Cajero' },
          { value: 'VENDEDOR', label: 'Vendedor' },
          { value: 'PROVEEDOR', label: 'Proveedor' },
          { value: 'CLIENTE', label: 'Cliente' },
          { value: 'DEPOSITERO', label: 'Depositero' },
          { value: 'ADMINISTRADOR', label: 'Administrador' }
        ]
      }
    ];

    // Crear los FormControls - habilitados si estamos en modo edición
    this.campos.forEach(campo => {
      const validators = campo.requerido ? [Validators.required] : [];
      if (campo.control === 'email') {
        validators.push(Validators.email);
      }
      const disabled = !this.isEdit; // Habilitar si estamos editando
      
      // Establecer valor por defecto para fechaNacimiento, estadoPersona y rolIds
      let defaultValue: any = '';
      if (campo.control === 'fechaNacimiento') {
        defaultValue = new Date(); // Fecha actual
      } else if (campo.control === 'estadoPersona') {
        defaultValue = 'ACTIVO'; // Estado activo por defecto
      } else if (campo.control === 'rolIds') {
        defaultValue = []; // Array vacío para roles
      }
      
      this.formGroup.addControl(campo.control, this.fb.control({value: defaultValue, disabled: disabled}, validators));
    });
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.personaId = id;
      this.loadPersona(this.personaId);
      this.formEnabled = true; // si es edición, habilitamos el formulario
      this.formGroup.enable();
    }
  }

  loadPersona(id: string): void {
    this.loading = true;
    this.personaService.getById(id)
      .pipe(takeUntil(this.destroy$), catchError(() => of(null)))
      .subscribe((data: Persona | null) => {
        if (data) {
          // Extraer los nombres de roles existentes (ya vienen como strings del backend)
          const rolIds = data.roles ? data.roles.map(rol => rol.tipoPersona) : [];
          
          this.formGroup.patchValue({
            nombre: data.nombre,
            apellido: data.apellido,
            documento: data.documento,
            telefono: data.telefono,
            email: data.email,
            direccion: data.direccion,
            fechaNacimiento: data.fechaNacimiento,
            estadoPersona: data.estadoPersona,
            rolIds: rolIds
          });
        }
        this.loading = false;
      });
  }

  // -------------------
  // Eventos botones
  // -------------------
  nuevo(): void {
    this.formGroup.reset({ 
      estadoPersona: 'ACTIVO',
      fechaNacimiento: new Date(), // Establecer fecha actual por defecto
      rolIds: [] // Array vacío para roles
    });
    this.formEnabled = true;
    this.formGroup.enable();
  }

  cancelar(): void {
    this.formGroup.reset();
    this.formEnabled = false;
    this.formGroup.disable();
  }

  volver(): void {
    this.router.navigate(['dashboard/personas']);
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

    // Validación básica de campos obligatorios
    const formValue = this.formGroup.value;
    if (!formValue.nombre || formValue.nombre.trim().length === 0) {
      this.snackBar.open('Error: El nombre es obligatorio', 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    if (!formValue.apellido || formValue.apellido.trim().length === 0) {
      this.snackBar.open('Error: El apellido es obligatorio', 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    if (!formValue.email || formValue.email.trim().length === 0) {
      this.snackBar.open('Error: El email es obligatorio', 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    if (!formValue.rolIds || formValue.rolIds.length === 0) {
      this.snackBar.open('Error: Debe seleccionar al menos un rol', 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    try {
      // Convertir nombres de roles a IDs numéricos
      const rolIdsNumericos = formValue.rolIds.map((rolNombre: string) => this.rolMapping[rolNombre]);
      
      const personaData = {
        nombre: formValue.nombre,
        apellido: formValue.apellido,
        documento: formValue.documento,
        telefono: formValue.telefono,
        email: formValue.email,
        direccion: formValue.direccion,
        fechaNacimiento: formValue.fechaNacimiento,
        estadoPersona: formValue.estadoPersona,
        rolIds: rolIdsNumericos
      };

      const obs$ = this.isEdit && this.personaId
        ? this.personaService.update(this.personaId, personaData)
        : this.personaService.create(personaData);

      this.loading = true;
      obs$.pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          console.error('Error al guardar persona:', error);
          this.loading = false;
          
          // Manejar errores específicos
          let mensajeError = 'Error al guardar la persona';
          
          if (error.message && error.message.includes('llave duplicada')) {
            mensajeError = 'Ya existe una persona con ese documento o email. Por favor, verifique los datos.';
          } else if (error.message && error.message.includes('constraint')) {
            mensajeError = 'Error de validación: Ya existe una persona con esos datos.';
          } else if (error.message) {
            mensajeError = 'Error al guardar la persona: ' + error.message;
          }
          
          this.snackBar.open(mensajeError, 'Cerrar', {
            duration: 7000,
            panelClass: ['error-snackbar']
          });
          return of(null);
        })
      ).subscribe((result) => {
        if (result) {
          // Persona guardada exitosamente
          this.loading = false;
          this.formEnabled = false;
          this.formGroup.disable();
          this.snackBar.open('Persona guardada exitosamente', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['dashboard/personas']);
        }
      });
    } catch (error) {
      console.error('Error al crear la persona:', error);
      this.loading = false;
      this.snackBar.open('Error al crear la persona: ' + (error as Error).message, 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  }
}
