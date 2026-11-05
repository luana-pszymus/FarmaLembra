import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  calendarOutline,
  informationCircleOutline,
  medkitOutline,
  timeOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-detalhes-remedio',
  templateUrl: './detalhes-remedio.page.html',
  styleUrls: ['./detalhes-remedio.page.scss'],
  imports: [IonContent, IonIcon, RouterLink],
})
export class DetalhesRemedioPage {
  private readonly route = inject(ActivatedRoute);

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

  temMedicamento = false;

  constructor() {
    addIcons({
      arrowBackOutline,
      medkitOutline,
      calendarOutline,
      timeOutline,
      informationCircleOutline,
    });

    this.route.queryParamMap.subscribe((params) => {
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

      this.temMedicamento = this.nome.trim().length > 0;
    });
  }
}
