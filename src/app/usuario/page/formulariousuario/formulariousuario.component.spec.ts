import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormulariousuarioComponent } from './formulariousuario.component';

describe('FormulariousuarioComponent', () => {
  let component: FormulariousuarioComponent;
  let fixture: ComponentFixture<FormulariousuarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormulariousuarioComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormulariousuarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
