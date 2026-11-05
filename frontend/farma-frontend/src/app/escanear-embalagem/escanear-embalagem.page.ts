import { Component, inject } from '@angular/core';
import type { OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  arrowForwardOutline,
  cameraOutline,
  imageOutline,
  informationCircleOutline,
  trashOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-escanear-embalagem',
  templateUrl: './escanear-embalagem.page.html',
  styleUrls: ['./escanear-embalagem.page.scss'],
  imports: [IonContent, IonIcon, RouterLink],
})
export class EscanearEmbalagemPage implements OnDestroy {
  private readonly router = inject(Router);

  fotoUrl: string | null = null;
  mensagem = '';

  constructor() {
    addIcons({
      arrowBackOutline,
      cameraOutline,
      imageOutline,
      informationCircleOutline,
      trashOutline,
      arrowForwardOutline,
    });
  }

  selecionarFoto(event: Event): void {
    const campo = event.target as HTMLInputElement;
    const arquivo = campo.files?.[0];

    if (!arquivo) {
      return;
    }

    if (!arquivo.type.startsWith('image/')) {
      this.mensagem = 'Selecione um arquivo de imagem.';
      campo.value = '';
      return;
    }

    this.limparFoto();

    this.fotoUrl = URL.createObjectURL(arquivo);
    this.mensagem = 'Foto selecionada! Confira se a embalagem está legível.';
  }

  limparFoto(): void {
    if (this.fotoUrl) {
      URL.revokeObjectURL(this.fotoUrl);
    }

    this.fotoUrl = null;
    this.mensagem = '';
  }

  continuar(): void {
    if (!this.fotoUrl) {
      this.mensagem = 'Primeiro, tire uma foto ou escolha uma imagem.';
      return;
    }

    this.router.navigate(['/tabs/remedios/novo/dados'], {
      queryParams: {
        origem: 'embalagem',
      },
    });
  }

  ngOnDestroy(): void {
    this.limparFoto();
  }
}
