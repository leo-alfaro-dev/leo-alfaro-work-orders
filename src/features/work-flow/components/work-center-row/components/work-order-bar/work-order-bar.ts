import { Component, computed, inject, input, signal } from '@angular/core';
import { StatusLabel } from '@design-system/status-label/status-label';
import { WorkFlowService } from '@features/work-flow/services/work-flow/work-flow.service';
import { WorkOrderDisplay } from '@models/work-order-display';
import { WorkOrderStatus } from '@models/work-order-status';

@Component({
  selector: 'app-work-order-bar',
  imports: [StatusLabel],
  templateUrl: './work-order-bar.html',
  styleUrl: './work-order-bar.scss',
})
export class WorkOrderBar {
  // services
  workFlowService = inject(WorkFlowService);

  // inputs
  workOrder = input.required<WorkOrderDisplay>();
  workCenterDocId = input.required<string>();

  //consts
  statusDisplayText: Record<WorkOrderStatus, string> = {
    "open" : "Open",
    "in-progress": "In progress",
    "complete": "Complete",
    "blocked": "Blocked"
  } as const

  handleOnClick() {
    this.workFlowService.openAddEditWorkOrder(this.workCenterDocId(), this.workOrder());
  }
}
