import { WorkOrderColumn } from '@models/work-order-column';
import { DropdownOption } from '@models/dropdown-option';
import { WorkOrderDocument } from '@models/work-order-document';
import { WorkCenterDocument } from '@models/work-center-document';
import workOrdersData from '@data/work-order-documents.json';
import workCentersData from '@data/work-center-documents.json';
import { WorkOrderDisplay } from '@models/work-order-display';
import { Timescale } from '@models/timescale';
import { computed, effect, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { WorkOrderStatus } from '@models/work-order-status';

@Injectable({
  providedIn: 'root',
})
export class WorkFlowService {
  private readonly workOrdersStorageKey = 'work-orders';
  // consts
  defaultTotalColumns = 100;
  totalColumns = signal<number>(this.defaultTotalColumns);
  startOffset = signal<number>(-Math.floor(this.defaultTotalColumns / 2));
  columnWidthPx = 100;
  workCenterColumnWidthPx = 382;
  unitDurationMs = 24 * 60 * 60 * 1000; // Day duration in ms

  // Timeline grid with all zoom levels (Day/Week/Month)
  timeScaleOptions: DropdownOption[] = [
    // { label: 'Hour', value: 'hour' },
    { label: 'Day', value: 'day' },
    { label: 'Week', value: 'week' },
    { label: 'Month', value: 'month' },
  ];

  // state
  timescale = signal<Timescale>(this.timeScaleOptions[1].value as Timescale);
  workOrders = signal<WorkOrderDocument[]>(this.loadWorkOrders());
  workCenters = signal<WorkCenterDocument[]>(workCentersData);

  columns = computed<WorkOrderColumn[]>(() => {
    return this.getColumnsByTimescale(this.timescale());
  });

  // Add/Edit Work Order state
  isAddEditOpen = signal<boolean>(false);
  addEditWorkCenterDocId = signal<string | null>(null);
  addEditWorkOrder = signal<WorkOrderDisplay | null>(null);

  workOrderDisplays = computed<Map<string, Signal<WorkOrderDisplay[]>>>(() => {
    return this.workCenters().reduce((map, wc) => {
      const workOrdersToDisplay = this.getWorkOrdersToDisplayByWorkCenterDocId(wc.docId);
      map.set(wc.docId, signal<WorkOrderDisplay[]>(workOrdersToDisplay));
      return map;
    }, new Map<string, Signal<WorkOrderDisplay[]>>());
  });

  private readonly persistWorkOrdersEffect = effect(() => {
    // Keep localStorage in sync with the in-memory signal.
    this.saveWorkOrders(this.workOrders());
  });

  // functions
  timeScaleAddTimeFuncions: Record<Timescale, (date: Date, increment: number) => Date> = {
    day: (date: Date, increment: number) => {
      const result = new Date(date);
      result.setDate(result.getDate() + increment);
      return result;
    },
    week: (date: Date, increment: number) => {
      const result = new Date(date);
      result.setDate(result.getDate() + increment * 7);
      return result;
    },
    month: (date: Date, increment: number) => {
      const result = new Date(date);
      result.setMonth(result.getMonth() + increment);
      return result;
    },
  } as const;

  getColumnsByTimescale(timescale: Timescale) {
    const columns: WorkOrderColumn[] = [];

    let currentDate = new Date();
    if (timescale == 'month') {
      currentDate.setDate(1);
    }
    currentDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate(),
    );

    let columnDate = new Date(currentDate);
    columnDate = this.timeScaleAddTimeFuncions[timescale](
      columnDate,
      this.startOffset(),
    );

    for (let i = 1; i < this.totalColumns() + 1; i++) {
      columnDate = this.timeScaleAddTimeFuncions[timescale](columnDate, 1);
      const headerText = columnDate
        .toLocaleString('default', {
          ...(timescale !== 'month' && { day: 'numeric' }),
          month: 'short',
          year: 'numeric',
        })
        .replace(',', '');

      columns.push({
        headerText: headerText,
        startDate: new Date(columnDate),
        isCurrent: columnDate.getTime() === currentDate.getTime(),
      });
    }

    return columns;
  }

  extendColumns(increment: number) {
    if (increment <= 0) return;
    this.totalColumns.set(this.totalColumns() + increment);
  }

  extendColumnsLeft(increment: number) {
    if (increment <= 0) return;
    this.startOffset.set(this.startOffset() - increment);
    this.totalColumns.set(this.totalColumns() + increment);
  }

  updateWorkOrder(
    docId: string,
    data: {
      name: string;
      status: WorkOrderStatus;
      startDate: string;
      endDate: string;
      workCenterId: string;
    },
  ): boolean {
    if (!docId) return false;

    const workOrders = this.workOrders();
    const index = workOrders.findIndex((workOrder) => workOrder.docId === docId);
    if (index === -1) return false;

    const existing = workOrders[index];
    const updated: WorkOrderDocument = {
      docId: existing.docId,
      docType: existing.docType ?? 'workOrder',
      data: {
        ...existing.data,
        name: data.name,
        status: data.status,
        startDate: data.startDate,
        endDate: data.endDate,
        workCenterId: data.workCenterId,
      },
    };

    const next = [...workOrders];
    next[index] = updated;
    this.workOrders.set(next);
    this.saveWorkOrders(next);
    return true;
  }

  createWorkOrder(data: {
    name: string;
    status: WorkOrderStatus;
    startDate: string;
    endDate: string;
    workCenterId: string;
  }): WorkOrderDocument {
    const newWorkOrder: WorkOrderDocument = {
      docId: this.createGuid(),
      docType: 'workOrder',
      data: {
        name: data.name,
        status: data.status,
        startDate: data.startDate,
        endDate: data.endDate,
        workCenterId: data.workCenterId,
      },
    };

    this.workOrders.set([...this.workOrders(), newWorkOrder]);
    this.saveWorkOrders(this.workOrders());
    return newWorkOrder;
  }

  private createGuid(): string {
    // Prefer native UUIDs when available; fallback keeps ids unique enough for local usage.
    const cryptoObj = (typeof globalThis !== 'undefined' ? globalThis.crypto : undefined) as Crypto | undefined;
    if (cryptoObj?.randomUUID) {
      return cryptoObj.randomUUID();
    }

    return `wo-${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
  }

  private loadWorkOrders(): WorkOrderDocument[] {
    if (typeof localStorage === 'undefined') {
      return workOrdersData as WorkOrderDocument[];
    }

    const stored = localStorage.getItem(this.workOrdersStorageKey);
    if (!stored) return workOrdersData as WorkOrderDocument[];

    try {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? (parsed as WorkOrderDocument[]) : (workOrdersData as WorkOrderDocument[]);
    } catch {
      return workOrdersData as WorkOrderDocument[];
    }
  }

  private saveWorkOrders(workOrders: WorkOrderDocument[]) {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(this.workOrdersStorageKey, JSON.stringify(workOrders));
  }

  resetColumns() {
    this.totalColumns.set(this.defaultTotalColumns);
    this.startOffset.set(-Math.floor(this.defaultTotalColumns / 2));
  }

  getWorkOrdersToDisplayByWorkCenterDocId(workCenterDocId: string): WorkOrderDisplay[] {
    const timescale = this.timescale() ?? '';
    const allWorkOrders = this.workOrders() ?? [];
    const columns = this.columns() ?? [];
    if (columns.length === 0) return [];

    const firstColumnStartDate = columns[0].startDate;
    const lastColumnStartDate = columns[columns.length - 1].startDate;
    const lastColumnEndDate = this.timeScaleAddTimeFuncions[timescale](lastColumnStartDate, 1);
    const totalWidthPx = columns.length * this.columnWidthPx;
    const totalColumnsDurationDays =
      (lastColumnEndDate.getTime() - firstColumnStartDate.getTime()) / this.unitDurationMs;
    const pxPerDay = totalWidthPx / totalColumnsDurationDays;

    let workOrdersToDisplay: WorkOrderDisplay[] = [];

    allWorkOrders.forEach((wo) => {
      // Only the work orders of the current work center will be processed and added
      if (wo.data.workCenterId === workCenterDocId) {
        const { startDate, endDate } = wo.data; // Getting start and end dates from the work order data
        const woStartDate = new Date(startDate);
        const woEndDate = new Date(endDate);

        //Checking the duration from the first column to the work order start date to calculate the left span in pixels
        const durationFromFirstColumDays =
          (woStartDate.getTime() - firstColumnStartDate.getTime()) / this.unitDurationMs;
        const leftSpanPx = durationFromFirstColumDays * pxPerDay + this.workCenterColumnWidthPx;

        //Calculating the width in pixels based on the duration of the work order and the current timescale
        const woDurationDays = (woEndDate.getTime() - woStartDate.getTime()) / this.unitDurationMs;
        const woWidthPx = woDurationDays * pxPerDay;

        const woDisplay: WorkOrderDisplay = {
          docId: wo.docId,
          displayText: wo.data.name,
          status: wo.data.status,
          leftSpanPx,
          widthPx: woWidthPx,
          startDate: woStartDate,
          endDate: woEndDate,
          isDisplay: woEndDate > firstColumnStartDate && woEndDate < lastColumnEndDate,
        };

        workOrdersToDisplay.push(woDisplay);
      }
    });

    workOrdersToDisplay = workOrdersToDisplay.sort((a, b) => {
      const aaStartDate = a.startDate ?? new Date();
      const bbStartDate = b.startDate ?? new Date();

      return new Date(aaStartDate).getTime() - new Date(bbStartDate).getTime();
    });

    return workOrdersToDisplay;
  }

  getStoredWorkOrdersToDisplayByWorkCenterDocId(workCenterDocId: string): WorkOrderDisplay[] {
    return this.workOrderDisplays().get(workCenterDocId)?.() ?? [];
  }

  openAddEditWorkOrder(workCenterDocId: string, workOrder: WorkOrderDisplay | null = null) {
    this.addEditWorkCenterDocId.set(workCenterDocId);
    this.addEditWorkOrder.set(workOrder);
    this.isAddEditOpen.set(true);
  }

  closeAddEditWorkOrder() {
    this.addEditWorkCenterDocId.set(null);
    this.addEditWorkOrder.set(null);
    this.isAddEditOpen.set(false);
  }
}
