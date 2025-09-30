import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioCajeroComponent } from './formulario-cajero.component';

describe('FormularioCajeroComponent', () => {
  let component: FormularioCajeroComponent;
  let fixture: ComponentFixture<FormularioCajeroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormularioCajeroComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormularioCajeroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
