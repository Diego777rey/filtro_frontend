import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioventasComponent } from './formularioventas.component';

describe('FormularioventasComponent', () => {
  let component: FormularioventasComponent;
  let fixture: ComponentFixture<FormularioventasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormularioventasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormularioventasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
