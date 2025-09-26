import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioproductoComponent } from './formularioproducto.component';

describe('FormularioproductoComponent', () => {
  let component: FormularioproductoComponent;
  let fixture: ComponentFixture<FormularioproductoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormularioproductoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormularioproductoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
