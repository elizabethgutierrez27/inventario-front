import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerproductosComponent } from './verproductos.component';

describe('VerproductosComponent', () => {
  let component: VerproductosComponent;
  let fixture: ComponentFixture<VerproductosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VerproductosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VerproductosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
