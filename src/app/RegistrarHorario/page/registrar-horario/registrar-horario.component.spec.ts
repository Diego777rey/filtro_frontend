import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrarHorarioComponent } from './registrar-horario.component';

describe('RegistrarHorarioComponent', () => {
  let component: RegistrarHorarioComponent;
  let fixture: ComponentFixture<RegistrarHorarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegistrarHorarioComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistrarHorarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
