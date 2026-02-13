import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InlineDropdown } from '@design-system/inline-dropdown/inline-dropdown';
import { DropdownOption } from '@models/dropdown-option';

describe('InlineDropdown', () => {
  let component: InlineDropdown;
  let fixture: ComponentFixture<InlineDropdown>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InlineDropdown],
    }).compileComponents();

    fixture = TestBed.createComponent(InlineDropdown);
    component = fixture.componentInstance;
    const options: DropdownOption[] = [
      { label: 'Day', value: 'day' },
      { label: 'Week', value: 'week' },
    ];
    fixture.componentRef.setInput('label', 'Timescale');
    fixture.componentRef.setInput('dropdownOptions', options);
    fixture.componentRef.setInput('value', 'day');
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
