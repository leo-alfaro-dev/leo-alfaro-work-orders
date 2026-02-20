import { ValidationErrors, ValidatorFn } from '@angular/forms';
import { WorkFlowService } from '@features/work-flow/services/work-flow/work-flow.service';

export const workOrderOverlapValidator = (workFlowService: WorkFlowService): ValidatorFn => {
  return (control): ValidationErrors | null => {
    // Prevent overlaps within the same work center (excluding the current order).
    const startDate = control.get('startDate')?.value as string | null;
    const endDate = control.get('endDate')?.value as string | null;

    if (!startDate || !endDate) {
      return null;
    }

    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    if (Number.isNaN(start) || Number.isNaN(end)) {
      return null;
    }

    const workCenterDocId = workFlowService.addEditWorkCenterDocId();
    if (!workCenterDocId) {
      return null;
    }

    const currentDocId = workFlowService.addEditWorkOrder()?.docId ?? null;
    const workOrdersToDisplay =
      workFlowService.getStoredWorkOrdersToDisplayByWorkCenterDocId(workCenterDocId);

    const hasOverlap = workOrdersToDisplay.some((workOrder) => {
      if (!workOrder.startDate || !workOrder.endDate) return false;
      if (currentDocId && workOrder.docId === currentDocId) return false;

      const existingStart = workOrder.startDate.getTime();
      const existingEnd = workOrder.endDate.getTime();

      return start <= existingEnd && end >= existingStart;
    });

    return hasOverlap ? { dateOverlap: true } : null;
  };
};
