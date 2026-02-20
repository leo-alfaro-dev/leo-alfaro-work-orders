import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusLabel } from './status-label';

describe('StatusLabel', () => {
  let component: StatusLabel;
  let fixture: ComponentFixture<StatusLabel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusLabel],
    }).compileComponents();

    fixture = TestBed.createComponent(StatusLabel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
