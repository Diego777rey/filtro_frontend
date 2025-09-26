import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormulariovendedorComponent } from './formulariovendedor.component';

describe('FormulariovendedorComponent', () => {
  let component: FormulariovendedorComponent;
  let fixture: ComponentFixture<FormulariovendedorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormulariovendedorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormulariovendedorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
