import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { signal } from '@angular/core';
import { WorkOrderColumn } from '@models/work-order-column';
import { WorkOrderDocument } from '@models/work-order-document';
import { WorkFlowService } from '@features/work-flow/services/work-flow/work-flow.service';
import { workOrderDateRangeValidator } from './work-order-date-range.validator';
import { workOrderOverlapValidator } from './work-order-overlap.validator';

describe('Work order validators', () => {
  let service: WorkFlowService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkFlowService);
  });

  it('flags end dates before start dates', () => {
    const form = new FormGroup({
      startDate: new FormControl('2025-05-10'),
      endDate: new FormControl('2025-05-09'),
    });

    const result = workOrderDateRangeValidator(form);
    expect(result).toEqual({ dateRange: true });
  });

  it('allows end dates on or after start dates', () => {
    const form = new FormGroup({
      startDate: new FormControl('2025-05-10'),
      endDate: new FormControl('2025-05-10'),
    });

    const result = workOrderDateRangeValidator(form);
    expect(result).toBeNull();
  });

  it('flags overlaps within the same work center', () => {
    const columns: WorkOrderColumn[] = [
      { headerText: 'May 1 2025', startDate: new Date('2025-05-01T00:00:00.000Z'), isCurrent: false },
      { headerText: 'May 2 2025', startDate: new Date('2025-05-02T00:00:00.000Z'), isCurrent: false },
    ];
    (service as unknown as { columns: ReturnType<typeof signal<WorkOrderColumn[]>> }).columns =
      signal(columns);

    service.workCenters.set([{ docId: 'wc-1' }]);
    const existing: WorkOrderDocument = {
      docId: 'wo-1',
      docType: 'workOrder',
      data: {
        name: 'Existing',
        workCenterId: 'wc-1',
        status: 'open',
        startDate: '2025-05-01T00:00:00.000Z',
        endDate: '2025-05-02T00:00:00.000Z',
      },
    };
    service.workOrders.set([existing]);
    service.addEditWorkCenterDocId.set('wc-1');
    service.addEditWorkOrder.set(null);

    const form = new FormGroup({
      startDate: new FormControl('2025-05-01'),
      endDate: new FormControl('2025-05-02'),
    });

    const result = workOrderOverlapValidator(service)(form);
    expect(result).toEqual({ dateOverlap: true });
  });

  it('allows non-overlapping dates', () => {
    const columns: WorkOrderColumn[] = [
      { headerText: 'May 1 2025', startDate: new Date('2025-05-01T00:00:00.000Z'), isCurrent: false },
      { headerText: 'May 2 2025', startDate: new Date('2025-05-02T00:00:00.000Z'), isCurrent: false },
    ];
    (service as unknown as { columns: ReturnType<typeof signal<WorkOrderColumn[]>> }).columns =
      signal(columns);

    service.workCenters.set([{ docId: 'wc-1' }]);
    const existing: WorkOrderDocument = {
      docId: 'wo-1',
      docType: 'workOrder',
      data: {
        name: 'Existing',
        workCenterId: 'wc-1',
        status: 'open',
        startDate: '2025-05-01T00:00:00.000Z',
        endDate: '2025-05-02T00:00:00.000Z',
      },
    };
    service.workOrders.set([existing]);
    service.addEditWorkCenterDocId.set('wc-1');
    service.addEditWorkOrder.set(null);

    const form = new FormGroup({
      startDate: new FormControl('2025-05-03'),
      endDate: new FormControl('2025-05-04'),
    });

    const result = workOrderOverlapValidator(service)(form);
    expect(result).toBeNull();
  });
});
