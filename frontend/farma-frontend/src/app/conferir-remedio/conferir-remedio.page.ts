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

@Component({
  selector: 'app-conferir-remedio',
  templateUrl: './conferir-remedio.page.html',
  styleUrls: ['./conferir-remedio.page.scss'],
  imports: [IonContent, IonIcon],
})
export class ConferirRemedioPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

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

  confirmar(): void {
    this.mensagem =
      'As informações foram conferidas. O salvamento estará disponível quando o aplicativo estiver integrado ao sistema.';
  }
}
