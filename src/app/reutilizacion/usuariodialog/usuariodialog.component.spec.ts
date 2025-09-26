import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsuariodialogComponent } from './usuariodialog.component';

describe('UsuariodialogComponent', () => {
  let component: UsuariodialogComponent;
  let fixture: ComponentFixture<UsuariodialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UsuariodialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsuariodialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
