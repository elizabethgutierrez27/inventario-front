import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BarrapersonalComponent } from './barrapersonal.component';

describe('BarrapersonalComponent', () => {
  let component: BarrapersonalComponent;
  let fixture: ComponentFixture<BarrapersonalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BarrapersonalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BarrapersonalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
