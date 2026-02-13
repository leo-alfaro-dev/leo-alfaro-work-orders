import { Timescale } from "@models/timescale"

export interface DropdownOption<T = string> {
  label?: string;
  isStatusLabel?: boolean;
  value: T;
}