
import type { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'tabs',
    loadComponent: () =>
      import('./tabs/tabs.page').then((m) => m.TabsPage),

    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('./home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'remedios',
        loadComponent: () =>
          import('./paginas/pagina-placeholder.page').then(
            (m) => m.PaginaPlaceholderPage,
          ),
        data: {
          titulo: 'Meus remédios',
          descricao: 'Consulte e organize seus medicamentos.',
          icone: 'medkit-outline',
        },
      },
      {
        path: 'historico',
        loadComponent: () =>
          import('./paginas/pagina-placeholder.page').then(
            (m) => m.PaginaPlaceholderPage,
          ),
        data: {
          titulo: 'Meu histórico',
          descricao: 'Acompanhe seus registros de medicamentos.',
          icone: 'time-outline',
        },
      },
      {
        path: 'perfil',
        loadComponent: () =>
          import('./paginas/pagina-placeholder.page').then(
            (m) => m.PaginaPlaceholderPage,
          ),
        data: {
          titulo: 'Meu perfil',
          descricao: 'Consulte suas informações e preferências.',
          icone: 'person-outline',
        },
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: 'tabs/home',
    pathMatch: 'full',
  },
];
