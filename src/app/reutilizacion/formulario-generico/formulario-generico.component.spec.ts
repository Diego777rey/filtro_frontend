import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioGenericoComponent } from './formulario-generico.component';

describe('FormularioGenericoComponent', () => {
  let component: FormularioGenericoComponent;
  let fixture: ComponentFixture<FormularioGenericoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormularioGenericoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormularioGenericoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
