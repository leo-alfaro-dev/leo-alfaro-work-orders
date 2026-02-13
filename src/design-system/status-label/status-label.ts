import { Component, input } from '@angular/core';
import { WorkOrderStatus } from '@models/work-order-status';

@Component({
  selector: 'app-status-label',
  imports: [],
  templateUrl: './status-label.html',
  styleUrl: './status-label.scss',
  host: {
    class: 'd-flex',
  },
})
export class StatusLabel {
  // inputs
  status = input<WorkOrderStatus>();
  displayText = input<string>();
}
