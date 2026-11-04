// ===== IMPORTAÇÃO DAS ROTAS =====
import type { Routes } from '@angular/router';

// ===== ROTAS PRINCIPAIS DO APLICATIVO =====
export const routes: Routes = [
  {
    path: 'tabs',
    loadComponent: () => import('./tabs/tabs.page').then((m) => m.TabsPage),

    children: [
      // ===== INÍCIO =====
      {
        path: 'home',
        loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
      },

      // ===== LISTA DE REMÉDIOS =====
      {
        path: 'remedios',
        loadComponent: () => import('./remedios/remedios.page').then((m) => m.RemediosPage),
      },

      // ===== DETALHES DE UM MEDICAMENTO =====
      {
        path: 'remedios/detalhes',
        loadComponent: () => import('./detalhes-remedio/detalhes-remedio.page').then((m) => m.DetalhesRemedioPage),
      },

      // ===== ESCOLHA DA FORMA DE ADICIONAR =====
      {
        path: 'remedios/novo',
        loadComponent: () => import('./adicionar-remedio/adicionar-remedio.page').then((m) => m.AdicionarRemedioPage),
      },

      // ===== CADASTRO DOS DADOS DO TRATAMENTO =====
      {
        path: 'remedios/novo/dados',
        loadComponent: () =>
          import('./cadastro-tratamento/cadastro-tratamento.page').then((m) => m.CadastroTratamentoPage),
      },

      // ===== LEITURA DA PRESCRIÇÃO =====
      {
        path: 'remedios/novo/prescricao',
        loadComponent: () =>
          import('./escanear-prescricao/escanear-prescricao.page').then((m) => m.EscanearPrescricaoPage),
      },

      // ===== LEITURA DA EMBALAGEM =====
      {
        path: 'remedios/novo/caixa',
        loadComponent: () =>
          import('./escanear-embalagem/escanear-embalagem.page').then((m) => m.EscanearEmbalagemPage),
      },

      // ===== PESQUISA DE MEDICAMENTOS =====
      {
        path: 'remedios/novo/buscar',
        loadComponent: () => import('./buscar-remedio/buscar-remedio.page').then((m) => m.BuscarRemedioPage),
      },

      // ===== HISTÓRICO =====
      {
        path: 'historico',
        loadComponent: () => import('./historico/historico.page').then((m) => m.HistoricoPage),
      },

      // ===== PERFIL =====
      {
        path: 'perfil',
        loadComponent: () => import('./paginas/pagina-placeholder.page').then((m) => m.PaginaPlaceholderPage),
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
  {
    path: 'login',
    loadComponent: () => import('./paginas/login/login.page').then((m) => m.LoginPage),
  },
];
