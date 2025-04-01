import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultipleSrjfComponent } from './multiple-srjf.component';

describe('MultipleSrjfComponent', () => {
  let component: MultipleSrjfComponent;
  let fixture: ComponentFixture<MultipleSrjfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MultipleSrjfComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MultipleSrjfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
