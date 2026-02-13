import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
  TemplateRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  computed,
  effect,
} from '@angular/core';
import { InlineDropdown } from '@design-system/inline-dropdown/inline-dropdown';
import { WorkCenterRow } from '@features/work-flow/components/work-center-row/work-center-row';
import { WorkFlowService } from '@features/work-flow/services/work-flow/work-flow.service';
import { PortalService } from '@services/portal.service';
import { AddEditWorkOrder } from '@features/work-flow/components/add-edit-work-order/add-edit-work-order';
import { Timescale } from '@models/timescale';
import { StatusLabel } from '@design-system/status-label/status-label';

@Component({
  selector: 'app-work-flow',
  imports: [InlineDropdown, WorkCenterRow, AddEditWorkOrder, StatusLabel],
  templateUrl: './work-flow.html',
  styleUrl: './work-flow.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'd-flex flex-column flex-grow-1',
  },
})
export class WorkFlow implements AfterViewInit, OnDestroy {
  workFlowService = inject(WorkFlowService);
  portalService = inject(PortalService);

  private readonly columnBatchSize = 10;
  private readonly loadThresholdPx = 200;
  private lastExtendedAtRightWidth = signal<number>(0);
  private lastExtendedAtLeftWidth = signal<number>(0);
  private viewReady = signal<boolean>(false);
  private hasCentered = signal<boolean>(false);
  private userHasScrolled = signal<boolean>(false);

  @ViewChild('portalTemplate', { read: TemplateRef }) portalTemplate!: TemplateRef<any>;
  @ViewChild('addEditWorkOrder', { read: TemplateRef }) addEditWorkOrder!: TemplateRef<AddEditWorkOrder>;
  @ViewChild('workFlowScroll', { read: ElementRef }) workFlowScroll!: ElementRef<HTMLElement>;

  timescale = this.workFlowService.timescale;
  columns = this.workFlowService.columns;
  workCenters = this.workFlowService.workCenters;

  currentTimescaleLabel = computed(() => {
    const option = this.workFlowService.timeScaleOptions.find(
      (ts) => ts.value === this.timescale()
    );
    return option ? `Current ${option.label}` : '';
  });

  private readonly centerCurrentColumnEffect = effect(() => {
    // Center the current column on initial load
    if (!this.viewReady() || this.hasCentered() || this.userHasScrolled()) return;
    void this.timescale();
    const columns = this.columns();
    const currentIndex = columns.findIndex((column) => column.isCurrent);
    if (currentIndex < 0) return;

    const container = this.workFlowScroll?.nativeElement;
    if (!container) return;

    const columnWidth = this.workFlowService.columnWidthPx;
    const leftOffset = this.workFlowService.workCenterColumnWidthPx;
    const currentCenter = leftOffset + currentIndex * columnWidth + columnWidth / 2;
    const targetScrollLeft = Math.max(0, currentCenter - container.clientWidth / 2);

    requestAnimationFrame(() => {
      container.scrollLeft = targetScrollLeft;
      this.hasCentered.set(true);
    });
  });

  onTimescaleSelect(value: string) {
    this.timescale.set(value as Timescale);
    this.workFlowService.resetColumns();
    this.lastExtendedAtRightWidth.set(0);
    this.lastExtendedAtLeftWidth.set(0);
    this.hasCentered.set(false);
    this.userHasScrolled.set(false);
  }

  ngAfterViewInit(): void {
    if (this.portalTemplate) {
      this.portalService.attachTemplate(this.portalTemplate);
    }
    this.viewReady.set(true);
  }

  ngOnDestroy(): void {
    this.portalService.detach();
  }

  isOpen = signal<boolean>(false)

  handleScroll(event: Event) {
    const target = event.target as HTMLElement;
    this.userHasScrolled.set(true);
    const rightEdge = target.scrollLeft + target.clientWidth;
    const max = target.scrollWidth - this.loadThresholdPx;
    const leftEdge = target.scrollLeft;

    if (rightEdge >= max && this.lastExtendedAtRightWidth() !== target.scrollWidth) {
      this.lastExtendedAtRightWidth.set(target.scrollWidth);
      this.workFlowService.extendColumns(this.columnBatchSize);
    }

    if (leftEdge <= this.loadThresholdPx && this.lastExtendedAtLeftWidth() !== target.scrollWidth) {
      this.lastExtendedAtLeftWidth.set(target.scrollWidth);
      this.workFlowService.extendColumnsLeft(this.columnBatchSize);
      const shiftPx = this.columnBatchSize * this.workFlowService.columnWidthPx;
      requestAnimationFrame(() => {
        target.scrollLeft = target.scrollLeft + shiftPx;
      });
    }
  }
}
