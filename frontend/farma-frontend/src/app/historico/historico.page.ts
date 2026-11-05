// ===== IMPORTAÇÕES =====
import { Component } from '@angular/core';
import { IonContent, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
// ===== ÍCONES DO HISTÓRICO =====
import { timeOutline, calendarOutline, informationCircleOutline, medkitOutline } from 'ionicons/icons';

// ===== COMPONENTE DO HISTÓRICO =====
@Component({
  selector: 'app-historico',
  templateUrl: './historico.page.html',
  styleUrls: ['./historico.page.scss'],
  imports: [IonContent, IonIcon],
})
export class HistoricoPage {
  // ===== REGISTRO DOS ÍCONES =====
  constructor() {
    addIcons({
      timeOutline,
      calendarOutline,
      informationCircleOutline,
      medkitOutline,
    });
  }
}
