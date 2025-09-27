import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovimientosCajaComponent } from './movimientos-caja.component';

describe('MovimientosCajaComponent', () => {
  let component: MovimientosCajaComponent;
  let fixture: ComponentFixture<MovimientosCajaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MovimientosCajaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MovimientosCajaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
