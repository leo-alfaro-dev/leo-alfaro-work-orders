import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditWorkOrder } from './add-edit-work-order';

describe('AddEditWorkOrder', () => {
  let component: AddEditWorkOrder;
  let fixture: ComponentFixture<AddEditWorkOrder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddEditWorkOrder]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEditWorkOrder);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
