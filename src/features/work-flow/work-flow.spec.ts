import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkFlow } from '@features/work-flow/work-flow';

describe('WorkFlow', () => {
  let component: WorkFlow;
  let fixture: ComponentFixture<WorkFlow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkFlow]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkFlow);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
