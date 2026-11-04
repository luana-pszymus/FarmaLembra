
// ===== IMPORTAÇÕES =====
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';

// ===== ÍCONES DO FORMULÁRIO =====
import {
  arrowBackOutline,
  calendarOutline,
  timeOutline,
  informationCircleOutline,
} from 'ionicons/icons';

// ===== COMPONENTE DO CADASTRO =====
@Component({
  selector: 'app-cadastro-tratamento',
  templateUrl: './cadastro-tratamento.page.html',
  styleUrls: ['./cadastro-tratamento.page.scss'],
  imports: [IonContent, IonIcon, FormsModule, RouterLink],
})
export class CadastroTratamentoPage {

  // ===== ORIGEM DO CADASTRO =====
  origem = 'pesquisa';

  // ===== DADOS DO MEDICAMENTO =====
  nome = '';
  apresentacao = '';
  concentracao = '';

  // ===== DADOS DA DOSE =====
  dose = '';
  unidadeDose = 'comprimido';

  // ===== FREQUÊNCIA E HORÁRIOS =====
  frequencia = 'Todos os dias';
  horarios = '';

  // ===== PERÍODO DO TRATAMENTO =====
  dataInicio = '';
  dataFim = '';

  // ===== ORIENTAÇÕES =====
  observacoes = '';

  // ===== MENSAGEM DO FORMULÁRIO =====
  mensagem = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {
    // ===== REGISTRO DOS ÍCONES =====
    addIcons({
      arrowBackOutline,
      calendarOutline,
      timeOutline,
      informationCircleOutline,
    });

    // ===== RECEBE TODOS OS DADOS DA ORIGEM OU DA EDIÇÃO =====
    this.route.queryParamMap.subscribe((params) => {

      // ===== DADOS DO MEDICAMENTO =====
      if (params.has('nome')) {
        this.nome = params.get('nome') ?? '';
      }

      if (params.has('apresentacao')) {
        this.apresentacao = params.get('apresentacao') ?? '';
      }

      if (params.has('concentracao')) {
        this.concentracao = params.get('concentracao') ?? '';
      }

      // ===== DADOS DA DOSE =====
      if (params.has('dose')) {
        this.dose = params.get('dose') ?? '';
      }

      if (params.has('unidadeDose')) {
        this.unidadeDose = params.get('unidadeDose') ?? '';
      }

      // ===== FREQUÊNCIA E HORÁRIOS =====
      if (params.has('frequencia')) {
        this.frequencia = params.get('frequencia') ?? '';
      }

      if (params.has('horarios')) {
        this.horarios = params.get('horarios') ?? '';
      }

      // ===== PERÍODO DO TRATAMENTO =====
      if (params.has('dataInicio')) {
        this.dataInicio = params.get('dataInicio') ?? '';
      }

      if (params.has('dataFim')) {
        this.dataFim = params.get('dataFim') ?? '';
      }

      // ===== ORIENTAÇÕES =====
      if (params.has('observacoes')) {
        this.observacoes = params.get('observacoes') ?? '';
      }

      // ===== IDENTIFICA O CAMINHO UTILIZADO =====
      const origemRecebida = params.get('origem');

      if (
        origemRecebida === 'pesquisa' ||
        origemRecebida === 'embalagem' ||
        origemRecebida === 'prescricao'
      ) {
        this.origem = origemRecebida;
      }

      // ===== LIMPA MENSAGENS ANTERIORES =====
      this.mensagem = '';
    });
  }

  // ===== CONFERE E ENVIA OS DADOS =====
  conferirDados() {
    if (
      !this.nome.trim() ||
      !this.dose.trim() ||
      !this.frequencia ||
      !this.dataInicio
    ) {
      this.mensagem =
        'Preencha o nome, a dose, a frequência e a data de início.';
      return;
    }

    // ===== VALIDA O PERÍODO DO TRATAMENTO =====
    if (this.dataFim && this.dataFim < this.dataInicio) {
      this.mensagem =
        'A data de término não pode ser anterior à data de início.';
      return;
    }

    // ===== ENVIA TODOS OS DADOS PARA A TELA DE REVISÃO =====
    this.router.navigate(['/tabs/remedios/novo/conferir'], {
      queryParams: {
        origem: this.origem,
        nome: this.nome.trim(),
        apresentacao: this.apresentacao,
        concentracao: this.concentracao,
        dose: this.dose.trim(),
        unidadeDose: this.unidadeDose,
        frequencia: this.frequencia,
        horarios: this.horarios,
        dataInicio: this.dataInicio,
        dataFim: this.dataFim,
        observacoes: this.observacoes,
      },
    });
  }
}
