import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioMovimientosComponent } from './formulario-movimientos.component';

describe('FormularioMovimientosComponent', () => {
  let component: FormularioMovimientosComponent;
  let fixture: ComponentFixture<FormularioMovimientosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormularioMovimientosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormularioMovimientosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
