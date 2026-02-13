import { Component, input, output } from '@angular/core';
import { ButtonType } from '../../models/button-type';

@Component({
  selector: 'app-button',
  imports: [],
  templateUrl: './button.html',
  styleUrl: './button.scss',
})
export class Button {
  // inputs
  styleType = input<ButtonType>('primary');
  type = input<string>('button');
  displayText = input<string>('');
  disabled = input<boolean>(false);

  // events
  click = output<Event>();

  // functions
  handleOnClick(event: Event) {
    this.click.emit(event);
  }
}
