import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { WorkCenterDocument } from '../../../../models/work-center-document';
import { WorkOrderDisplay } from '../../../../models/work-order-display';
import { WorkFlowService } from '../../services/work-flow/work-flow.service';
import { WorkOrderBar } from './components/work-order-bar/work-order-bar';

@Component({
  selector: 'app-work-center-row',
  imports: [WorkOrderBar],
  templateUrl: './work-center-row.html',
  styleUrl: './work-center-row.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkCenterRow {
  workFlowService = inject(WorkFlowService);

  // Inputs
  workCenter = input<WorkCenterDocument>();

  // state
  timescale = this.workFlowService.timescale;
  columns = this.workFlowService.columns;

  workOrdersDisplay = computed(() => {
    const workCenterDocId = this.workCenter()?.docId ?? '';
    return this.workFlowService
      .getStoredWorkOrdersToDisplayByWorkCenterDocId(workCenterDocId)
      .filter((wo) => wo.isDisplay);
  });

  handleAddWorkOrder(startDate?: Date, event?: Event) {
    event?.stopPropagation();
    const workCenterDocId = this.workCenter()?.docId ?? '';
    if (!workCenterDocId) return;
    // Pre-fill start date based on the clicked column.
    this.workFlowService.openAddEditWorkOrder(workCenterDocId, {
      startDate: startDate ?? undefined,
    });
  }
}
