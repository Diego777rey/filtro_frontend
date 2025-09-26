import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormulariocategoriaComponent } from './formulariocategoria.component';

describe('FormulariocategoriaComponent', () => {
  let component: FormulariocategoriaComponent;
  let fixture: ComponentFixture<FormulariocategoriaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormulariocategoriaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormulariocategoriaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
