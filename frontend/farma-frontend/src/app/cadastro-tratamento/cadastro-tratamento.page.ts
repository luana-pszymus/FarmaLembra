import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { arrowBackOutline, calendarOutline, informationCircleOutline, timeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-cadastro-tratamento',
  templateUrl: './cadastro-tratamento.page.html',
  styleUrls: ['./cadastro-tratamento.page.scss'],
  imports: [IonContent, IonIcon, FormsModule, RouterLink],
})
export class CadastroTratamentoPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  origem = 'pesquisa';

  nome = '';
  apresentacao = '';
  concentracao = '';

  dose = '';
  unidadeDose = 'comprimido';

  frequencia = 'Todos os dias';
  horarios = '';

  dataInicio = '';
  dataFim = '';

  observacoes = '';

  mensagem = '';

  constructor() {
    addIcons({
      arrowBackOutline,
      calendarOutline,
      timeOutline,
      informationCircleOutline,
    });

    this.route.queryParamMap.subscribe((params) => {
      if (params.has('nome')) {
        this.nome = params.get('nome') ?? '';
      }

      if (params.has('apresentacao')) {
        this.apresentacao = params.get('apresentacao') ?? '';
      }

      if (params.has('concentracao')) {
        this.concentracao = params.get('concentracao') ?? '';
      }

      if (params.has('dose')) {
        this.dose = params.get('dose') ?? '';
      }

      if (params.has('unidadeDose')) {
        this.unidadeDose = params.get('unidadeDose') ?? '';
      }

      if (params.has('frequencia')) {
        this.frequencia = params.get('frequencia') ?? '';
      }

      if (params.has('horarios')) {
        this.horarios = params.get('horarios') ?? '';
      }

      if (params.has('dataInicio')) {
        this.dataInicio = params.get('dataInicio') ?? '';
      }

      if (params.has('dataFim')) {
        this.dataFim = params.get('dataFim') ?? '';
      }

      if (params.has('observacoes')) {
        this.observacoes = params.get('observacoes') ?? '';
      }

      const origemRecebida = params.get('origem');

      if (origemRecebida === 'pesquisa' || origemRecebida === 'embalagem' || origemRecebida === 'prescricao') {
        this.origem = origemRecebida;
      }

      this.mensagem = '';
    });
  }

  conferirDados(): void {
    if (!this.nome.trim() || !this.dose.trim() || !this.frequencia || !this.dataInicio) {
      this.mensagem = 'Preencha o nome, a dose, a frequência e a data de início.';
      return;
    }

    if (this.dataFim && this.dataFim < this.dataInicio) {
      this.mensagem = 'A data de término não pode ser anterior à data de início.';
      return;
    }

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
