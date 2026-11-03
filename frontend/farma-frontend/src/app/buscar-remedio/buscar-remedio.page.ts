
// ===== IMPORTAÇÕES =====
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import {
  IonContent,
  IonIcon,
  IonInput,
  IonButton,
} from '@ionic/angular';

import { addIcons } from 'ionicons';

// ===== ÍCONES DA PESQUISA =====
import {
  searchOutline,
  arrowBackOutline,
  informationCircleOutline,
} from 'ionicons/icons';

// ===== COMPONENTE DA TELA =====
@Component({
  selector: 'app-buscar-remedio',
  templateUrl: './buscar-remedio.page.html',
  styleUrls: ['./buscar-remedio.page.scss'],
  imports: [
    IonContent,
    IonIcon,
    IonInput,
    IonButton,
    FormsModule,
    RouterLink,
  ],
})
export class BuscarRemedioPage {

  // ===== CAMPO DE PESQUISA =====
  nomeRemedio = '';
  mensagem = '';

  constructor() {
    // ===== REGISTRO DOS ÍCONES =====
    addIcons({
      searchOutline,
      arrowBackOutline,
      informationCircleOutline,
    });
  }

  // ===== PESQUISA DO MEDICAMENTO =====
  pesquisar() {
    if (!this.nomeRemedio.trim()) {
      this.mensagem = 'Digite o nome de um medicamento.';
      return;
    }

    this.mensagem =
      'A pesquisa será conectada ao catálogo de medicamentos quando a API estiver disponível.';
  }
}
