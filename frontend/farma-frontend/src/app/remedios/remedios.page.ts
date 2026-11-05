import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
// ===== ÍCONES DA TELA DE REMÉDIOS =====
import { addOutline, medkitOutline, searchOutline, informationCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-remedios',
  templateUrl: './remedios.page.html',
  styleUrls: ['./remedios.page.scss'],
  imports: [IonContent, IonIcon, RouterLink],
})
export class RemediosPage {
  constructor() {
    // ===== REGISTRO DOS ÍCONES =====
    addIcons({
      addOutline,
      medkitOutline,
      searchOutline,
      informationCircleOutline,
    });
  }
}
