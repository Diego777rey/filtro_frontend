import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportevendedorComponent } from './reportevendedor.component';

describe('ReportevendedorComponent', () => {
  let component: ReportevendedorComponent;
  let fixture: ComponentFixture<ReportevendedorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportevendedorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportevendedorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
