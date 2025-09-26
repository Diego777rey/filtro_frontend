import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioclienteComponent } from './formulariocliente.component';

describe('FormularioclienteComponent', () => {
  let component: FormularioclienteComponent;
  let fixture: ComponentFixture<FormularioclienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormularioclienteComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormularioclienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
