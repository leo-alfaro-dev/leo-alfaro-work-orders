import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkOrderBar } from './work-order-bar';

describe('WorkOrderBar', () => {
  let component: WorkOrderBar;
  let fixture: ComponentFixture<WorkOrderBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkOrderBar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkOrderBar);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('workCenterDocId', 'wc-1');
    fixture.componentRef.setInput('workOrder', {
      docId: 'wo-1',
      displayText: 'WO 1',
      status: 'open',
      leftSpanPx: 0,
      widthPx: 100,
      startDate: new Date('2025-05-15T00:00:00.000Z'),
      endDate: new Date('2025-05-16T00:00:00.000Z'),
      isDisplay: true,
    });
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
