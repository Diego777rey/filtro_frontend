import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagNotfountComponent } from './pag-notfount.component';

describe('PagNotfountComponent', () => {
  let component: PagNotfountComponent;
  let fixture: ComponentFixture<PagNotfountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PagNotfountComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PagNotfountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
