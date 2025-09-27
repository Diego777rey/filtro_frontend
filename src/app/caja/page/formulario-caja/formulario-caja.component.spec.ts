import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioCajaComponent } from './formulario-caja.component';

describe('FormularioCajaComponent', () => {
  let component: FormularioCajaComponent;
  let fixture: ComponentFixture<FormularioCajaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormularioCajaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormularioCajaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
