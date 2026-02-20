import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('../features/work-flow/work-flow').then((m) => m.WorkFlow),
  },
];
