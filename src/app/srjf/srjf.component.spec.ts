import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SrjfComponent } from './srjf.component';

describe('SrjfComponent', () => {
  let component: SrjfComponent;
  let fixture: ComponentFixture<SrjfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SrjfComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SrjfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
