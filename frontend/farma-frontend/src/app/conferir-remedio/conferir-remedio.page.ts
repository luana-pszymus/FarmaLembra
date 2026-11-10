import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  calendarOutline,
  checkmarkCircleOutline,
  informationCircleOutline,
  medkitOutline,
  timeOutline,
} from 'ionicons/icons';

import { MedicamentoService } from '../services/medicamento.service';
import type { PrescricaoCreate } from '../services/prescricoes.service';
import { PrescricaoService } from '../services/prescricoes.service';

@Component({
  selector: 'app-conferir-remedio',
  templateUrl: './conferir-remedio.page.html',
  styleUrls: ['./conferir-remedio.page.scss'],
  imports: [IonContent, IonIcon],
})
export class ConferirRemedioPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly medicamentoService = inject(MedicamentoService);
  private readonly prescricaoService = inject(PrescricaoService);

  pacienteId: number | null = null;
  origem = '';
  nome = '';
  apresentacao = '';
  concentracao = '';
  dose = '';
  unidadeDose = '';
  frequencia = '';
  horarios = '';
  dataInicio = '';
  dataFim = '';
  observacoes = '';
  mensagem = '';
  salvando = false;
  salvo = false;

  constructor() {
    addIcons({
      arrowBackOutline,
      medkitOutline,
      calendarOutline,
      timeOutline,
      informationCircleOutline,
      checkmarkCircleOutline,
    });

    this.route.queryParamMap.subscribe((params) => {
      this.pacienteId = Number(params.get('pacienteId')) || null;
      this.origem = params.get('origem') || '';
      this.nome = params.get('nome') || '';
      this.apresentacao = params.get('apresentacao') || '';
      this.concentracao = params.get('concentracao') || '';
      this.dose = params.get('dose') || '';
      this.unidadeDose = params.get('unidadeDose') || '';
      this.frequencia = params.get('frequencia') || '';
      this.horarios = params.get('horarios') || '';
      this.dataInicio = params.get('dataInicio') || '';
      this.dataFim = params.get('dataFim') || '';
      this.observacoes = params.get('observacoes') || '';
    });
  }

  editar(): Promise<boolean> {
    return this.router.navigate(['/tabs/remedios/novo/dados'], {
      queryParams: {
        pacienteId: this.pacienteId,
        origem: this.origem,
        nome: this.nome,
        apresentacao: this.apresentacao,
        concentracao: this.concentracao,
        dose: this.dose,
        unidadeDose: this.unidadeDose,
        frequencia: this.frequencia,
        horarios: this.horarios,
        dataInicio: this.dataInicio,
        dataFim: this.dataFim,
        observacoes: this.observacoes,
      },
    });
  }

  voltarMedicamentos(): void {
    this.router.navigate(['/tabs/remedios']);
  }

  confirmar(): void {
    if (this.salvando || this.salvo) return;

    const quantidade = Number(this.dose.replace(',', '.'));

    const horarios = this.horarios
      .split(/[,;]|\se\s/i)
      .map((h) => h.trim())
      .filter(Boolean);

    if (
      !this.pacienteId ||
      !this.nome.trim() ||
      !Number.isFinite(quantidade) ||
      quantidade <= 0 ||
      !this.dataInicio ||
      !horarios.length ||
      horarios.some((h) => !/^([01]\d|2[0-3]):[0-5]\d$/.test(h))
    ) {
      this.mensagem = 'Dados incompletos ou inválidos. Volte e confira o cadastro.';
      return;
    }

    this.salvando = true;
    this.mensagem = 'Salvando tratamento...';

    this.medicamentoService.listar().subscribe({
      next: (medicamentos) => {
        const nome = this.nome.trim().toLocaleLowerCase();
        const dosagem = (this.concentracao.trim() || 'Não informada').toLocaleLowerCase();
        const forma = (this.apresentacao.trim() || 'Não informada').toLocaleLowerCase();

        const existente = medicamentos.find(
          (m) =>
            m.nome.trim().toLocaleLowerCase() === nome &&
            m.dosagem.trim().toLocaleLowerCase() === dosagem &&
            m.forma_farmaceutica.trim().toLocaleLowerCase() === forma,
        );

        if (existente) {
          this.salvarPrescricao(existente.id, quantidade, horarios);
          return;
        }

        this.medicamentoService
          .criar({
            nome: this.nome.trim(),
            dosagem: this.concentracao.trim() || 'Não informada',
            forma_farmaceutica: this.apresentacao.trim() || 'Não informada',
            descricao: null,
          })
          .subscribe({
            next: (medicamento) => this.salvarPrescricao(medicamento.id, quantidade, horarios),
            error: (erro) => this.falha(erro),
          });
      },
      error: (erro) => this.falha(erro),
    });
  }

  private salvarPrescricao(medicamentoId: number, quantidade: number, horarios: string[]): void {
    const dados: PrescricaoCreate = {
      paciente_id: this.pacienteId!,
      medicamento_id: medicamentoId,
      origem_informacao: this.origem === 'prescricao' ? 'receita_medica' : 'manual',
      modo_agendamento: 'horarios_fixos',
      intervalo_horas: null,
      frequencia: this.frequencia,
      horarios,
      dias_semana: null,
      horario_inicial: null,
      quantidade_por_dose: quantidade,
      unidade_quantidade: this.unidadeDose,
      tipo_duracao: this.dataFim ? 'temporario' : 'continuo',
      data_inicio: this.dataInicio,
      data_fim: this.dataFim || null,
      data_reavaliacao: null,
      orientacoes: this.observacoes.trim() || null,
    };

    this.prescricaoService.criar(dados).subscribe({
      next: (prescricao) => {
        this.prescricaoService.gerarDoses(prescricao.id).subscribe({
          next: () => {
            this.salvando = false;
            this.salvo = true;
            this.mensagem = 'Tratamento salvo com sucesso! Redirecionando...';

            setTimeout(() => {
              this.router.navigate(['/tabs/remedios']);
            }, 1500);
          },
          error: (erro) =>
            this.falha(erro, 'A prescrição foi salva, mas houve um erro ao gerar os horários das doses.'),
        });
      },
      error: (erro) => this.falha(erro),
    });
  }

  private falha(erro: any, mensagemPadrao = 'Não foi possível salvar o tratamento.'): void {
    console.error('Erro ao salvar tratamento:', erro);
    this.salvando = false;
    this.mensagem = erro?.error?.detail || mensagemPadrao;
  }
}
