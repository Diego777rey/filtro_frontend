import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormulariosucursalComponent } from './formulariosucursal.component';

describe('FormulariosucursalComponent', () => {
  let component: FormulariosucursalComponent;
  let fixture: ComponentFixture<FormulariosucursalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormulariosucursalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormulariosucursalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
