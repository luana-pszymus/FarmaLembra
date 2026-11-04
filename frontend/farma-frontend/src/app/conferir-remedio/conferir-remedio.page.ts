// ===== IMPORTAÇÕES =====
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';

// ===== ÍCONES DA REVISÃO =====
import {
  arrowBackOutline,
  medkitOutline,
  calendarOutline,
  timeOutline,
  informationCircleOutline,
  checkmarkCircleOutline,
} from 'ionicons/icons';

// ===== COMPONENTE DE REVISÃO =====
@Component({
  selector: 'app-conferir-remedio',
  templateUrl: './conferir-remedio.page.html',
  styleUrls: ['./conferir-remedio.page.scss'],
  imports: [IonContent, IonIcon],
})
export class ConferirRemedioPage {

  // ===== DADOS RECEBIDOS =====
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

  // ===== MENSAGEM DA CONFIRMAÇÃO =====
  mensagem = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {
    // ===== REGISTRO DOS ÍCONES =====
    addIcons({
      arrowBackOutline,
      medkitOutline,
      calendarOutline,
      timeOutline,
      informationCircleOutline,
      checkmarkCircleOutline,
    });

    // ===== RECEBE OS DADOS DO FORMULÁRIO =====
    this.route.queryParamMap.subscribe((params) => {
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

  // ===== VOLTA PARA EDITAR OS DADOS =====
  editar() {
    this.router.navigate(['/tabs/remedios/novo/dados'], {
      queryParams: {
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

  // ===== CONFIRMAÇÃO DO CADASTRO =====
  confirmar() {
    this.mensagem =
      'As informações foram conferidas. O salvamento estará disponível quando o aplicativo estiver integrado ao sistema.';
  }
}