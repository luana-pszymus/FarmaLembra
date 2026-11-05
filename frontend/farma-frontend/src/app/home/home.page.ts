import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
// ===== ÍCONES UTILIZADOS NA HOME =====
import {
  addOutline,
  alarmOutline,
  heart,
  medkitOutline,
  timeOutline,
  personOutline,
  chevronForwardOutline,
  notificationsOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  imports: [IonContent, IonIcon, RouterLink],
})
export class HomePage {
  constructor() {
    // ===== REGISTRO DOS ÍCONES =====
    addIcons({
      addOutline,
      alarmOutline,
      heart,
      medkitOutline,
      timeOutline,
      personOutline,
      chevronForwardOutline,
      notificationsOutline,
    });
  }
}
