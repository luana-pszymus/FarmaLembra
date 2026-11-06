import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { arrowBackOutline, calendarOutline, informationCircleOutline, timeOutline } from 'ionicons/icons';

import { PacienteService } from '../services/paciente.service';
import type { Paciente } from '../services/paciente.service';

@Component({
  selector: 'app-cadastro-tratamento',
  templateUrl: './cadastro-tratamento.page.html',
  styleUrls: ['./cadastro-tratamento.page.scss'],
  imports: [IonContent, IonIcon, FormsModule, RouterLink],
})
export class CadastroTratamentoPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly pacienteService = inject(PacienteService);
  pacientes: Paciente[] = [];
  pacienteId: number | null = null;

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
    this.pacienteService.listar().subscribe({
      next: (pacientes) => (this.pacientes = pacientes),
      error: () => (this.mensagem = 'Não foi possível carregar os pacientes.'),
    });

    addIcons({
      arrowBackOutline,
      calendarOutline,
      timeOutline,
      informationCircleOutline,
    });

    this.route.queryParamMap.subscribe((params) => {
      const pacienteId = params.get('pacienteId');
      if (pacienteId) this.pacienteId = Number(pacienteId);

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
    if (!this.pacienteId) {
      this.mensagem = 'Selecione o paciente deste tratamento.';
      return;
    }

    if (!this.nome.trim() || !this.dose.trim() || !this.frequencia || !this.dataInicio) {
      this.mensagem = 'Preencha o nome, a dose, a frequência e a data de início.';
      return;
    }

    if (this.frequencia !== 'Todos os dias') {
      this.mensagem = 'O agendamento automático aceita apenas tratamentos diários neste momento.';
      return;
    }

    const horariosValidos = this.horarios
      .split(/[,;]|\se\s/i)
      .map((h) => h.trim())
      .filter(Boolean);
    if (!horariosValidos.length || horariosValidos.some((h) => !/^([01]\d|2[0-3]):[0-5]\d$/.test(h))) {
      this.mensagem = 'Informe horários válidos, como 08:00 e 20:00.';
      return;
    }

    if (this.dataFim && this.dataFim < this.dataInicio) {
      this.mensagem = 'A data de término não pode ser anterior à data de início.';
      return;
    }

    this.router.navigate(['/tabs/remedios/novo/conferir'], {
      queryParams: {
        pacienteId: this.pacienteId,
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
