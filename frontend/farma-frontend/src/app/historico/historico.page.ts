import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { NgClass } from '@angular/common';
import { IonContent, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { forkJoin } from 'rxjs';

import {
  timeOutline,
  calendarOutline,
  informationCircleOutline,
  medkitOutline,
  personOutline,
  checkmarkCircleOutline,
  alertCircleOutline,
  refreshOutline,
  closeCircleOutline,
  listOutline,
} from 'ionicons/icons';

import { MedicamentoService } from '../services/medicamento.service';
import type { Medicamento } from '../services/medicamento.service';

import { PacienteService } from '../services/paciente.service';
import type { Paciente } from '../services/paciente.service';

import { PrescricaoService } from '../services/prescricoes.service';
import type { Prescricao } from '../services/prescricoes.service';

import { DosesService } from '../services/doses.service';
import type { HistoricoDose } from '../services/doses.service';

interface RegistroHistorico {
  id: number;
  pacienteId: number;

  medicamento: string;
  dosagem: string;
  apresentacao: string;

  paciente: string;

  quantidade: number;
  unidade: string;

  data: string;
  horario: string;

  dataConfirmacao: string;
  horarioConfirmacao: string;

  dataAgendadaHora: number;
  dataHora: number;

  status: string;
  statusTexto: string;

  origem: 'manual' | 'automatica';
  origemTexto: string;

  observacao: string | null;
}

@Component({
  selector: 'app-historico',
  templateUrl: './historico.page.html',
  styleUrls: ['./historico.page.scss'],
  imports: [IonContent, IonIcon, NgClass],
})
export class HistoricoPage {
  private readonly medicamentoService = inject(MedicamentoService);
  private readonly pacienteService = inject(PacienteService);
  private readonly prescricaoService = inject(PrescricaoService);
  private readonly dosesService = inject(DosesService);
  private readonly cdr = inject(ChangeDetectorRef);

  registros: RegistroHistorico[] = [];
  pacientes: Paciente[] = [];

  carregando = false;
  mensagemErro = '';

  // FILTROS
  filtroStatus = 'todos';
  filtroPacienteId: number | null = null;
  filtroOrigem = 'todas';
  ordemData: 'recentes' | 'antigas' = 'recentes';

  // REGISTROS DEPOIS DA APLICAÇÃO DOS FILTROS
  get registrosFiltrados(): RegistroHistorico[] {
    let resultado = [...this.registros];

    // Filtrar por status
    if (this.filtroStatus !== 'todos') {
      resultado = resultado.filter((registro) => registro.status === this.filtroStatus);
    }

    // Filtrar por paciente
    if (this.filtroPacienteId !== null) {
      resultado = resultado.filter((registro) => registro.pacienteId === this.filtroPacienteId);
    }

    // Filtrar por origem
    if (this.filtroOrigem !== 'todas') {
      resultado = resultado.filter((registro) => registro.origem === this.filtroOrigem);
    }

    // Ordenar por data programada
    resultado.sort((a, b) => {
      if (this.ordemData === 'antigas') {
        return a.dataAgendadaHora - b.dataAgendadaHora;
      }

      return b.dataAgendadaHora - a.dataAgendadaHora;
    });

    return resultado;
  }

  // VERIFICA SE EXISTE ALGUM FILTRO ATIVO
  get filtrosAtivos(): boolean {
    return (
      this.filtroStatus !== 'todos' ||
      this.filtroPacienteId !== null ||
      this.filtroOrigem !== 'todas' ||
      this.ordemData !== 'recentes'
    );
  }

  constructor() {
    addIcons({
      timeOutline,
      calendarOutline,
      informationCircleOutline,
      medkitOutline,
      personOutline,
      checkmarkCircleOutline,
      alertCircleOutline,
      refreshOutline,
      closeCircleOutline,
      listOutline,
    });
  }

  ionViewWillEnter(): void {
    this.carregarHistorico();
  }

  // CARREGAR HISTÓRICO
  carregarHistorico(): void {
    this.carregando = true;
    this.mensagemErro = '';

    this.cdr.detectChanges();

    forkJoin({
      medicamentos: this.medicamentoService.listar(),
      pacientes: this.pacienteService.listar(),
      prescricoes: this.prescricaoService.listar(),
    }).subscribe({
      next: ({ medicamentos, pacientes, prescricoes }) => {
        this.pacientes = pacientes;

        if (pacientes.length === 0) {
          this.registros = [];
          this.carregando = false;
          this.cdr.detectChanges();
          return;
        }

        // Busca o histórico individual de cada paciente
        forkJoin(pacientes.map((paciente) => this.dosesService.listarHistoricoPorPaciente(paciente.id))).subscribe({
          next: (listasDeHistorico) => {
            const historicosComPaciente = listasDeHistorico.flatMap((historico, indice) =>
              historico.map((registro) => ({
                registro,
                paciente: pacientes[indice],
              })),
            );

            this.registros = this.montarHistorico(historicosComPaciente, medicamentos, prescricoes);

            this.carregando = false;
            this.cdr.detectChanges();
          },

          error: (erro) => {
            console.error('Erro ao carregar histórico das doses:', erro);

            this.mensagemErro = erro?.error?.detail || 'Não foi possível carregar o histórico das doses.';

            this.carregando = false;
            this.cdr.detectChanges();
          },
        });
      },

      error: (erro) => {
        console.error('Erro ao carregar dados do histórico:', erro);

        this.mensagemErro = erro?.error?.detail || 'Não foi possível carregar o histórico. Tente novamente.';

        this.carregando = false;
        this.cdr.detectChanges();
      },
    });
  }

  // MONTAR LISTA DO HISTÓRICO
  private montarHistorico(
    historicosComPaciente: {
      registro: HistoricoDose;
      paciente: Paciente;
    }[],
    medicamentos: Medicamento[],
    prescricoes: Prescricao[],
  ): RegistroHistorico[] {
    const resultado: RegistroHistorico[] = [];

    for (const { registro, paciente } of historicosComPaciente) {
      const prescricao = prescricoes.find((item) => item.id === registro.prescricao_id);

      if (!prescricao) {
        continue;
      }

      const medicamento = medicamentos.find((item) => item.id === prescricao.medicamento_id);

      if (!medicamento) {
        continue;
      }

      const dataAgendada = new Date(registro.agendado_para);
      const dataRegistro = new Date(registro.confirmado_em);

      resultado.push({
        id: registro.dose_id,
        pacienteId: paciente.id,

        medicamento: medicamento.nome,
        dosagem: medicamento.dosagem,
        apresentacao: medicamento.forma_farmaceutica,

        paciente: paciente.nome,

        quantidade: prescricao.quantidade_por_dose,
        unidade: prescricao.unidade_quantidade,

        data: this.formatarData(dataAgendada),
        horario: this.formatarHora(dataAgendada),

        dataConfirmacao: this.formatarData(dataRegistro),
        horarioConfirmacao: this.formatarHora(dataRegistro),

        dataAgendadaHora: dataAgendada.getTime(),
        dataHora: dataRegistro.getTime(),

        status: registro.resultado,
        statusTexto: this.obterStatus(registro.resultado),

        origem: registro.origem,
        origemTexto: this.obterTextoOrigem(registro.origem),

        observacao: registro.observacao,
      });
    }

    return resultado.sort((a, b) => b.dataAgendadaHora - a.dataAgendadaHora);
  }

  // SELECIONAR STATUS PELOS BOTÕES
  selecionarStatus(status: string): void {
    this.filtroStatus = status;
  }

  // ALTERAR FILTRO DE PACIENTE
  alterarPaciente(event: Event): void {
    const valor = (event.target as HTMLSelectElement).value;

    this.filtroPacienteId = valor === 'todos' ? null : Number(valor);
  }

  // ALTERAR FILTRO DE ORIGEM
  alterarOrigem(event: Event): void {
    this.filtroOrigem = (event.target as HTMLSelectElement).value;
  }

  // ALTERAR ORDENAÇÃO
  alterarOrdem(event: Event): void {
    this.ordemData = (event.target as HTMLSelectElement).value as 'recentes' | 'antigas';
  }

  // LIMPAR TODOS OS FILTROS
  limparFiltros(): void {
    this.filtroStatus = 'todos';
    this.filtroPacienteId = null;
    this.filtroOrigem = 'todas';
    this.ordemData = 'recentes';
  }

  // FORMATAR DATA
  private formatarData(data: Date): string {
    return data.toLocaleDateString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  // FORMATAR HORÁRIO
  private formatarHora(data: Date): string {
    return data.toLocaleTimeString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // TEXTO DO STATUS
  obterStatus(status: string): string {
    const statusMap: Record<string, string> = {
      tomada: 'Tomada',
      nao_tomada: 'Não tomada',
      pendente: 'Pendente',
      atrasada: 'Atrasada',
    };

    return statusMap[status] || status;
  }

  // CLASSE CSS DO STATUS
  obterClasseStatus(status: string): string {
    const classes: Record<string, string> = {
      tomada: 'tomada',
      nao_tomada: 'nao-tomada',
      pendente: 'pendente',
      atrasada: 'atrasada',
    };

    return classes[status] || 'pendente';
  }

  // ÍCONE DO STATUS
  obterIconeStatus(status: string): string {
    const icones: Record<string, string> = {
      tomada: 'checkmark-circle-outline',
      nao_tomada: 'close-circle-outline',
      pendente: 'time-outline',
      atrasada: 'alert-circle-outline',
    };

    return icones[status] || 'information-circle-outline';
  }

  // IDENTIFICAR ORIGEM DO REGISTRO
  obterTextoOrigem(origem: string): string {
    if (origem === 'automatica') {
      return 'Marcação automática';
    }

    return 'Confirmada manualmente';
  }
}
