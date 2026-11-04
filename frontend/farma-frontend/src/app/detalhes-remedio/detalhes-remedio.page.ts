// ===== IMPORTAÇÕES =====
import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';

// ===== ÍCONES DA TELA =====
import {
  arrowBackOutline,
  medkitOutline,
  calendarOutline,
  timeOutline,
  informationCircleOutline,
} from 'ionicons/icons';

// ===== COMPONENTE DE DETALHES =====
@Component({
  selector: 'app-detalhes-remedio',
  templateUrl: './detalhes-remedio.page.html',
  styleUrls: ['./detalhes-remedio.page.scss'],
  imports: [IonContent, IonIcon, RouterLink],
})
export class DetalhesRemedioPage {

  // ===== DADOS DO MEDICAMENTO =====
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

  // ===== VERIFICA SE RECEBEU UM MEDICAMENTO =====
  temMedicamento = false;

  constructor(private route: ActivatedRoute) {
    // ===== REGISTRO DOS ÍCONES =====
    addIcons({
      arrowBackOutline,
      medkitOutline,
      calendarOutline,
      timeOutline,
      informationCircleOutline,
    });

    // ===== RECEBE OS DADOS PELA ROTA =====
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

      // ===== CONFERE SE EXISTE UM NOME RECEBIDO =====
      this.temMedicamento = this.nome.trim().length > 0;
    });
  }
}