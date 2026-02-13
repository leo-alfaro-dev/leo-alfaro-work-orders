import { ChangeDetectionStrategy, Component, effect, input, output, signal } from '@angular/core';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { DropdownOption } from '@models/dropdown-option';

@Component({
  selector: 'app-inline-dropdown',
  imports: [NgbDropdownModule],
  templateUrl: './inline-dropdown.html',
  styleUrl: './inline-dropdown.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InlineDropdown {
  //inputs
  readonly label = input.required<string>();
  readonly dropdownOptions = input.required<DropdownOption[]>();
  readonly value = input.required<string>();

  //events
  readonly onSelect = output<string>();

  //state
  readonly selectedOption = signal<DropdownOption | undefined>(undefined);

  constructor() {
    effect(() => {
      this.selectedOption.set(
        this.dropdownOptions().find((option) => option.value == this.value()),
      );
    });
  }

  handleSelect(option: DropdownOption) {
    this.onSelect.emit(option.value);
  }
}
