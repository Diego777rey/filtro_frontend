import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuarioService } from '../../components/usuario.service';
import { InputUsuario } from '../../components/input.usuario';
import { CampoFormulario } from 'src/app/reutilizacion/formulario-generico/campo.formulario';

@Component({
  selector: 'app-formulariousuario',
  templateUrl: './formulariousuario.component.html',
  styleUrls: ['./formulariousuario.component.scss']
})
export class FormulariousuarioComponent implements OnInit {
  titulo = 'Usuario';
  formGroup!: FormGroup;
  campos: CampoFormulario[] = [];
  isEdit = false;
  loading = false;
  formEnabled = false;

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.initForm();
    this.initCampos();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.isEdit = true;
        this.titulo = 'Editar Usuario';
        this.loadUsuario(id);
      } else {
        this.isEdit = false;
        this.titulo = 'Nuevo Usuario';
        this.formEnabled = false; // Inicialmente deshabilitado
      }
    });
  }

  private initForm(): void {
    this.formGroup = this.fb.group({
      nombre: [{value: '', disabled: true}, [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      apellido: [{value: '', disabled: true}, [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      contrasenha: [{value: '', disabled: true}, [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: [{value: '', disabled: true}, [Validators.required, Validators.email]],
      rol: [{value: '', disabled: true}, [Validators.required]]
    });
  }

  private initCampos(): void {
    this.campos = [
      { control: 'nombre', label: 'Nombre', tipo: 'text', placeholder: 'Ingrese el nombre del usuario', requerido: true },
      { control: 'apellido', label: 'Apellido', tipo: 'text', placeholder: 'Ingrese el apellido del usuario', requerido: true },
      { control: 'contrasenha', label: 'Contraseña', tipo: 'text', placeholder: 'Ingrese la contraseña', requerido: true },
      { control: 'email', label: 'Email', tipo: 'text', placeholder: 'Ingrese el email del usuario', requerido: true },
      { control: 'rol', label: 'Rol', tipo: 'select', placeholder: 'Seleccione el rol del usuario', requerido: true, opciones: [
        { label: 'Administrador', value: 'ADMINISTRADOR'},
        { label: 'Usuario', value: 'USUARIO'},
        { label: 'Editor', value: 'EDITOR' }
      ] }
    ];
  }

  private loadUsuario(id: string): void {
    this.loading = true;
    this.usuarioService.getById(+id).subscribe({
      next: (data) => {
        // Datos del usuario cargados
        this.formGroup.patchValue(data);
        this.enableForm();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar usuario:', err);
        this.loading = false;
        // Mostrar mensaje de error al usuario
        alert('Error al cargar los datos del usuario. Por favor, intente nuevamente.');
      }
    });
  }

  private enableForm(): void {
    this.formEnabled = true;
    this.formGroup.enable();
  }

  private disableForm(): void {
    this.formEnabled = false;
    this.formGroup.disable();
  }

  guardar(): void {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    this.loading = true;
    const formValue = this.formGroup.value;
    const usuario = new InputUsuario(formValue);

    const request = this.isEdit
      ? this.usuarioService.update(+this.route.snapshot.params['id'], usuario)
      : this.usuarioService.create(usuario);

    request.subscribe({
      next: (response) => {
        // Usuario guardado exitosamente
        this.loading = false;
        const mensaje = this.isEdit ? 'Usuario actualizado exitosamente' : 'Usuario creado exitosamente';
        alert(mensaje);
        this.router.navigate(['dashboard/usuario']);
      },
      error: (err) => {
        console.error('Error al guardar usuario:', err);
        this.loading = false;
        alert('Error al guardar el usuario. Por favor, intente nuevamente.');
      }
    });
  }

  cancelar(): void {
    this.formGroup.reset();
    this.disableForm();
    this.isEdit = false;
    this.titulo = 'Nuevo Usuario';
  }

  nuevo(): void {
    this.formGroup.reset();
    this.enableForm();
    this.isEdit = false;
    this.titulo = 'Nuevo Usuario';
    // Formulario habilitado para nuevo usuario
  }

  volver(): void {
    this.router.navigate(['dashboard/usuario']);
  }
}
