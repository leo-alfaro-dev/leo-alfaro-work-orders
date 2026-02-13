import { WorkOrderStatus } from "./work-order-status";

export interface WorkOrderDocument {
  docId: string;
  docType: string;
  data: {
    name: string;
    workCenterId: string;   
    status: WorkOrderStatus
    startDate: string;      
    endDate: string;        
  };
}