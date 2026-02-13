import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Backdrop } from '@design-system/backdrop/backdrop';
import { Button } from '@design-system/button/button';
import { Datepicker } from '@design-system/datepicker/datepicker';
import { Dropdown } from '@design-system/dropdown/dropdown';
import { InputText } from '@design-system/input-text/input-text';
import { WorkFlowService } from '@features/work-flow/services/work-flow/work-flow.service';
import { DropdownOption } from '@models/dropdown-option';
import { WorkOrderStatus } from '@models/work-order-status';
import { workOrderDateRangeValidator } from './validators/work-order-date-range.validator';
import { workOrderOverlapValidator } from './validators/work-order-overlap.validator';

@Component({
  selector: 'app-add-edit-work-order',
  imports: [ReactiveFormsModule, Backdrop, Button, InputText, Dropdown, Datepicker],
  templateUrl: './add-edit-work-order.html',
  styleUrl: './add-edit-work-order.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddEditWorkOrder {
  // Data
  statusDropdownOptions: DropdownOption<WorkOrderStatus>[] = [
    { label: 'Blocked', value: 'blocked', isStatusLabel: true },
    { label: 'Open', value: 'open', isStatusLabel: true },
    { label: 'In Progress', value: 'in-progress', isStatusLabel: true },
    { label: 'Completed', value: 'complete', isStatusLabel: true },
  ];

  // services
  workFlowService = inject(WorkFlowService);

  //state
  workOrderFormControls = {
    name: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    status: new FormControl<WorkOrderStatus | null>(null, {
      validators: [Validators.required],
    }),
    endDate: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    startDate: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  };

  workOrderForm = new FormGroup(this.workOrderFormControls, {
    validators: [workOrderDateRangeValidator, workOrderOverlapValidator(this.workFlowService)],
  });

  ngOnInit() {
    const workOrder = this.workFlowService.addEditWorkOrder();

    if (workOrder) {
      this.workOrderForm.setValue({
        name: workOrder.displayText ?? '',
        status: (workOrder.status as WorkOrderStatus) ?? null,
        startDate: (workOrder.startDate ?? '') as string,
        endDate: (workOrder.endDate ?? '') as string,
      });
    }
  }

  //functions
  handleSubmit() {
    if (this.workOrderForm.invalid) {
      this.workOrderForm.markAllAsTouched();
      return;
    }

    const workOrder = this.workFlowService.addEditWorkOrder();
    const workCenterId = this.workFlowService.addEditWorkCenterDocId();
    const formValue = this.workOrderForm.getRawValue();

    if (!workCenterId || !formValue.status) {
      return;
    }

    // Create new or update existing, then persist via the service.
    const payload = {
      name: formValue.name,
      status: formValue.status,
      startDate: formValue.startDate,
      endDate: formValue.endDate,
      workCenterId,
    };

    if (workOrder?.docId) {
      this.workFlowService.updateWorkOrder(workOrder.docId, payload);
    } else {
      this.workFlowService.createWorkOrder(payload);
    }

    this.handleClose();
  }

  handleClose() {
    this.workFlowService.closeAddEditWorkOrder();
  }
}
