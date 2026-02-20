import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { WorkOrderColumn } from '@models/work-order-column';
import { WorkOrderDocument } from '@models/work-order-document';
import { vi } from 'vitest';

import { WorkFlowService } from '@features/work-flow/services/work-flow/work-flow.service';

describe('WorkFlowService', () => {
  let service: WorkFlowService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkFlowService);
    if (!globalThis.localStorage) {
      Object.defineProperty(globalThis, 'localStorage', {
        value: {
          getItem: vi.fn(),
          setItem: vi.fn(),
          removeItem: vi.fn(),
          clear: vi.fn(),
        },
        configurable: true,
      });
    } else {
      globalThis.localStorage.clear();
    }
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('computes left and width in pixels from day durations', () => {
    service.timescale.set('day');

    const columns: WorkOrderColumn[] = [
      {
        headerText: 'May 15 2025',
        startDate: new Date('2025-05-15T00:00:00.000Z'),
        isCurrent: false,
      },
      {
        headerText: 'May 16 2025',
        startDate: new Date('2025-05-16T00:00:00.000Z'),
        isCurrent: false,
      },
      {
        headerText: 'May 17 2025',
        startDate: new Date('2025-05-17T00:00:00.000Z'),
        isCurrent: false,
      },
    ];
    (service as unknown as { columns: ReturnType<typeof signal<WorkOrderColumn[]>> }).columns =
      signal(columns);

    const workOrders: WorkOrderDocument[] = [
      {
        docId: 'wo-2',
        docType: 'work-order',
        data: {
          name: 'WO 2',
          workCenterId: 'wc-1',
          status: 'open',
          startDate: '2025-05-16T00:00:00.000Z',
          endDate: '2025-05-18T00:00:00.000Z',
        },
      },
      {
        docId: 'wo-1',
        docType: 'work-order',
        data: {
          name: 'WO 1',
          workCenterId: 'wc-1',
          status: 'in-progress',
          startDate: '2025-05-15T00:00:00.000Z',
          endDate: '2025-05-17T00:00:00.000Z',
        },
      },
    ];
    service.workOrders.set(workOrders);

    const results = service.getWorkOrdersToDisplayByWorkCenterDocId('wc-1');

    expect(results.length).toBe(2);
    expect(results[0].docId).toBe('wo-1');
    expect(results[0].leftSpanPx).toBeCloseTo(382, 6);
    expect(results[0].widthPx).toBeCloseTo(200, 6);
    expect(results[1].docId).toBe('wo-2');
    expect(results[1].leftSpanPx).toBeCloseTo(482, 6);
    expect(results[1].widthPx).toBeCloseTo(200, 6);
  });

  it('filters by work center and visible start-date range, and sorts by start date', () => {
    service.timescale.set('day');

    const columns: WorkOrderColumn[] = [
      {
        headerText: 'May 15 2025',
        startDate: new Date('2025-05-15T00:00:00.000Z'),
        isCurrent: false,
      },
      {
        headerText: 'May 16 2025',
        startDate: new Date('2025-05-16T00:00:00.000Z'),
        isCurrent: false,
      },
      {
        headerText: 'May 17 2025',
        startDate: new Date('2025-05-17T00:00:00.000Z'),
        isCurrent: false,
      },
    ];
    (service as unknown as { columns: ReturnType<typeof signal<WorkOrderColumn[]>> }).columns =
      signal(columns);

    service.workOrders.set([
      {
        docId: 'wrong-center',
        docType: 'work-order',
        data: {
          name: 'Wrong Center',
          workCenterId: 'wc-2',
          status: 'open',
          startDate: '2025-05-16T00:00:00.000Z',
          endDate: '2025-05-17T00:00:00.000Z',
        },
      },
      {
        docId: 'out-of-range',
        docType: 'work-order',
        data: {
          name: 'Out of Range',
          workCenterId: 'wc-1',
          status: 'open',
          startDate: '2025-05-14T00:00:00.000Z',
          endDate: '2025-05-16T00:00:00.000Z',
        },
      },
      {
        docId: 'later',
        docType: 'work-order',
        data: {
          name: 'Later',
          workCenterId: 'wc-1',
          status: 'open',
          startDate: '2025-05-17T00:00:00.000Z',
          endDate: '2025-05-18T00:00:00.000Z',
        },
      },
      {
        docId: 'earlier',
        docType: 'work-order',
        data: {
          name: 'Earlier',
          workCenterId: 'wc-1',
          status: 'open',
          startDate: '2025-05-15T00:00:00.000Z',
          endDate: '2025-05-16T00:00:00.000Z',
        },
      },
    ]);

    const results = service.getWorkOrdersToDisplayByWorkCenterDocId('wc-1');

    expect(results.map((wo) => wo.docId)).toEqual(['out-of-range', 'earlier', 'later']);
  });

  it('returns empty when no columns are available', () => {
    (service as unknown as { columns: ReturnType<typeof signal<WorkOrderColumn[]>> }).columns =
      signal([]);
    service.workOrders.set([
      {
        docId: 'wo-1',
        docType: 'work-order',
        data: {
          name: 'WO 1',
          workCenterId: 'wc-1',
          status: 'open',
          startDate: '2025-05-15T00:00:00.000Z',
          endDate: '2025-05-16T00:00:00.000Z',
        },
      },
    ]);

    const results = service.getWorkOrdersToDisplayByWorkCenterDocId('wc-1');

    expect(results).toEqual([]);
  });

  it('creates a work order and persists it', async () => {
    const saveSpy = vi.spyOn(
      service as unknown as { saveWorkOrders: (items: WorkOrderDocument[]) => void },
      'saveWorkOrders',
    );
    const initialLength = service.workOrders().length;

    const created = service.createWorkOrder({
      name: 'New WO',
      status: 'open',
      startDate: '2025-05-20T00:00:00.000Z',
      endDate: '2025-05-22T00:00:00.000Z',
      workCenterId: 'wc-1',
    });

    await Promise.resolve();

    expect(created.docId).toBeTruthy();
    expect(service.workOrders().length).toBe(initialLength + 1);
    expect(saveSpy).toHaveBeenCalled();
  });

  it('updates a work order and persists changes', async () => {
    const saveSpy = vi.spyOn(
      service as unknown as { saveWorkOrders: (items: WorkOrderDocument[]) => void },
      'saveWorkOrders',
    );
    const original: WorkOrderDocument = {
      docId: 'wo-100',
      docType: 'workOrder',
      data: {
        name: 'Original',
        workCenterId: 'wc-1',
        status: 'open',
        startDate: '2025-05-15T00:00:00.000Z',
        endDate: '2025-05-16T00:00:00.000Z',
      },
    };

    service.workOrders.set([original]);

    const updated = service.updateWorkOrder('wo-100', {
      name: 'Updated',
      status: 'complete',
      startDate: '2025-05-17T00:00:00.000Z',
      endDate: '2025-05-18T00:00:00.000Z',
      workCenterId: 'wc-1',
    });

    await Promise.resolve();

    const current = service.workOrders()[0];
    expect(updated).toBe(true);
    expect(current.data.name).toBe('Updated');
    expect(current.data.status).toBe('complete');
    expect(saveSpy).toHaveBeenCalled();
  });
});
