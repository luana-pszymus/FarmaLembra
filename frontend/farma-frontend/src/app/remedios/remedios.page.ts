import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';

import {
  addOutline,
  medkitOutline,
  informationCircleOutline,
  timeOutline,
  calendarOutline,
  personOutline,
  refreshOutline,
} from 'ionicons/icons';

import { forkJoin } from 'rxjs';

import { MedicamentoService } from '../services/medicamento.service';
import type { Medicamento } from '../services/medicamento.service';

import { PacienteService } from '../services/paciente.service';
import type { Paciente } from '../services/paciente.service';

import { PrescricaoService } from '../services/prescricoes.service';
import type { Prescricao } from '../services/prescricoes.service';

interface TratamentoExibicao {
  id: number;
  nome: string;
  dosagem: string;
  apresentacao: string;
  paciente: string;
  quantidade: number;
  unidade: string;
  frequencia: string;
  horarios: string;
  dataInicio: string;
  dataFim: string;
  status: string;
  orientacoes: string | null;
}

@Component({
  selector: 'app-remedios',
  templateUrl: './remedios.page.html',
  styleUrls: ['./remedios.page.scss'],
  imports: [IonContent, IonIcon, RouterLink],
})
export class RemediosPage {
  private readonly medicamentoService = inject(MedicamentoService);
  private readonly pacienteService = inject(PacienteService);
  private readonly prescricaoService = inject(PrescricaoService);
  private readonly cdr = inject(ChangeDetectorRef);

  tratamentos: TratamentoExibicao[] = [];

  carregando = false;
  mensagemErro = '';

  constructor() {
    addIcons({
      addOutline,
      medkitOutline,
      informationCircleOutline,
      timeOutline,
      calendarOutline,
      personOutline,
      refreshOutline,
    });
  }

  ionViewWillEnter(): void {
    this.carregarTratamentos();
  }

  carregarTratamentos(): void {
    this.carregando = true;
    this.mensagemErro = '';

    this.cdr.detectChanges();

    forkJoin({
      medicamentos: this.medicamentoService.listar(),
      pacientes: this.pacienteService.listar(),
      prescricoes: this.prescricaoService.listar(),
    }).subscribe({
      next: ({ medicamentos, pacientes, prescricoes }) => {
        this.tratamentos = this.montarLista(medicamentos, pacientes, prescricoes);

        this.carregando = false;

        // Atualiza a tela após receber os dados da API.
        this.cdr.detectChanges();
      },

      error: (erro) => {
        console.error('Erro ao carregar tratamentos:', erro);

        this.mensagemErro = erro?.error?.detail || 'Não foi possível carregar seus medicamentos. Tente novamente.';

        this.carregando = false;

        this.cdr.detectChanges();
      },
    });
  }

  private montarLista(
    medicamentos: Medicamento[],
    pacientes: Paciente[],
    prescricoes: Prescricao[],
  ): TratamentoExibicao[] {
    return prescricoes
      .map((prescricao) => {
        const medicamento = medicamentos.find((item) => item.id === prescricao.medicamento_id);

        const paciente = pacientes.find((item) => item.id === prescricao.paciente_id);

        if (!medicamento) {
          return null;
        }

        return {
          id: prescricao.id,
          nome: medicamento.nome,
          dosagem: medicamento.dosagem,
          apresentacao: medicamento.forma_farmaceutica,
          paciente: paciente?.nome || 'Paciente não identificado',
          quantidade: prescricao.quantidade_por_dose,
          unidade: prescricao.unidade_quantidade,
          frequencia: prescricao.frequencia || 'Não informada',
          horarios: this.formatarHorarios(prescricao),
          dataInicio: this.formatarData(prescricao.data_inicio),
          dataFim: prescricao.data_fim ? this.formatarData(prescricao.data_fim) : 'Uso contínuo',
          status: prescricao.status,
          orientacoes: prescricao.orientacoes,
        };
      })
      .filter((item): item is TratamentoExibicao => item !== null)
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }

  private formatarHorarios(prescricao: Prescricao): string {
    if (prescricao.horarios && prescricao.horarios.length > 0) {
      return prescricao.horarios.join(' • ');
    }

    if (prescricao.horario_inicial) {
      const horario = prescricao.horario_inicial.substring(0, 5);

      return `${horario} (intervalo de ${prescricao.intervalo_horas}h)`;
    }

    return 'Horários não informados';
  }

  private formatarData(data: string): string {
    if (!data) {
      return 'Não informada';
    }

    const [ano, mes, dia] = data.split('-');

    return `${dia}/${mes}/${ano}`;
  }

  obterStatus(status: string): string {
    const statusMap: Record<string, string> = {
      ativo: 'Em andamento',
      inativo: 'Inativo',
      finalizado: 'Finalizado',
    };

    return statusMap[status] || status;
  }
}
