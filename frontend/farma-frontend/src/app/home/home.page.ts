import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { forkJoin } from 'rxjs';

import {
  addOutline,
  alarmOutline,
  heart,
  medkitOutline,
  timeOutline,
  personOutline,
  chevronForwardOutline,
  notificationsOutline,
  refreshOutline,
  calendarOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
} from 'ionicons/icons';

import { MedicamentoService } from '../services/medicamento.service';
import type { Medicamento } from '../services/medicamento.service';

import { PacienteService } from '../services/paciente.service';
import type { Paciente } from '../services/paciente.service';

import { PrescricaoService } from '../services/prescricoes.service';
import type { Prescricao } from '../services/prescricoes.service';

import { DosesService } from '../services/doses.service';
import type { DoseProgramada } from '../services/doses.service';

interface DoseAgenda {
  id: number;
  prescricaoId: number;
  nome: string;
  dosagem: string;
  apresentacao: string;
  quantidade: number;
  unidade: string;
  horario: string;
  dataHora: Date;
  status: string;
  statusTexto: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  imports: [IonContent, IonIcon, RouterLink],
})
export class HomePage {
  private readonly medicamentoService = inject(MedicamentoService);
  private readonly pacienteService = inject(PacienteService);
  private readonly prescricaoService = inject(PrescricaoService);
  private readonly dosesService = inject(DosesService);
  private readonly cdr = inject(ChangeDetectorRef);

  pacientes: Paciente[] = [];
  medicamentos: Medicamento[] = [];
  prescricoes: Prescricao[] = [];

  pacienteSelecionadoId: number | null = null;
  agenda: DoseAgenda[] = [];

  carregando = false;
  carregandoAgenda = false;
  mensagemErro = '';
  mensagemAcao = '';
  doseEmConfirmacaoId: number | null = null;

  get pacienteSelecionado(): Paciente | undefined {
    return this.pacientes.find((paciente) => paciente.id === this.pacienteSelecionadoId);
  }

  get dosesTomadas(): number {
    return this.agenda.filter((dose) => dose.status === 'tomada').length;
  }

  get dosesPendentes(): number {
    return this.agenda.filter((dose) => dose.status === 'pendente').length;
  }

  get dosesAtrasadas(): number {
    return this.agenda.filter((dose) => dose.status === 'atrasada').length;
  }

  get tratamentosAtivos(): Prescricao[] {
    return this.prescricoes.filter(
      (prescricao) =>
        prescricao.status?.toLowerCase() === 'ativo' && prescricao.paciente_id === this.pacienteSelecionadoId,
    );
  }

  constructor() {
    addIcons({
      addOutline,
      alarmOutline,
      heart,
      medkitOutline,
      timeOutline,
      personOutline,
      chevronForwardOutline,
      notificationsOutline,
      refreshOutline,
      calendarOutline,
      checkmarkCircleOutline,
      closeCircleOutline,
    });
  }

  ionViewWillEnter(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    this.carregando = true;
    this.mensagemErro = '';
    this.mensagemAcao = '';

    forkJoin({
      medicamentos: this.medicamentoService.listar(),
      pacientes: this.pacienteService.listar(),
      prescricoes: this.prescricaoService.listar(),
    }).subscribe({
      next: ({ medicamentos, pacientes, prescricoes }) => {
        this.medicamentos = medicamentos;
        this.pacientes = pacientes;
        this.prescricoes = prescricoes;

        // Mantém o paciente selecionado, se ele ainda estiver cadastrado.
        const pacienteAindaExiste = pacientes.some((paciente) => paciente.id === this.pacienteSelecionadoId);

        if (!pacienteAindaExiste) {
          this.pacienteSelecionadoId = pacientes.length ? pacientes[0].id : null;
        }

        this.carregando = false;

        if (this.pacienteSelecionadoId !== null) {
          this.carregarAgenda();
        } else {
          this.agenda = [];
          this.cdr.detectChanges();
        }
      },
      error: (erro) => {
        console.error('Erro ao carregar dados da Home:', erro);

        this.mensagemErro = erro?.error?.detail || 'Não foi possível carregar os dados. Tente novamente.';

        this.carregando = false;
        this.cdr.detectChanges();
      },
    });
  }

  selecionarPacientePorId(pacienteId: number): void {
    if (this.pacienteSelecionadoId === pacienteId) {
      return;
    }

    this.pacienteSelecionadoId = pacienteId;
    this.mensagemErro = '';
    this.mensagemAcao = '';

    this.carregarAgenda();
  }

  iniciaisPaciente(nome: string): string {
    if (!nome) {
      return '?';
    }

    const partes = nome.trim().split(/\s+/);

    if (partes.length === 1) {
      return partes[0].substring(0, 2).toUpperCase();
    }

    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  }

  carregarAgenda(): void {
    if (this.pacienteSelecionadoId === null) {
      return;
    }

    this.carregandoAgenda = true;
    this.mensagemErro = '';
    this.mensagemAcao = '';

    const hoje = this.dataLocalISO();

    this.dosesService.listarPorPaciente(this.pacienteSelecionadoId, hoje, hoje).subscribe({
      next: (doses) => {
        this.agenda = this.montarAgenda(doses);
        this.carregandoAgenda = false;
        this.cdr.detectChanges();
      },
      error: (erro) => {
        console.error('Erro ao carregar agenda:', erro);

        this.mensagemErro = erro?.error?.detail || 'Não foi possível carregar a agenda deste paciente.';

        this.carregandoAgenda = false;
        this.cdr.detectChanges();
      },
    });
  }

  private montarAgenda(doses: DoseProgramada[]): DoseAgenda[] {
    return doses
      .map((dose) => {
        const prescricao = this.prescricoes.find((item) => item.id === dose.prescricao_id);

        if (!prescricao) {
          return null;
        }

        const medicamento = this.medicamentos.find((item) => item.id === prescricao.medicamento_id);

        if (!medicamento) {
          return null;
        }

        const dataHora = new Date(dose.agendado_para);

        return {
          id: dose.id,
          prescricaoId: dose.prescricao_id,
          nome: medicamento.nome,
          dosagem: medicamento.dosagem,
          apresentacao: medicamento.forma_farmaceutica,
          quantidade: prescricao.quantidade_por_dose,
          unidade: prescricao.unidade_quantidade,
          horario: dataHora.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'America/Sao_Paulo',
          }),
          dataHora,
          status: dose.status?.toLowerCase() || 'pendente',
          statusTexto: this.textoStatus(dose.status),
        };
      })
      .filter((dose): dose is DoseAgenda => dose !== null)
      .sort((a, b) => a.dataHora.getTime() - b.dataHora.getTime());
  }

  confirmarDose(doseId: number, resultado: 'tomada' | 'nao_tomada'): void {
    if (this.doseEmConfirmacaoId !== null) {
      return;
    }

    this.doseEmConfirmacaoId = doseId;
    this.mensagemAcao = '';

    this.dosesService.confirmar(doseId, { resultado }).subscribe({
      next: () => {
        this.mensagemAcao =
          resultado === 'tomada' ? 'Dose confirmada como tomada!' : 'Dose registrada como não tomada.';

        this.doseEmConfirmacaoId = null;
        this.carregarAgenda();
        this.cdr.detectChanges();
      },
      error: (erro) => {
        console.error('Erro ao confirmar dose:', erro);

        this.doseEmConfirmacaoId = null;

        if (erro?.status === 409) {
          this.mensagemAcao = 'Essa dose já foi confirmada. Atualizando a agenda...';
          this.carregarAgenda();
        } else {
          this.mensagemAcao = erro?.error?.detail || 'Não foi possível registrar a confirmação.';
        }

        this.cdr.detectChanges();
      },
    });
  }

  textoStatus(status: string): string {
    switch (status?.toLowerCase()) {
      case 'tomada':
        return 'Tomada';
      case 'nao_tomada':
        return 'Não tomada';
      case 'atrasada':
        return 'Atrasada';
      default:
        return 'Pendente';
    }
  }

  private dataLocalISO(): string {
    const agora = new Date();
    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, '0');
    const dia = String(agora.getDate()).padStart(2, '0');

    return `${ano}-${mes}-${dia}`;
  }
}
