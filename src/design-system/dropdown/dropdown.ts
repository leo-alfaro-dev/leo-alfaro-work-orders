import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  output,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DropdownOption } from '@models/dropdown-option';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { StatusLabel } from '@design-system/status-label/status-label';
import { WorkOrderStatus } from '@models/work-order-status';

@Component({
  selector: 'app-dropdown',
  imports: [NgbDropdownModule, CommonModule, StatusLabel],
  templateUrl: './dropdown.html',
  styleUrl: './dropdown.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Dropdown),
      multi: true,
    },
  ],
})
export class Dropdown implements ControlValueAccessor {
  // inputs
  id = input.required<string>();
  dropdownOptions = input.required<DropdownOption<WorkOrderStatus>[]>();

  // state
  private selectedValue = signal<WorkOrderStatus | null>(null);
  disabled = signal<boolean>(false);
  selectedOption = computed(() => {
    const value = this.selectedValue();
    const options = this.dropdownOptions() ?? [];
    return options.find((option) => option.value === value) ?? null;
  });

  //events
  onSelect = output<WorkOrderStatus>();

  // functions
  handleSelect(option: DropdownOption<WorkOrderStatus>) {
    if (this.disabled()) return;
    this.selectedValue.set(option.value);
    this.onChangeFn(option.value);
    this.onTouchedFn();
    this.onSelect.emit(option.value);
  }

  // ControlValueAccessor
  private onChangeFn: (value: WorkOrderStatus | null) => void = () => {};
  private onTouchedFn: () => void = () => {};

  writeValue(value: WorkOrderStatus | null): void {
    this.selectedValue.set(value);
  }

  registerOnChange(fn: (value: WorkOrderStatus | null) => void): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedFn = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}
