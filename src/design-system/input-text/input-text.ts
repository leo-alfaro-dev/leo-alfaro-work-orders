import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  input,
  output,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-input-text',
  imports: [ReactiveFormsModule],
  templateUrl: './input-text.html',
  styleUrl: './input-text.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputText),
      multi: true,
    },
  ],
})
export class InputText implements ControlValueAccessor {
  // inputs
  id = input.required<string>();
  placeholder = input<string>('');

  // state
  value = signal<string>('');
  disabled = signal<boolean>(false);

  // functions
  onChange = output<string>();

  handleOnInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    this.value.set(value);
    this.onChangeFn(value);
    this.onTouchedFn();
    this.onChange.emit(value);
  }

  // ControlValueAccessor
  private onChangeFn: (value: string) => void = () => {};
  private onTouchedFn: () => void = () => {};

  writeValue(value: string | null): void {
    this.value.set(value ?? '');
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
