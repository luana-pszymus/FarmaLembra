
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';

// ===== ÍCONES DAS FORMAS DE CADASTRO =====
import {
  documentTextOutline,
  cameraOutline,
  searchOutline,
  chevronForwardOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-adicionar-remedio',
  templateUrl: './adicionar-remedio.page.html',
  styleUrls: ['./adicionar-remedio.page.scss'],
  imports: [IonContent, IonIcon, RouterLink],
})
export class AdicionarRemedioPage {
  constructor() {
    // ===== REGISTRO DOS ÍCONES =====
    addIcons({
      documentTextOutline,
      cameraOutline,
      searchOutline,
      chevronForwardOutline,
    });
  }
}
