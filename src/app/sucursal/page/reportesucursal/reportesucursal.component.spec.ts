import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteSucursalComponent } from './reportesucursal.component';

describe('ReporteSucursalComponent', () => {
  let component: ReporteSucursalComponent;
  let fixture: ComponentFixture<ReporteSucursalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReporteSucursalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReporteSucursalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
