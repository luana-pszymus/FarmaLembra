
// ===== IMPORTAÇÕES =====
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
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

  constructor(private route: ActivatedRoute) {
    // ===== REGISTRO DOS ÍCONES =====
    addIcons({
      arrowBackOutline,
      calendarOutline,
      timeOutline,
      informationCircleOutline,
    });

    // ===== RECEBE O NOME DA PESQUISA =====
    this.route.queryParamMap.subscribe((params) => {
      const nomeRecebido = params.get('nome');

      if (nomeRecebido) {
        this.nome = nomeRecebido;
      }
    });
  }

  // ===== CONFERÊNCIA DOS DADOS =====
  conferirDados() {
    if (
      !this.nome.trim() ||
      !this.dose.trim() ||
      !this.frequencia ||
      !this.dataInicio
    ) {
      this.mensagem = 'Preencha o nome, a dose, a frequência e a data de início.';
      return;
    }

    if (this.dataFim && this.dataFim < this.dataInicio) {
      this.mensagem = 'A data de término não pode ser anterior à data de início.';
      return;
    }

    this.mensagem =
      'Dados preenchidos! A confirmação e o salvamento serão habilitados após a integração com o sistema.';
  }
}
