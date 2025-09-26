import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuscadorVendedorComponent } from './buscador-vendedor.component';

describe('BuscadorVendedorComponent', () => {
  let component: BuscadorVendedorComponent;
  let fixture: ComponentFixture<BuscadorVendedorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BuscadorVendedorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BuscadorVendedorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
