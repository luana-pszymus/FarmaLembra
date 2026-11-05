import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonButton, IonContent, IonIcon, IonInput } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { arrowBackOutline, informationCircleOutline, searchOutline } from 'ionicons/icons';

@Component({
  selector: 'app-buscar-remedio',
  templateUrl: './buscar-remedio.page.html',
  styleUrls: ['./buscar-remedio.page.scss'],
  imports: [IonContent, IonIcon, IonInput, IonButton, FormsModule, RouterLink],
})
export class BuscarRemedioPage {
  private readonly router = inject(Router);

  nomeRemedio = '';
  mensagem = '';

  constructor() {
    addIcons({
      searchOutline,
      arrowBackOutline,
      informationCircleOutline,
    });
  }

  pesquisar(): void {
    if (!this.nomeRemedio.trim()) {
      this.mensagem = 'Digite o nome de um medicamento.';
      return;
    }

    this.router.navigate(['/tabs/remedios/novo/dados'], {
      queryParams: {
        nome: this.nomeRemedio.trim(),
        origem: 'pesquisa',
      },
    });
  }
}
