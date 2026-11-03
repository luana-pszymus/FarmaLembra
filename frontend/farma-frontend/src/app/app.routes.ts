
import type { Routes } from '@angular/router';

// ===== ROTAS PRINCIPAIS DO APLICATIVO =====
export const routes: Routes = [
  {
    path: 'tabs',
    loadComponent: () =>
      import('./tabs/tabs.page').then((m) => m.TabsPage),

    children: [
      // ===== INÍCIO =====
      {
        path: 'home',
        loadComponent: () =>
          import('./home/home.page').then((m) => m.HomePage),
      },

      // ===== LISTA DE REMÉDIOS =====
      {
        path: 'remedios',
        loadComponent: () =>
          import('./remedios/remedios.page').then(
            (m) => m.RemediosPage,
          ),
      },

      // ===== ESCOLHA DA FORMA DE ADICIONAR =====
      {
        path: 'remedios/novo',
        loadComponent: () =>
          import('./adicionar-remedio/adicionar-remedio.page').then(
            (m) => m.AdicionarRemedioPage,
          ),
      },

      // ===== FUTURA LEITURA DA PRESCRIÇÃO =====
      {
        path: 'remedios/novo/prescricao',
        loadComponent: () =>
          import('./paginas/pagina-placeholder.page').then(
            (m) => m.PaginaPlaceholderPage,
          ),
        data: {
          titulo: 'Fotografar prescrição',
          descricao: 'Aqui será feita a leitura da sua receita.',
          icone: 'medkit-outline',
        },
      },

      // ===== FUTURA LEITURA DA EMBALAGEM =====
      {
        path: 'remedios/novo/caixa',
        loadComponent: () =>
          import('./paginas/pagina-placeholder.page').then(
            (m) => m.PaginaPlaceholderPage,
          ),
        data: {
          titulo: 'Escanear embalagem',
          descricao: 'Aqui você poderá identificar seu medicamento.',
          icone: 'medkit-outline',
        },
      },

     // ===== PESQUISA DE MEDICAMENTOS =====
{
  path: 'remedios/novo/buscar',
  loadComponent: () =>
    import('./buscar-remedio/buscar-remedio.page').then(
      (m) => m.BuscarRemedioPage,
    ),
},

      // ===== HISTÓRICO =====
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

      // ===== PERFIL =====
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

      // ===== ROTA PADRÃO DAS ABAS =====
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
    ],
  },

  // ===== ENTRADA DO APLICATIVO =====
  {
    path: '',
    redirectTo: 'tabs/home',
    pathMatch: 'full',
  },
];
