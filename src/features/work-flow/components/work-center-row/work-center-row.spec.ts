import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkCenterRow } from '@features/work-flow/components/work-center-row/work-center-row';

describe('WorkCenterRow', () => {
  let component: WorkCenterRow;
  let fixture: ComponentFixture<WorkCenterRow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkCenterRow]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkCenterRow);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
