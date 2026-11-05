// ===== IMPORTAÇÕES =====
import { Component } from '@angular/core';
import { IonContent, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
// ===== ÍCONES DO PERFIL =====
import {
  personOutline,
  notificationsOutline,
  accessibilityOutline,
  peopleOutline,
  shieldCheckmarkOutline,
  informationCircleOutline,
  logOutOutline,
  chevronForwardOutline,
} from 'ionicons/icons';

// ===== COMPONENTE DO PERFIL =====
@Component({
  selector: 'app-pagina-placeholder',
  templateUrl: './pagina-placeholder.page.html',
  styleUrls: ['./pagina-placeholder.page.scss'],
  imports: [IonContent, IonIcon],
})
export class PaginaPlaceholderPage {
  // ===== REGISTRO DOS ÍCONES =====
  constructor() {
    addIcons({
      personOutline,
      notificationsOutline,
      accessibilityOutline,
      peopleOutline,
      shieldCheckmarkOutline,
      informationCircleOutline,
      logOutOutline,
      chevronForwardOutline,
    });
  }
}
