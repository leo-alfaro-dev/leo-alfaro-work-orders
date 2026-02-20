import { WorkOrderStatus } from './work-order-status';

export interface WorkOrderDisplay {
  docId?: string;
  displayText?: string;
  status?: WorkOrderStatus;
  leftSpanPx?: number;
  widthPx?: number;
  startDate?: Date;
  endDate?: Date;
  isDisplay?: boolean; // New property to track if the work order should display in grid
}
