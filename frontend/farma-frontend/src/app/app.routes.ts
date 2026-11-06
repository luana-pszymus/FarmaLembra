import type { Routes } from '@angular/router';

import { authGuard } from './guards/auth.guard';

// Rotas principais do aplicativo.
export const routes: Routes = [
  {
    path: 'tabs',
    canActivate: [authGuard],
    loadComponent: () => import('./tabs/tabs.page').then((m) => m.TabsPage),

    children: [
      {
        path: 'home',
        loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'pacientes',
        loadComponent: () => import('./pacientes/pacientes.page').then((m) => m.PacientesPage),
      },
      {
        path: 'remedios',
        loadComponent: () => import('./remedios/remedios.page').then((m) => m.RemediosPage),
      },
      {
        path: 'remedios/detalhes',
        loadComponent: () => import('./detalhes-remedio/detalhes-remedio.page').then((m) => m.DetalhesRemedioPage),
      },
      {
        path: 'remedios/novo',
        loadComponent: () => import('./adicionar-remedio/adicionar-remedio.page').then((m) => m.AdicionarRemedioPage),
      },
      {
        path: 'remedios/novo/dados',
        loadComponent: () =>
          import('./cadastro-tratamento/cadastro-tratamento.page').then((m) => m.CadastroTratamentoPage),
      },
      {
        path: 'remedios/novo/conferir',
        loadComponent: () =>
          import('./conferir-remedio/conferir-remedio.page').then((m) => m.ConferirRemedioPage),
      },
      {
        path: 'remedios/novo/prescricao',
        loadComponent: () =>
          import('./escanear-prescricao/escanear-prescricao.page').then((m) => m.EscanearPrescricaoPage),
      },
      {
        path: 'remedios/novo/caixa',
        loadComponent: () =>
          import('./escanear-embalagem/escanear-embalagem.page').then((m) => m.EscanearEmbalagemPage),
      },
      {
        path: 'remedios/novo/buscar',
        loadComponent: () => import('./buscar-remedio/buscar-remedio.page').then((m) => m.BuscarRemedioPage),
      },
      {
        path: 'historico',
        loadComponent: () => import('./historico/historico.page').then((m) => m.HistoricoPage),
      },
      {
        path: 'perfil',
        loadComponent: () => import('./paginas/pagina-placeholder.page').then((m) => m.PaginaPlaceholderPage),
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
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./paginas/login/login.page').then((m) => m.LoginPage),
  },
];
