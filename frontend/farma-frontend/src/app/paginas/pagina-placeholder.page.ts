
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  medkitOutline,
  timeOutline,
  personOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-pagina-placeholder',
  templateUrl: './pagina-placeholder.page.html',
  styleUrls: ['./pagina-placeholder.page.scss'],
  imports: [IonContent, IonIcon],
})
export class PaginaPlaceholderPage {
  titulo = '';
  descricao = '';
  icone = '';

  constructor(private rota: ActivatedRoute) {
    const dados = this.rota.snapshot.data;

    this.titulo = dados['titulo'];
    this.descricao = dados['descricao'];
    this.icone = dados['icone'];

    addIcons({
      medkitOutline,
      timeOutline,
      personOutline,
    });
  }
}

