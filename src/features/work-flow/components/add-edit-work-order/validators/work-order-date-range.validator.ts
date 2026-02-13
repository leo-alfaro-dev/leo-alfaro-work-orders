import { ValidationErrors, ValidatorFn } from '@angular/forms';

export const workOrderDateRangeValidator: ValidatorFn = (control): ValidationErrors | null => {
  // Ensures end date is not before start date.
  const startDate = control.get('startDate')?.value as string | null;
  const endDate = control.get('endDate')?.value as string | null;

  if (!startDate || !endDate) {
    return null;
  }

  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();

  if (Number.isNaN(start) || Number.isNaN(end)) {
    return null;
  }

  return end >= start ? null : { dateRange: true };
};
