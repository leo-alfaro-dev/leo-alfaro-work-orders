import { ApplicationRef, EmbeddedViewRef, Injectable, TemplateRef } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PortalService {
  private embeddedView?: EmbeddedViewRef<any>;

  constructor(private appRef: ApplicationRef) {}

  attachTemplate(template: TemplateRef<any>, context?: any) {
    const host = document.querySelector('#portal-root') as HTMLElement | null;
    if (!host) {
      console.warn('Portal host (.portal-root) not found in DOM.');
      return;
    }

    this.detach();

    this.embeddedView = template.createEmbeddedView(context || {});
    this.appRef.attachView(this.embeddedView);
    this.embeddedView.rootNodes.forEach((node) => host.appendChild(node));
  }

  detach() {
    if (this.embeddedView) {
      this.appRef.detachView(this.embeddedView);
      this.embeddedView.destroy();
      this.embeddedView = undefined;
    }
  }
}
