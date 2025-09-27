import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CajaService } from '../../components/caja.service';
import { Caja } from '../../components/caja';
import { Subject, takeUntil, catchError, of } from 'rxjs';
import { CampoFormulario } from 'src/app/reutilizacion/formulario-generico/campo.formulario';

@Component({
  selector: 'app-formulario-caja',
  templateUrl: './formulario-caja.component.html',
  styleUrls: ['./formulario-caja.component.scss']
})
export class FormularioCajaComponent implements OnInit, OnDestroy {
  titulo = 'Caja';
  private destroy$ = new Subject<void>();

  formGroup: FormGroup;
  campos: CampoFormulario[] = [];
  isEdit = false;
  cajaId: number | null = null;
  loading = false;
  formEnabled = false; // controla habilitación de inputs

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private cajaService: CajaService
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
      { control: 'codigoCaja', label: 'Código de Caja', tipo: 'text', placeholder: 'Ingrese código de la caja', requerido: true },
      { control: 'descripcion', label: 'Descripción', tipo: 'text', placeholder: 'Ingrese descripción de la caja', requerido: true },
      { control: 'ubicacion', label: 'Ubicación', tipo: 'text', placeholder: 'Ingrese ubicación de la caja', requerido: true },
      { control: 'estadoCaja', label: 'Estado', tipo: 'select', placeholder: 'Seleccione estado', requerido: true, opciones: [
        { value: 'ACTIVO', label: 'Activo' },
        { value: 'INACTIVO', label: 'Inactivo' }
      ]},
      { control: 'saldoInicial', label: 'Saldo Inicial', tipo: 'number', placeholder: 'Ingrese saldo inicial', requerido: true },
      { control: 'saldoActual', label: 'Saldo Actual', tipo: 'number', placeholder: 'Ingrese saldo actual', requerido: true }
    ];

    // Crear los FormControls
    this.campos.forEach(campo => {
      const validators = campo.requerido ? [Validators.required] : [];
      this.formGroup.addControl(campo.control, this.fb.control('', validators));
    });
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.cajaId = Number(id);
      this.loadCaja(this.cajaId);
      this.formEnabled = true; // si es edición, habilitamos el formulario
    }
  }

  loadCaja(id: number): void {
    this.loading = true;
    this.cajaService.getById(id)
      .pipe(takeUntil(this.destroy$), catchError(() => of(null)))
      .subscribe((data: Caja | null) => {
        if (data) {
          this.formGroup.patchValue({
            codigoCaja: data.codigoCaja,
            descripcion: data.descripcion,
            ubicacion: data.ubicacion,
            estadoCaja: data.estadoCaja,
            saldoInicial: data.saldoInicial,
            saldoActual: data.saldoActual
          });
        }
        this.loading = false;
      });
  }

  // -------------------
  // Eventos botones
  // -------------------
  nuevo(): void {
    this.formGroup.reset();
    this.formEnabled = true;
  }

  cancelar(): void {
    this.formGroup.reset();
    this.formEnabled = false;
  }

  volver(): void {
    this.router.navigate(['dashboard/caja']);
  }

  guardar(): void {
    if (this.formGroup.invalid) return;

    const formValue = this.formGroup.value;
    const caja: Caja = {
      codigoCaja: formValue.codigoCaja,
      descripcion: formValue.descripcion,
      ubicacion: formValue.ubicacion,
      estadoCaja: formValue.estadoCaja,
      saldoInicial: formValue.saldoInicial,
      saldoActual: formValue.saldoActual
    };

    const obs$ = this.isEdit && this.cajaId
      ? this.cajaService.update(this.cajaId, caja)
      : this.cajaService.create(caja);

    this.loading = true;
    obs$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.loading = false;
      this.formEnabled = false;
      this.router.navigate(['dashboard/caja']);
    });
  }
}
