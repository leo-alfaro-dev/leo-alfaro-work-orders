import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  input,
  output,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-datepicker',
  imports: [ReactiveFormsModule],
  templateUrl: './datepicker.html',
  styleUrl: './datepicker.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Datepicker),
      multi: true,
    },
  ],
})
export class Datepicker implements ControlValueAccessor {
  // inputs
  id = input.required<string>();
  min = input<string>('');
  max = input<string>('');

  // state
  value = signal<string>('');
  disabled = signal<boolean>(false);

  //events
  onChange = output<Date>();

  // functions
  handleDateChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    this.value.set(value);
    this.onChangeFn(value);
    this.onTouchedFn();
    if (value) {
      this.onChange.emit(new Date(value));
    }
  }

  // ControlValueAccessor
  private onChangeFn: (value: string) => void = () => {};
  private onTouchedFn: () => void = () => {};

  writeValue(value: string | Date | null): void {
    if (!value) {
      this.value.set('');
      return;
    }

    if (value instanceof Date) {
      this.value.set(formatDate(value, 'yyyy-MM-dd', 'en-US'));
      return;
    }

    this.value.set(value);
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedFn = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}
