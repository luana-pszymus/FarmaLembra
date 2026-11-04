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

    // ===== RECEBE OS DADOS DA ORIGEM =====
    this.route.queryParamMap.subscribe((params) => {
      const nomeRecebido = params.get('nome');
      const apresentacaoRecebida = params.get('apresentacao');
      const concentracaoRecebida = params.get('concentracao');
      const origemRecebida = params.get('origem');

      if (nomeRecebido) this.nome = nomeRecebido;
      if (apresentacaoRecebida) this.apresentacao = apresentacaoRecebida;
      if (concentracaoRecebida) this.concentracao = concentracaoRecebida;

      // ===== IDENTIFICA O CAMINHO UTILIZADO =====
      if (
        origemRecebida === 'pesquisa' ||
        origemRecebida === 'embalagem' ||
        origemRecebida === 'prescricao'
      ) {
        this.origem = origemRecebida;
      }
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

    if (this.dataFim && this.dataFim < this.dataInicio) {
      this.mensagem =
        'A data de término não pode ser anterior à data de início.';
      return;
    }

    // ===== ENVIA OS DADOS PARA A TELA DE REVISÃO =====
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